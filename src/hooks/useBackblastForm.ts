import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { config } from '../config';
import { BACKBLAST_DRAFT_TTL_MS } from '../config/constants';
import { formatDateToISO } from '../utils/dateUtils';
import {
  AOSummary,
  MemberSummary,
  AddWorkoutPayload,
  UpdateWorkoutPayload,
  WorkoutCreatedResponse,
  WorkoutUpdatedResponse,
} from '../types/bigdata';
import { WorkoutPost } from '../types/WorkoutPost';

const DRAFT_STORAGE_KEY = 'f3rva_backblast_draft';
const DRAFT_TIMESTAMP_KEY = 'f3rva_backblast_draft_time';

export interface BackblastFormData {
  title: string;
  workoutDate: string;
  aoNames: string[];
  qic: string[];
  pax: string[];
  fngs: string[];
  drs: string[];
  body: string;
  slug: string;
}

export interface PendingBackblastDraft {
  data: BackblastFormData;
  dateManuallyEdited: boolean;
  savedAt: Date;
}

interface StoredDraftPayload extends Partial<BackblastFormData> {
  aoName?: string;
  dateManuallyEdited?: boolean;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseNames(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function listsMatchDefault(list: string[], defaultName?: string): boolean {
  if (!defaultName) {
    return list.length === 0;
  }
  return list.length === 1 && list[0].trim().toLowerCase() === defaultName.trim().toLowerCase();
}

function hasSubstantiveDraftContent(data: BackblastFormData, defaultName?: string): boolean {
  const trimmedBody = data.body.trim();
  const hasBody = trimmedBody.length > 0 && trimmedBody !== '<p></p>';
  return (
    data.title.trim().length > 0 ||
    data.aoNames.length > 0 ||
    data.fngs.length > 0 ||
    data.drs.length > 0 ||
    hasBody ||
    !listsMatchDefault(data.qic, defaultName) ||
    !listsMatchDefault(data.pax, defaultName)
  );
}

function clearStoredDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

export function useBackblastForm(workoutId?: number) {
  const navigate = useNavigate();
  const { user, isAuthenticated, getAuthHeaders } = useAuth();

  const isEditMode = Boolean(workoutId);

  const [todayDate, setTodayDate] = useState<string>(() => formatDateToISO(new Date()));

  const [formData, setFormData] = useState<BackblastFormData>(() => ({
    title: '',
    workoutDate: formatDateToISO(new Date()),
    aoNames: [],
    qic: [],
    pax: [],
    fngs: [],
    drs: [],
    body: '',
    slug: '',
  }));

  const [aos, setAos] = useState<AOSummary[]>([]);
  const [loadingAos, setLoadingAos] = useState<boolean>(true);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState<boolean>(false);
  const [dateManuallyEdited, setDateManuallyEdited] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PendingBackblastDraft | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [originalFngs, setOriginalFngs] = useState<string[]>([]);

  const isInitialMount = useRef<boolean>(true);
  const hasSavedInSessionRef = useRef<boolean>(false);

  // Fetch available AOs
  useEffect(() => {
    let isMounted = true;
    const fetchAOs = async () => {
      setLoadingAos(true);
      try {
        const res = await fetch(`${config.apiBaseUrl}/v2/workouts/aos`);
        if (res.ok) {
          const data: AOSummary[] = await res.json();
          if (isMounted) setAos(data);
        }
      } catch {
        // Silently fallback if AOs list endpoint fails
      } finally {
        if (isMounted) setLoadingAos(false);
      }
    };
    fetchAOs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch F3 member roster for multi-select chips
  useEffect(() => {
    let isMounted = true;
    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const res = await fetch(`${config.apiBaseUrl}/v2/members?limit=1000`);
        if (res.ok) {
          const data = await res.json();
          const memberList: MemberSummary[] = Array.isArray(data) ? data : data.members || [];
          if (isMounted) setMembers(memberList);
        }
      } catch {
        // Silently handle member roster fetch error
      } finally {
        if (isMounted) setLoadingMembers(false);
      }
    };
    fetchMembers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize form: Load existing workout in edit mode, or start fresh & check for a valid draft in create mode
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setLoadingInitial(true);
      const currentToday = formatDateToISO(new Date());
      if (isMounted) {
        setTodayDate(currentToday);
      }

      if (isEditMode && workoutId) {
        try {
          const res = await fetch(`${config.apiBaseUrl}/v2/workouts/${workoutId}`);
          if (!res.ok) throw new Error('Workout not found.');
          const data: WorkoutPost = await res.json();

          if (isMounted) {
            const aoList = Array.isArray(data.ao)
              ? data.ao.map((a) => a.description || '').filter(Boolean)
              : [];
            const qNames = Array.isArray(data.q) ? data.q.map((q) => q.f3Name) : [];
            const paxNames = Array.isArray(data.pax) ? data.pax.map((p) => p.f3Name) : [];
            const fngNames = Array.isArray(data.fngs) ? data.fngs.map((f) => f.f3Name) : [];
            const drNames = Array.isArray(data.drs) ? data.drs.map((d) => d.f3Name) : [];

            setOriginalFngs(fngNames);
            setPendingDraft(null);

            setFormData({
              title: data.title || '',
              workoutDate: data.workoutDate || currentToday,
              aoNames: aoList,
              qic: qNames,
              pax: paxNames,
              fngs: fngNames,
              drs: drNames,
              body: data.content || '',
              slug: data.slug || '',
            });
            setSlugManuallyEdited(true);
            setDateManuallyEdited(true);
            setIsDirty(false);
          }
        } catch (err: unknown) {
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Failed to load workout details.');
          }
        } finally {
          if (isMounted) setLoadingInitial(false);
        }
      } else {
        // Create mode: Always start with a clean form defaulting to today's local date.
        // If a non-expired substantive draft exists, surface it via pendingDraft for explicit recovery.
        const userQ = user?.f3Name ? [user.f3Name] : [];

        if (isMounted) {
          setOriginalFngs([]);
          setFormData({
            title: '',
            workoutDate: currentToday,
            aoNames: [],
            qic: userQ,
            pax: userQ,
            fngs: [],
            drs: [],
            body: '',
            slug: '',
          });
          setSlugManuallyEdited(false);
          setDateManuallyEdited(false);
          setLastSaved(null);
          setIsDirty(false);
          setPendingDraft(null);
          hasSavedInSessionRef.current = false;
        }

        try {
          const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
          const savedTimestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);

          if (savedDraft) {
            const savedAt = savedTimestamp ? new Date(savedTimestamp) : null;
            const savedAtMs = savedAt ? savedAt.getTime() : Number.NaN;
            const isExpired =
              Number.isNaN(savedAtMs) || Date.now() - savedAtMs > BACKBLAST_DRAFT_TTL_MS;

            if (isExpired) {
              clearStoredDraft();
            } else {
              const parsed: StoredDraftPayload = JSON.parse(savedDraft);
              const parsedAos = parseNames(parsed.aoNames || parsed.aoName);
              const parsedQic = parseNames(parsed.qic);
              const parsedPax = parseNames(parsed.pax);

              const draftData: BackblastFormData = {
                title: typeof parsed.title === 'string' ? parsed.title : '',
                workoutDate:
                  typeof parsed.workoutDate === 'string' && parsed.workoutDate
                    ? parsed.workoutDate
                    : currentToday,
                aoNames: parsedAos,
                qic: parsedQic.length > 0 ? parsedQic : userQ,
                pax: parsedPax.length > 0 ? parsedPax : userQ,
                fngs: parseNames(parsed.fngs),
                drs: parseNames(parsed.drs),
                body: typeof parsed.body === 'string' ? parsed.body : '',
                slug: typeof parsed.slug === 'string' ? parsed.slug : '',
              };

              if (hasSubstantiveDraftContent(draftData, user?.f3Name) && savedAt) {
                if (isMounted) {
                  setPendingDraft({
                    data: draftData,
                    dateManuallyEdited: parsed.dateManuallyEdited === true,
                    savedAt,
                  });
                }
              } else {
                clearStoredDraft();
              }
            }
          }
        } catch {
          clearStoredDraft();
        } finally {
          if (isMounted) setLoadingInitial(false);
        }
      }
    };

    initialize();
    return () => {
      isMounted = false;
    };
  }, [isEditMode, workoutId, user?.f3Name]);

  // Keep todayDate fresh and auto-update unedited workoutDate if the tab stays open past midnight
  useEffect(() => {
    const syncCurrentDate = () => {
      if (document.visibilityState === 'hidden') return;
      const currentToday = formatDateToISO(new Date());
      setTodayDate((prevToday) => (prevToday === currentToday ? prevToday : currentToday));

      if (!isEditMode && !dateManuallyEdited) {
        setFormData((prev) =>
          prev.workoutDate === currentToday ? prev : { ...prev, workoutDate: currentToday }
        );
      }

      setPendingDraft((prev) => {
        if (!prev) return null;
        if (Date.now() - prev.savedAt.getTime() > BACKBLAST_DRAFT_TTL_MS) {
          clearStoredDraft();
          return null;
        }
        return prev;
      });
    };

    document.addEventListener('visibilitychange', syncCurrentDate);
    window.addEventListener('focus', syncCurrentDate);
    return () => {
      document.removeEventListener('visibilitychange', syncCurrentDate);
      window.removeEventListener('focus', syncCurrentDate);
    };
  }, [isEditMode, dateManuallyEdited]);

  // Auto-save draft in create mode (only when user has made substantive dirty edits while authenticated)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isEditMode && !loadingInitial && isDirty && isAuthenticated) {
      if (hasSubstantiveDraftContent(formData, user?.f3Name)) {
        try {
          const payload: StoredDraftPayload = {
            ...formData,
            dateManuallyEdited,
          };
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
          const now = new Date();
          localStorage.setItem(DRAFT_TIMESTAMP_KEY, now.toISOString());
          hasSavedInSessionRef.current = true;
          setLastSaved(now);
        } catch {
          // Ignore localStorage errors
        }
      } else if (hasSavedInSessionRef.current) {
        clearStoredDraft();
        hasSavedInSessionRef.current = false;
        setLastSaved(null);
      }
    }
  }, [formData, dateManuallyEdited, isEditMode, loadingInitial, isDirty, isAuthenticated, user?.f3Name]);

  // Prevent accidental navigation with unsaved modifications
  useEffect(() => {
    if (!isAuthenticated || !isDirty || submitting) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, isDirty, submitting]);

  const updateField = useCallback(
    <K extends keyof BackblastFormData>(field: K, value: BackblastFormData[K]) => {
      if (field === 'body' && typeof value === 'string') {
        const isIncomingEmpty = !value.trim() || value.trim() === '<p></p>';
        const isCurrentEmpty = !formData.body.trim() || formData.body.trim() === '<p></p>';
        if (isIncomingEmpty && isCurrentEmpty) {
          return;
        }
      }

      setFormData((prev) => {
        const updated = { ...prev, [field]: value };

        // Auto-update slug if title changed and slug wasn't manually edited
        if (field === 'title' && !slugManuallyEdited && typeof value === 'string') {
          updated.slug = slugify(value);
        }

        return updated;
      });

      if (field === 'workoutDate') {
        setDateManuallyEdited(true);
      }

      setPendingDraft(null);
      setIsDirty(true);

      setValidationErrors((prev) => {
        if (prev[field]) {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return prev;
      });
    },
    [slugManuallyEdited, formData.body]
  );

  const setManualSlug = useCallback((slugValue: string) => {
    setSlugManuallyEdited(true);
    setPendingDraft(null);
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, slug: slugify(slugValue) }));
  }, []);

  const addQToPax = useCallback(() => {
    setFormData((prev) => {
      const existingSet = new Set(prev.pax.map((p) => p.trim().toLowerCase()));
      const missingQs = prev.qic.filter((q) => !existingSet.has(q.trim().toLowerCase()));
      if (missingQs.length === 0) return prev;
      return {
        ...prev,
        pax: [...prev.pax, ...missingQs],
      };
    });
    setPendingDraft(null);
    setIsDirty(true);
  }, []);

  const resetDateToToday = useCallback(() => {
    const currentToday = formatDateToISO(new Date());
    setTodayDate(currentToday);
    setFormData((prev) => ({ ...prev, workoutDate: currentToday }));
    setDateManuallyEdited(false);
    setValidationErrors((prev) => {
      if (prev.workoutDate) {
        const next = { ...prev };
        delete next.workoutDate;
        return next;
      }
      return prev;
    });
  }, []);

  const restoreDraft = useCallback(() => {
    if (!pendingDraft) return;
    const currentToday = formatDateToISO(new Date());
    setTodayDate(currentToday);

    const restoredDate =
      pendingDraft.dateManuallyEdited && pendingDraft.data.workoutDate
        ? pendingDraft.data.workoutDate
        : currentToday;

    setFormData({
      ...pendingDraft.data,
      workoutDate: restoredDate,
    });
    setDateManuallyEdited(pendingDraft.dateManuallyEdited);
    setSlugManuallyEdited(
      Boolean(pendingDraft.data.slug && pendingDraft.data.slug !== slugify(pendingDraft.data.title))
    );
    setLastSaved(pendingDraft.savedAt);
    hasSavedInSessionRef.current = true;
    setValidationErrors({});
    setError(null);
    setPendingDraft(null);
    setIsDirty(true);
  }, [pendingDraft]);

  const discardDraft = useCallback(() => {
    clearStoredDraft();
    hasSavedInSessionRef.current = false;
    setPendingDraft(null);
    setLastSaved(null);
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const currentToday = formatDateToISO(new Date());
    setTodayDate((prev) => (prev === currentToday ? prev : currentToday));

    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.workoutDate) {
      errors.workoutDate = 'Workout date is required.';
    } else if (formData.workoutDate > currentToday) {
      errors.workoutDate = 'Workout date cannot be in the future.';
    }
    if (formData.aoNames.length === 0) errors.aoNames = 'At least one Area of Operations (AO) is required.';
    if (formData.qic.length === 0) errors.qic = 'At least one Q is required.';
    if (formData.pax.length === 0 && formData.fngs.length === 0 && formData.drs.length === 0) {
      errors.pax = 'At least one attendee (PAX, FNG, or Downrange) is required.';
    }
    if (!formData.body.trim() || formData.body === '<p></p>') {
      errors.body = 'Backblast content cannot be empty.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!validate()) return false;

    setSubmitting(true);
    setError(null);

    const finalSlug = formData.slug.trim() || slugify(formData.title);

    const aoPayload = formData.aoNames.map((name) => {
      const trimmed = name.trim();
      const matchedAo = (aos || []).find(
        (a) => a && typeof a.description === 'string' && a.description.toLowerCase() === trimmed.toLowerCase()
      );
      return {
        name: trimmed,
        slug: matchedAo?.slug || slugify(trimmed),
      };
    });

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };

    try {
      if (isEditMode && workoutId) {
        const payload: UpdateWorkoutPayload = {
          title: formData.title.trim(),
          workoutDate: formData.workoutDate,
          qic: formData.qic.join(', '),
          pax: formData.pax.join(', '),
          fngs: formData.fngs.join(', '),
          drs: formData.drs.join(', '),
          aos: aoPayload,
          body: formData.body,
          author: user?.f3Name || 'Admin',
          slug: finalSlug,
        };

        const res = await fetch(`${config.apiBaseUrl}/v2/workouts/${workoutId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.errorMessage || 'Failed to update workout.');
        }

        const editData: WorkoutUpdatedResponse = await res.json().catch(() => ({ id: Number(workoutId) }));
        setIsDirty(false);

        const datePath = formData.workoutDate.replace(/-/g, '/');
        const defaultBackblastPath = `/${datePath}/${finalSlug}`;
        let targetPath = defaultBackblastPath;

        if (editData?.url) {
          try {
            const parsed = new URL(editData.url, window.location.origin);
            targetPath = (parsed.pathname + parsed.search).replace(/\/$/, '');
          } catch {
            targetPath = editData.url;
          }
        }

        if (targetPath.startsWith('/')) {
          navigate(targetPath, { replace: true });
        } else {
          window.location.href = targetPath;
        }
        return true;
      } else {
        const payload: AddWorkoutPayload = {
          title: formData.title.trim(),
          workoutDate: formData.workoutDate,
          qic: formData.qic.join(', '),
          pax: formData.pax.join(', '),
          fngs: formData.fngs.join(', '),
          drs: formData.drs.join(', '),
          aos: aoPayload,
          body: formData.body,
          author: user?.f3Name || 'Member',
          slug: finalSlug,
        };

        const res = await fetch(`${config.apiBaseUrl}/v2/workouts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.errorMessage || 'Failed to publish backblast.');
        }

        const data: WorkoutCreatedResponse = await res.json();
        // Clear saved draft on successful creation
        clearStoredDraft();
        hasSavedInSessionRef.current = false;

        const currentToday = formatDateToISO(new Date());
        setTodayDate(currentToday);
        setIsDirty(false);
        setDateManuallyEdited(false);
        setPendingDraft(null);
        setFormData({
          title: '',
          workoutDate: currentToday,
          aoNames: [],
          qic: user?.f3Name ? [user.f3Name] : [],
          pax: user?.f3Name ? [user.f3Name] : [],
          fngs: [],
          drs: [],
          body: '',
          slug: '',
        });
        setLastSaved(null);
        setSlugManuallyEdited(false);
        setValidationErrors({});
        setError(null);

        const datePath = formData.workoutDate.replace(/-/g, '/');
        const defaultBackblastPath = `/${datePath}/${finalSlug}`;
        let targetPath = defaultBackblastPath;

        if (data?.url) {
          try {
            const parsed = new URL(data.url, window.location.origin);
            targetPath = (parsed.pathname + parsed.search).replace(/\/$/, '');
          } catch {
            targetPath = data.url;
          }
        }

        if (targetPath.startsWith('/')) {
          navigate(targetPath, { replace: true });
        } else {
          window.location.href = targetPath;
        }
        return true;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving workout.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [validate, formData, aos, getAuthHeaders, isEditMode, workoutId, user, navigate]);

  const clearDraft = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your saved draft? All unsaved text will be lost.')) {
      clearStoredDraft();
      hasSavedInSessionRef.current = false;
      const currentToday = formatDateToISO(new Date());
      setTodayDate(currentToday);
      setOriginalFngs([]);
      setFormData({
        title: '',
        workoutDate: currentToday,
        aoNames: [],
        qic: user?.f3Name ? [user.f3Name] : [],
        pax: user?.f3Name ? [user.f3Name] : [],
        fngs: [],
        drs: [],
        body: '',
        slug: '',
      });
      setSlugManuallyEdited(false);
      setDateManuallyEdited(false);
      setValidationErrors({});
      setError(null);
      setLastSaved(null);
      setPendingDraft(null);
      setIsDirty(false);
    }
  }, [user]);

  return {
    formData,
    todayDate,
    aos,
    loadingAos,
    members,
    loadingMembers,
    loadingInitial,
    submitting,
    error,
    validationErrors,
    isEditMode,
    lastSaved,
    pendingDraft,
    isDirty,
    originalFngs,
    updateField,
    setManualSlug,
    addQToPax,
    resetDateToToday,
    restoreDraft,
    discardDraft,
    submit,
    clearDraft,
  };
}
