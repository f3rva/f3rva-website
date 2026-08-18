import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import { isValidYear } from '../../utils/validation';
import { config } from '../../config';
import { WorkoutPost } from '../../types/WorkoutPost';
import Pagination from '../../components/Pagination';
import ArchivePostCard from '../../components/ArchivePostCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import './Archives.css';

/**
 * Year archives listing page component for F3 RVA website
 * Displays all archived workout backblast posts for a specific year
 * Provides links to individual post pages using date-based URLs
 */
const YearArchives: React.FC = () => {
  const { year } = useParams<{ year: string }>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(10);

  // Validate parameters and format
  const isValidParams = !!year;
  const isValidFormat = isValidParams && isValidYear(year);

  // Construct dynamic API URL
  const apiUrl = isValidFormat
    ? `${config.apiBaseUrl}/v2/workouts/by-date?year=${year}&page=${currentPage}&results=${resultsPerPage}`
    : null;

  // Use the type-safe fetch hook
  const { data: postsData, loading: fetchLoading, error: fetchError } = useFetch<WorkoutPost[]>(apiUrl);

  // Derive consolidated states
  const posts = postsData || [];
  const loading = isValidFormat ? fetchLoading : false;
  const error = !isValidParams ? null : !isValidFormat ? 'Invalid year format' : fetchError;
  const hasMoreResults = postsData ? postsData.length === resultsPerPage : true;

  // Return early if invalid parameters
  if (!year) {
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
        <LoadingSpinner message="Loading year archives..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="archives-container">
        <div className="error-message">
          <h2>Error loading year archives</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${year} Archives - F3RVA Workout Backblasts`}
        description={`Browse ${year} workout backblasts from F3RVA. Read detailed accounts of workouts, QICs, PAX attendance, and workout locations from ${year}.`}
        keywords={['f3', 'archives', 'backblasts', 'workouts', 'richmond', 'virginia', 'fitness', year]}
        url={`https://f3rva.org/${year}`}
        type="website"
      />

      <div className="archives-container">
        {/* Page Header */}
        <header className="archives-header-section">
          <h1 className="archives-main-title">Workout Archives</h1>
          <h2 className="archives-subtitle">{year}</h2>
          
          <p className="archives-description">
            You must love history! Check out workouts from this year across the Richmond region.
          </p>

          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <Link to="/archives" className="breadcrumb-link">All Archives</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{year}</span>
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
                <h3>No archives available for {year}</h3>
                <p>Check back soon for workout backblasts from this year!</p>
                <Link to="/archives" className="tertiary-action-button">
                  View All Archives
                </Link>
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

export default YearArchives;