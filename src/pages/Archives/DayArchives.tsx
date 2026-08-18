import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { isValidYear, isValidMonth, isValidDay } from '../../utils/validation';
import { config } from '../../config';
import { formatDateDisplay } from '../../utils/dateUtils';
import { WorkoutPost } from '../../types/WorkoutPost';
import ArchivePostCard from '../../components/ArchivePostCard';
import Pagination from '../../components/Pagination';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import './Archives.css';

/**
 * Day archives listing page component for F3 RVA website
 * Displays all archived workout backblast posts for a specific date
 * Provides links to individual post pages using date-based URLs
 */
const DayArchives: React.FC = () => {
  const { year, month, day } = useParams<{ year: string; month: string; day: string }>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(10);

  // Validate parameters and format
  const isValidParams = year && month && day;
  const isValidFormat = isValidParams && isValidYear(year) && isValidMonth(month) && isValidDay(day);

  // Construct dynamic API URL
  const apiUrl = isValidFormat
    ? `${config.apiBaseUrl}/v2/workouts/by-date?year=${year}&month=${month}&day=${day}&page=${currentPage}&results=${resultsPerPage}`
    : null;

  // Use the type-safe fetch hook
  const { data: postsData, loading: fetchLoading, error: fetchError } = useFetch<WorkoutPost[]>(apiUrl);

  // Derive consolidated states
  const posts = postsData || [];
  const loading = isValidFormat ? fetchLoading : false;
  const error = !isValidParams ? null : !isValidFormat ? 'Invalid date format' : fetchError;
  const hasMoreResults = postsData ? postsData.length === resultsPerPage : true;

  // Return early if invalid parameters
  if (!year || !month || !day) {
    return <Navigate to="/archives" replace />;
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleResultsPerPageChange = (newResultsPerPage: number) => {
    setResultsPerPage(newResultsPerPage);
    setCurrentPage(1); // Reset to first page when changing results per page
  };


  // Loading state
  if (loading) {
    return (
      <div className="archives-container">
        <LoadingSpinner message="Loading day archives..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="archives-container">
        <div className="error-message">
          <h2>Error loading day archives</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const dateDisplay = formatDateDisplay(year, month, day);
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' });

  return (
    <>
      <SEO
        title={`${dateDisplay} Archives - F3RVA Workout Backblasts`}
        description={`Browse workout backblasts from ${dateDisplay} at F3RVA. Read detailed accounts of workouts, QICs, PAX attendance, and workout locations from this date.`}
        keywords={['f3', 'archives', 'backblasts', 'workouts', 'richmond', 'virginia', 'fitness', year, month, day]}
        url={`https://f3rva.org/${year}/${month}/${day}`}
        type="website"
      />

      <div className="archives-container">
        {/* Page Header */}
        <header className="archives-header-section">
          <h1 className="archives-main-title">Workout Archives</h1>
          <h2 className="archives-subtitle">{dateDisplay}</h2>
          
          <p className="archives-description">
            Browse all workouts from this date across the Richmond region.
          </p>

          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <Link to="/archives" className="breadcrumb-link">All Archives</Link>
            <span className="breadcrumb-separator">›</span>
            <Link to={`/${year}`} className="breadcrumb-link">{year}</Link>
            <span className="breadcrumb-separator">›</span>
            <Link to={`/${year}/${month}`} className="breadcrumb-link">{monthName}</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{parseInt(day)}</span>
          </nav>
        </header>

        {/* Archives Grid */}
        <main className="archives-content-section">
          {posts.length > 0 ? (
            <div className="archives-posts-grid">
              {posts.map((post) => (
                <ArchivePostCard key={post.workoutId} post={post} />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="archives-empty-state">
                <h3>No archives available for {dateDisplay}</h3>
                <p>Check back soon for workout backblasts from this date!</p>
                <div className="archives-empty-actions">
                  <Link to={`/${year}/${month}`} className="tertiary-action-button">
                    View {monthName} {year} Archives
                  </Link>
                  <Link to={`/${year}`} className="tertiary-action-button">
                    View {year} Archives
                  </Link>
                  <Link to="/archives" className="tertiary-action-button">
                    View All Archives
                  </Link>
                </div>
              </div>
            )
          )}

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            resultsPerPage={resultsPerPage}
            hasMoreResults={hasMoreResults}
            loading={loading}
            onPageChange={handlePageChange}
            onResultsPerPageChange={handleResultsPerPageChange}
          />
        </main>
      </div>
    </>
  );
};

export default DayArchives;