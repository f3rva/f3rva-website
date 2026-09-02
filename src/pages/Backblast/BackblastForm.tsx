import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBackblastForm } from '../../hooks/useBackblastForm';
import { config } from '../../config';
import RichTextEditor from '../../components/RichTextEditor';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import SEO from '../../components/SEO';
import { FaSlack, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaUserCheck, FaPen, FaTrashAlt } from 'react-icons/fa';
import './BackblastForm.css';

export const BackblastForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const workoutId = id ? parseInt(id, 10) : undefined;
  const { isAuthenticated, user } = useAuth();

  const {
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
  } = useBackblastForm(workoutId);

  const slackAuthUrl = `${config.slackClientId ? `https://slack.com/openid/connect/authorize?response_type=code&scope=openid%20profile%20email&client_id=${encodeURIComponent(config.slackClientId)}&redirect_uri=${encodeURIComponent(config.slackRedirectUri)}&state=${encodeURIComponent(window.location.pathname)}` : '#'}`;

  const handleSlackLoginClick = () => {
    sessionStorage.setItem('f3rva_auth_return_to', window.location.pathname);
    if (config.slackClientId) {
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

  return (
    <div className="backblast-form-container">
      <SEO
        title={isEditMode ? `Edit Backblast: ${formData.title || 'Workout'} | F3 RVA` : 'Post a Backblast | F3 RVA'}
        description="Submit a new workout backblast to F3 RVA Big Data."
      />

      <div className="backblast-form-header">
        <div className="header-titles">
          <h1>{isEditMode ? 'Edit Backblast' : 'Post a Backblast'}</h1>
          <p className="header-author-badge">
            Posting as: <strong>{user?.f3Name}</strong> {user?.role === 'admin' ? '(Admin)' : ''}
          </p>
        </div>
        {!isEditMode && (
          <button type="button" className="btn-clear-draft" onClick={clearDraft} title="Clear saved draft">
            <FaTrashAlt /> Clear Draft
          </button>
        )}
      </div>

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
            <label htmlFor="bb-date">
              <FaCalendarAlt className="field-icon" /> Workout Date <span className="required">*</span>
            </label>
            <input
              id="bb-date"
              type="date"
              className={`form-input ${validationErrors.workoutDate ? 'has-error' : ''}`}
              value={formData.workoutDate}
              onChange={(e) => updateField('workoutDate', e.target.value)}
              disabled={submitting}
            />
            {validationErrors.workoutDate && <span className="field-error">{validationErrors.workoutDate}</span>}
          </div>

          <div className="form-group col-half">
            <label htmlFor="bb-ao">
              <FaMapMarkerAlt className="field-icon" /> Area of Operations (AO) <span className="required">*</span>
            </label>
            <input
              id="bb-ao"
              type="text"
              list="ao-options"
              className={`form-input ${validationErrors.aoName ? 'has-error' : ''}`}
              placeholder="Select or type AO (e.g. First Watch, Dogpile)..."
              value={formData.aoName}
              onChange={(e) => updateField('aoName', e.target.value)}
              disabled={submitting}
            />
            <datalist id="ao-options">
              {aos.map((ao) => (
                <option key={ao.id} value={ao.description} />
              ))}
            </datalist>
            {validationErrors.aoName && <span className="field-error">{validationErrors.aoName}</span>}
          </div>
        </div>

        {/* Qs and PAX Attendance Row */}
        <div className="form-row">
          <div className="form-group col-half">
            <label htmlFor="bb-qic">
              <FaUserCheck className="field-icon" /> Q / Co-Q(s) <span className="required">*</span>
            </label>
            <input
              id="bb-qic"
              type="text"
              className={`form-input ${validationErrors.qic ? 'has-error' : ''}`}
              placeholder="Comma-separated F3 names (e.g. Dingo, Lab Rat)"
              value={formData.qic}
              onChange={(e) => updateField('qic', e.target.value)}
              disabled={submitting}
            />
            {validationErrors.qic && <span className="field-error">{validationErrors.qic}</span>}
            <span className="field-hint">Leader(s) who designed and executed the workout.</span>
          </div>

          <div className="form-group col-half">
            <label htmlFor="bb-pax">
              <FaUsers className="field-icon" /> PAX Attendees <span className="required">*</span>
            </label>
            <input
              id="bb-pax"
              type="text"
              className={`form-input ${validationErrors.pax ? 'has-error' : ''}`}
              placeholder="Comma-separated PAX names (e.g. Splinter, Swag, Bleeder)"
              value={formData.pax}
              onChange={(e) => updateField('pax', e.target.value)}
              disabled={submitting}
            />
            {validationErrors.pax && <span className="field-error">{validationErrors.pax}</span>}
            <span className="field-hint">All men present, including Qs.</span>
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
          <Link to="/" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving Backblast...' : isEditMode ? 'Update Backblast' : 'Publish Backblast'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BackblastForm;
