import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import { isValidSlug } from '../../utils/validation';
import { config } from '../../config';
import { WorkoutPost } from '../../types/WorkoutPost';
import Pagination from '../../components/Pagination';
import ArchivePostCard from '../../components/ArchivePostCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import './Archives.css';

/**
 * AO archives listing page component for F3 RVA website
 * Displays all archived workout backblast posts for a specific Area of Operation (AO)
 * Provides links to individual post pages using date-based URLs
 */
const AOArchives: React.FC = () => {
  const { ao } = useParams<{ ao: string }>(); // ao parameter is now the AO slug

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(10);

  // Validate parameters and format
  const isValidParams = !!ao;
  const isValidFormat = isValidParams && isValidSlug(ao);

  // Construct dynamic API URL
  const apiUrl = isValidFormat
    ? `${config.apiBaseUrl}/api/v2/getWorkoutsByAO.php?slug=${encodeURIComponent(ao)}&page=${currentPage}&results=${resultsPerPage}`
    : null;

  // Use the type-safe fetch hook
  const { data: postsData, loading: fetchLoading, error: fetchError } = useFetch<WorkoutPost[]>(apiUrl);

  // Derive consolidated states
  const posts = postsData || [];
  const loading = isValidFormat ? fetchLoading : false;
  const error = !isValidParams ? null : !isValidFormat ? 'Invalid AO format' : fetchError;
  const hasMoreResults = postsData ? postsData.length === resultsPerPage : true;

  // Return early if invalid parameters
  if (!ao) {
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
        <LoadingSpinner message="Loading AO archives..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="archives-container">
        <div className="error-message">
          <h2>Error loading AO archives</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Get AO description for display from first post, fallback to slug
  const displayAO = posts.length > 0 && posts[0].ao.length > 0
    ? posts[0].ao.find(aoItem => aoItem.slug === ao)?.description || decodeURIComponent(ao)
    : decodeURIComponent(ao);

  return (
    <>
      <SEO
        title={`${displayAO} Archives - F3RVA Workout Backblasts`}
        description={`Browse workout backblasts from ${displayAO} at F3RVA. Read detailed accounts of workouts, QICs, PAX attendance, and workout locations.`}
        keywords={['f3', 'archives', 'backblasts', 'workouts', 'richmond', 'virginia', 'fitness', displayAO]}
        url={`https://f3rva.org/archives/ao/${encodeURIComponent(ao)}`}
        type="website"
      />

      <div className="archives-container">
        {/* Page Header */}
        <header className="archives-header-section">
          <h1 className="archives-main-title">Workout Archives</h1>
          <h2 className="archives-subtitle">{displayAO}</h2>
          
          <p className="archives-description">
            Workout archives for {displayAO}.
          </p>

          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <Link to="/archives" className="breadcrumb-link">All Archives</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{displayAO}</span>
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
                <h3>No archives available for {displayAO}</h3>
                <p>Check back soon for workout backblasts from this AO!</p>
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

export default AOArchives;
