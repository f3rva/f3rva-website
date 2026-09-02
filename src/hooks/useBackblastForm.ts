import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { config } from '../config';
import { AOSummary, AddWorkoutPayload, UpdateWorkoutPayload, WorkoutCreatedResponse } from '../types/bigdata';
import { WorkoutPost } from '../types/WorkoutPost';

const DRAFT_STORAGE_KEY = 'f3rva_backblast_draft';

export interface BackblastFormData {
  title: string;
  workoutDate: string;
  aoName: string;
  aoSlug: string;
  qic: string;
  pax: string;
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

export function useBackblastForm(workoutId?: number) {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();

  const isEditMode = Boolean(workoutId);

  const initialDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState<BackblastFormData>({
    title: '',
    workoutDate: initialDate,
    aoName: '',
    aoSlug: '',
    qic: '',
    pax: '',
    body: '',
    slug: '',
  });

  const [aos, setAos] = useState<AOSummary[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState<boolean>(false);

  // Fetch available AOs
  useEffect(() => {
    let isMounted = true;
    const fetchAOs = async () => {
      try {
        const res = await fetch(`${config.apiBaseUrl}/v2/workouts/aos`);
        if (res.ok) {
          const data: AOSummary[] = await res.json();
          if (isMounted) setAos(data);
        }
      } catch {
        // Silently fallback if AOs list endpoint fails
      }
    };
    fetchAOs();
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
            const firstAo = data.ao && data.ao.length > 0 ? data.ao[0] : null;
            const qNames = data.q ? (Array.isArray(data.q) ? data.q.map(q => q.f3Name).join(', ') : '') : '';
            const paxNames = data.pax ? (Array.isArray(data.pax) ? data.pax.map(p => p.f3Name).join(', ') : '') : '';

            setFormData({
              title: data.title || '',
              workoutDate: data.workoutDate || initialDate,
              aoName: firstAo?.description || '',
              aoSlug: firstAo?.slug || '',
              qic: qNames,
              pax: paxNames,
              body: data.content || '',
              slug: data.slug || '',
            });
            setSlugManuallyEdited(true);
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
          if (savedDraft && isMounted) {
            const parsed = JSON.parse(savedDraft);
            setFormData(prev => ({
              ...prev,
              ...parsed,
              // If user is logged in and qic is empty, default qic/pax to their F3 name
              qic: parsed.qic || (user?.f3Name ?? ''),
              pax: parsed.pax || (user?.f3Name ?? ''),
            }));
          } else if (isMounted && user?.f3Name) {
            setFormData(prev => ({
              ...prev,
              qic: user.f3Name,
              pax: user.f3Name,
            }));
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

  // Auto-save draft in create mode
  useEffect(() => {
    if (!isEditMode && !loadingInitial) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [formData, isEditMode, loadingInitial]);

  const updateField = useCallback((field: keyof BackblastFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-update slug if title changed and slug wasn't manually edited
      if (field === 'title' && !slugManuallyEdited) {
        updated.slug = slugify(value);
      }

      // If AO name is selected from list, auto-fill slug
      if (field === 'aoName') {
        const matchedAo = aos.find(a => a.description.toLowerCase() === value.toLowerCase());
        if (matchedAo?.slug) {
          updated.aoSlug = matchedAo.slug;
        } else {
          updated.aoSlug = slugify(value);
        }
      }

      return updated;
    });

    setValidationErrors(prev => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, [slugManuallyEdited, aos]);

  const setManualSlug = useCallback((slugValue: string) => {
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, slug: slugify(slugValue) }));
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.workoutDate) errors.workoutDate = 'Workout date is required.';
    if (!formData.aoName.trim()) errors.aoName = 'Area of Operations (AO) is required.';
    if (!formData.qic.trim()) errors.qic = 'At least one Q is required.';
    if (!formData.pax.trim()) errors.pax = 'At least one PAX attendee is required.';
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

    const aoPayload = [{
      name: formData.aoName.trim(),
      slug: formData.aoSlug.trim() || slugify(formData.aoName),
    }];

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };

    try {
      if (isEditMode && workoutId) {
        const payload: UpdateWorkoutPayload = {
          title: formData.title.trim(),
          workoutDate: formData.workoutDate,
          qic: formData.qic,
          pax: formData.pax,
          aos: aoPayload,
          body: formData.body,
          author: user?.f3Name || 'Admin',
          slug: formData.slug.trim() || slugify(formData.title),
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

        navigate(`/bigdata/workouts/${workoutId}`, { replace: true });
        return true;
      } else {
        const payload: AddWorkoutPayload = {
          title: formData.title.trim(),
          workoutDate: formData.workoutDate,
          qic: formData.qic,
          pax: formData.pax,
          aos: aoPayload,
          body: formData.body,
          author: user?.f3Name || 'Member',
          slug: formData.slug.trim() || slugify(formData.title),
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
        } catch {
          // Ignore localStorage error
        }

        navigate(`/bigdata/workouts/${data.id}`, { replace: true });
        return true;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving workout.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [validate, formData, getAuthHeaders, isEditMode, workoutId, user, navigate]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setFormData({
      title: '',
      workoutDate: initialDate,
      aoName: '',
      aoSlug: '',
      qic: user?.f3Name ?? '',
      pax: user?.f3Name ?? '',
      body: '',
      slug: '',
    });
    setSlugManuallyEdited(false);
    setValidationErrors({});
    setError(null);
  }, [initialDate, user]);

  return {
    formData,
    aos,
    loadingInitial,
    submitting,
    error,
    validationErrors,
    isEditMode,
    updateField,
    setManualSlug,
    submit,
    clearDraft,
  };
}
