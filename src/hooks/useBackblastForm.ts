import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { config } from '../config';
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
  body: string;
  slug: string;
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

export function useBackblastForm(workoutId?: number) {
  const navigate = useNavigate();
  const { user, isAuthenticated, getAuthHeaders } = useAuth();

  const isEditMode = Boolean(workoutId);

  const initialDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState<BackblastFormData>({
    title: '',
    workoutDate: initialDate,
    aoNames: [],
    qic: [],
    pax: [],
    body: '',
    slug: '',
  });

  const [aos, setAos] = useState<AOSummary[]>([]);
  const [loadingAos, setLoadingAos] = useState<boolean>(true);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const isInitialMount = useRef<boolean>(true);

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

  // Initialize form: Load existing workout in edit mode, or load saved draft in create mode
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setLoadingInitial(true);

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

            setFormData({
              title: data.title || '',
              workoutDate: data.workoutDate || initialDate,
              aoNames: aoList,
              qic: qNames,
              pax: paxNames,
              body: data.content || '',
              slug: data.slug || '',
            });
            setSlugManuallyEdited(true);
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
        // Create mode: Check for saved draft
        try {
          const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
          const savedTimestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);

          if (savedDraft && isMounted) {
            const parsed = JSON.parse(savedDraft);
            const userQ = user?.f3Name ? [user.f3Name] : [];
            const parsedAos = parseNames(parsed.aoNames || parsed.aoName);

            setFormData({
              title: parsed.title || '',
              workoutDate: parsed.workoutDate || initialDate,
              aoNames: parsedAos,
              qic: parseNames(parsed.qic).length > 0 ? parseNames(parsed.qic) : userQ,
              pax: parseNames(parsed.pax).length > 0 ? parseNames(parsed.pax) : userQ,
              body: parsed.body || '',
              slug: parsed.slug || '',
            });

            if (savedTimestamp) {
              setLastSaved(new Date(savedTimestamp));
            }
          } else if (isMounted) {
            setFormData({
              title: '',
              workoutDate: initialDate,
              aoNames: [],
              qic: user?.f3Name ? [user.f3Name] : [],
              pax: user?.f3Name ? [user.f3Name] : [],
              body: '',
              slug: '',
            });
            setLastSaved(null);
            setIsDirty(false);
          }
        } catch {
          // Ignore localStorage errors
        } finally {
          if (isMounted) setLoadingInitial(false);
        }
      }
    };

    initialize();
    return () => {
      isMounted = false;
    };
  }, [isEditMode, workoutId, initialDate, user?.f3Name]);

  // Auto-save draft in create mode (only when user has made dirty edits while authenticated)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isEditMode && !loadingInitial && isDirty && isAuthenticated) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        const now = new Date();
        localStorage.setItem(DRAFT_TIMESTAMP_KEY, now.toISOString());
        setLastSaved(now);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [formData, isEditMode, loadingInitial, isDirty, isAuthenticated]);

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
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };

        // Auto-update slug if title changed and slug wasn't manually edited
        if (field === 'title' && !slugManuallyEdited && typeof value === 'string') {
          updated.slug = slugify(value);
        }

        return updated;
      });

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
    [slugManuallyEdited]
  );

  const setManualSlug = useCallback((slugValue: string) => {
    setSlugManuallyEdited(true);
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
    setIsDirty(true);
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.workoutDate) errors.workoutDate = 'Workout date is required.';
    if (formData.aoNames.length === 0) errors.aoNames = 'At least one Area of Operations (AO) is required.';
    if (formData.qic.length === 0) errors.qic = 'At least one Q is required.';
    if (formData.pax.length === 0) errors.pax = 'At least one PAX attendee is required.';
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
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
        } catch {
          // Ignore localStorage error
        }

        setIsDirty(false);
        setFormData({
          title: '',
          workoutDate: initialDate,
          aoNames: [],
          qic: user?.f3Name ? [user.f3Name] : [],
          pax: user?.f3Name ? [user.f3Name] : [],
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
  }, [validate, formData, aos, getAuthHeaders, isEditMode, workoutId, user, initialDate, navigate]);

  const clearDraft = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your saved draft? All unsaved text will be lost.')) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
      } catch {
        // Ignore
      }
      setFormData({
        title: '',
        workoutDate: initialDate,
        aoNames: [],
        qic: user?.f3Name ? [user.f3Name] : [],
        pax: user?.f3Name ? [user.f3Name] : [],
        body: '',
        slug: '',
      });
      setSlugManuallyEdited(false);
      setValidationErrors({});
      setError(null);
      setLastSaved(null);
      setIsDirty(false);
    }
  }, [initialDate, user]);

  return {
    formData,
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
    isDirty,
    updateField,
    setManualSlug,
    addQToPax,
    submit,
    clearDraft,
  };
}
