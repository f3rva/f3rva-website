import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBackblastForm } from '../../hooks/useBackblastForm';
import { buildSlackAuthUrl } from '../../utils/slackAuth';
import { formatDisplayDate, getDateFromString } from '../../utils/dateUtils';
import RichTextEditor from '../../components/RichTextEditor';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import PaxMultiSelect from '../../components/PaxMultiSelect';
import AoMultiSelect from '../../components/AoMultiSelect';
import SEO from '../../components/SEO';
import {
  FaSlack,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaUserCheck,
  FaPen,
  FaTrashAlt,
  FaSave,
  FaUserPlus,
  FaGlobeAmericas,
  FaHistory,
} from 'react-icons/fa';
import './BackblastForm.css';

export const BackblastForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const workoutId = id ? parseInt(id, 10) : undefined;
  const { isAuthenticated, user } = useAuth();

  const {
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
  } = useBackblastForm(workoutId);

  const formattedWorkoutDate = React.useMemo(() => {
    if (!formData.workoutDate || !/^\d{4}-\d{2}-\d{2}$/.test(formData.workoutDate)) {
      return null;
    }
    return formatDisplayDate(formData.workoutDate);
  }, [formData.workoutDate]);

  const pastDateDaysAgo = React.useMemo(() => {
    if (isEditMode || !formData.workoutDate || !/^\d{4}-\d{2}-\d{2}$/.test(formData.workoutDate)) {
      return 0;
    }
    if (formData.workoutDate >= todayDate) {
      return 0;
    }
    const selected = getDateFromString(formData.workoutDate);
    const today = getDateFromString(todayDate);
    return Math.round((today.getTime() - selected.getTime()) / (24 * 60 * 60 * 1000));
  }, [formData.workoutDate, todayDate, isEditMode]);

  const regularPaxMembers = React.useMemo(
    () => (members || []).filter((m) => !m.isDr),
    [members]
  );
  const drMembers = React.useMemo(
    () => (members || []).filter((m) => !!m.isDr),
    [members]
  );

  const duplicateFngs = React.useMemo(() => {
    const originalFngSet = new Set((originalFngs || []).map((f) => f.trim().toLowerCase()));
    const memberNameSet = new Set((members || []).map((m) => m.f3Name.trim().toLowerCase()));
    return formData.fngs.filter((fng) => {
      const lower = fng.trim().toLowerCase();
      // Allow FNGs that were already registered as FNGs on this specific workout
      if (originalFngSet.has(lower)) {
        return false;
      }
      return memberNameSet.has(lower);
    });
  }, [formData.fngs, members, originalFngs]);

  const handleSlackLoginClick = () => {
    sessionStorage.setItem('f3rva_auth_return_to', window.location.pathname);
    const slackAuthUrl = buildSlackAuthUrl(window.location.pathname);
    if (slackAuthUrl) {
      window.location.href = slackAuthUrl;
    } else {
      alert('Slack Client ID is not configured in this environment.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="backblast-auth-required-container">
        <SEO
          title="Post a Backblast | F3 RVA"
          description="Log in with Slack to post and manage F3 RVA backblasts."
        />
        <div className="backblast-auth-card">
          <div className="auth-icon-wrapper">
            <FaSlack className="slack-icon" />
          </div>
          <h1>Sign in with Slack</h1>
          <p>
            You must be signed in with your F3 RVA Slack account to create or edit workout backblasts.
          </p>
          <button type="button" className="btn-slack-login" onClick={handleSlackLoginClick}>
            <FaSlack /> Sign In with Slack
          </button>
          <p className="auth-footer-note">
            Need an account? Join us at a workout or reach out on our <Link to="/schedule">weekly schedule</Link>!
          </p>
        </div>
      </div>
    );
  }

  if (loadingInitial) {
    return (
      <div className="backblast-loading-container">
        <LoadingSpinner message={isEditMode ? 'Loading workout details...' : 'Initializing backblast form...'} />
      </div>
    );
  }

  const missingQs = formData.qic.filter(
    (q) => !formData.pax.some((p) => p.trim().toLowerCase() === q.trim().toLowerCase())
  );

  return (
    <div className="backblast-form-container">
      <SEO
        title={isEditMode ? `Edit Backblast: ${formData.title || 'Workout'} | F3 RVA` : 'Post a Backblast | F3 RVA'}
        description="Submit a new workout backblast to F3 RVA Big Data."
      />

      <div className="backblast-form-header">
        <div className="header-titles">
          <h1>{isEditMode ? 'Edit Backblast' : 'Post a Backblast'}</h1>
          <div className="header-meta-row">
            <p className="header-author-badge">
              Posting as: <strong>{user?.f3Name}</strong> {user?.role === 'admin' ? '(Admin)' : ''}
            </p>
            {lastSaved && !isEditMode && (
              <span className="draft-saved-indicator" title={lastSaved.toLocaleString()}>
                <FaSave /> Auto-saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        {!isEditMode && (isDirty || Boolean(lastSaved)) && (
          <button type="button" className="btn-clear-draft" onClick={clearDraft} title="Clear saved draft">
            <FaTrashAlt /> Clear Draft
          </button>
        )}
      </div>

      {!isEditMode && pendingDraft && (
        <div className="draft-recovery-banner" role="status">
          <div className="draft-recovery-content">
            <FaHistory className="draft-recovery-icon" aria-hidden="true" />
            <div className="draft-recovery-text">
              <strong>Unsaved draft found</strong> from{' '}
              {pendingDraft.savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              {pendingDraft.data.title.trim() ? ` (“${pendingDraft.data.title.trim()}”)` : ''}.
            </div>
          </div>
          <div className="draft-recovery-actions">
            <button
              type="button"
              className="btn-restore-draft"
              onClick={restoreDraft}
              disabled={submitting}
            >
              Restore Draft
            </button>
            <button
              type="button"
              className="btn-discard-draft"
              onClick={discardDraft}
              disabled={submitting}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="backblast-alert-error" role="alert">
          {error}
        </div>
      )}

      <form
        className="backblast-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
      >
        {/* Title & Slug Section */}
        <div className="form-group">
          <label htmlFor="bb-title">
            <FaPen className="field-icon" /> Workout Title <span className="required">*</span>
          </label>
          <input
            id="bb-title"
            type="text"
            className={`form-input ${validationErrors.title ? 'has-error' : ''}`}
            placeholder="e.g. Iron Sharpens Iron at First Watch"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            disabled={submitting}
          />
          {validationErrors.title && <span className="field-error">{validationErrors.title}</span>}

          <div className="slug-preview">
            <span className="slug-label">URL Slug:</span>
            <input
              type="text"
              className="slug-input"
              value={formData.slug}
              onChange={(e) => setManualSlug(e.target.value)}
              placeholder="auto-generated-slug"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Date & AO Row */}
        <div className="form-row">
          <div className="form-group col-half">
            <div className="date-field-header">
              <label htmlFor="bb-date" className="date-field-label">
                <FaCalendarAlt className="field-icon" /> Workout Date <span className="required">*</span>
              </label>
              {formattedWorkoutDate && (
                <span className="date-weekday-preview" aria-live="polite">
                  {formattedWorkoutDate}
                </span>
              )}
            </div>
            <div className="date-field-help">Date when the beatdown took place.</div>
            <input
              id="bb-date"
              type="date"
              max={todayDate}
              className={`form-input date-input ${validationErrors.workoutDate ? 'has-error' : ''}`}
              value={formData.workoutDate}
              onChange={(e) => updateField('workoutDate', e.target.value)}
              disabled={submitting}
            />
            {validationErrors.workoutDate && <span className="field-error">{validationErrors.workoutDate}</span>}
            {pastDateDaysAgo > 0 && !validationErrors.workoutDate && (
              <div className="date-past-warning" role="status">
                <span>
                  <strong>Heads up:</strong> You&apos;re posting for{' '}
                  <strong>{pastDateDaysAgo === 1 ? 'yesterday' : `${pastDateDaysAgo} days ago`}</strong>
                  {formattedWorkoutDate ? ` (${formattedWorkoutDate})` : ''}.
                </span>
                <button
                  type="button"
                  className="btn-reset-today"
                  onClick={resetDateToToday}
                  disabled={submitting}
                >
                  Set to Today
                </button>
              </div>
            )}
          </div>

          <div className="form-group col-half">
            <AoMultiSelect
              id="bb-ao"
              label="Area of Operations (AO)"
              icon={<FaMapMarkerAlt />}
              placeholder="Select or type AO (e.g. First Watch, Dogpile)..."
              helpText="Host AO location(s) for the workout."
              aos={aos}
              loadingAos={loadingAos}
              selectedNames={formData.aoNames}
              onChange={(names) => updateField('aoNames', names)}
              disabled={submitting}
            />
            {validationErrors.aoNames && <span className="field-error">{validationErrors.aoNames}</span>}
          </div>
        </div>

        {/* Qs and PAX Attendance Row */}
        <div className="form-row">
          <div className="form-group col-half">
            <PaxMultiSelect
              id="bb-qic"
              label="Q / Co-Q(s)"
              icon={<FaUserCheck />}
              placeholder="Select Q from roster..."
              helpText="Leader(s) who designed and executed the workout."
              members={regularPaxMembers}
              loadingMembers={loadingMembers}
              selectedNames={formData.qic}
              onChange={(names) => updateField('qic', names)}
              disabled={submitting}
              allowCustom={false}
            />
            {validationErrors.qic && <span className="field-error">{validationErrors.qic}</span>}
          </div>

          <div className="form-group col-half">
            <PaxMultiSelect
              id="bb-pax"
              label="PAX Attendees"
              icon={<FaUsers />}
              placeholder="Select PAX from roster..."
              helpText="Registered F3 RVA PAX present, including Qs."
              members={regularPaxMembers}
              loadingMembers={loadingMembers}
              selectedNames={formData.pax}
              onChange={(names) => updateField('pax', names)}
              disabled={submitting}
              allowCustom={false}
            />
            {validationErrors.pax && <span className="field-error">{validationErrors.pax}</span>}

            {missingQs.length > 0 && (
              <button
                type="button"
                className="btn-sync-q-to-pax"
                onClick={addQToPax}
                title="Add missing Q(s) to attendance list"
              >
                <FaUserPlus /> + Add Q(s) to PAX ({missingQs.join(', ')})
              </button>
            )}
          </div>
        </div>

        {/* FNGs and Downrange PAX Row */}
        <div className="form-row">
          <div className="form-group col-half">
            <PaxMultiSelect
              id="bb-fngs"
              label="Friendly New Guys (FNGs)"
              icon={<FaUserPlus />}
              placeholder="Type FNG name (e.g. Hemorrhoid) and press Enter..."
              helpText="First-time workout participants only. Do not add '(FNG)'."
              selectedNames={formData.fngs}
              onChange={(names) => updateField('fngs', names)}
              disabled={submitting}
              onlyCustom={true}
              onValidateAdd={(name) => name.replace(/\s*\(\s*fng\s*\)\s*$/i, '').trim()}
            />
            {duplicateFngs.length > 0 && (
              <div className="fng-duplicate-warning" role="alert">
                <strong>Notice:</strong> &quot;{duplicateFngs.join(', ')}&quot; is already a registered member in the roster. FNGs should only be first-time participants. If this is a returning PAX, please add them under PAX Attendees instead.
              </div>
            )}
          </div>

          <div className="form-group col-half">
            <PaxMultiSelect
              id="bb-drs"
              label="Downrange PAX (DR)"
              icon={<FaGlobeAmericas />}
              placeholder="e.g. Sparky (Carpex)"
              helpText="Visiting PAX from other F3 regions."
              members={drMembers}
              loadingMembers={loadingMembers}
              selectedNames={formData.drs}
              onChange={(names) => updateField('drs', names)}
              disabled={submitting}
              allowCustom={true}
              customBadgeText="Downrange"
            />
          </div>
        </div>

        {/* Rich Text Editor for Backblast Narrative */}
        <div className="form-group">
          <label htmlFor="bb-body">
            Backblast Narrative & Workout Notes <span className="required">*</span>
          </label>
          <RichTextEditor
            content={formData.body}
            onChange={(html) => updateField('body', html)}
            disabled={submitting}
          />
          {validationErrors.body && <span className="field-error">{validationErrors.body}</span>}
        </div>

        {/* Submission Actions */}
        <div className="form-actions">
          <div className="attendance-summary-badge">
            <span className="attendance-summary-primary">
              <FaUsers /> {formData.pax.length + formData.fngs.length + formData.drs.length} Total Attendees
            </span>
            <span className="attendance-summary-details">
              ({formData.pax.length} PAX
              {formData.fngs.length > 0 ? `, ${formData.fngs.length} FNG` : ''}
              {formData.drs.length > 0 ? `, ${formData.drs.length} DR` : ''}) • {formData.qic.length} Q
              {formData.qic.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="action-buttons-group">
            <Link to="/" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving Backblast...' : isEditMode ? 'Update Backblast' : 'Publish Backblast'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BackblastForm;
