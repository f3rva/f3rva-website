import React, { useState, useCallback } from 'react';
import SEO from '../../components/SEO';
import { config } from '../../config';
import { WorkoutPost } from '../../types/WorkoutPost';
import Pagination from '../../components/Pagination';
import ArchivePostCard from '../../components/ArchivePostCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import './Archives.css';

/**
 * Archives listing page component for F3 RVA website
 * Displays all archived workout backblast posts with metadata
 * Provides links to individual post pages using date-based URLs
 */
const Archives: React.FC = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(10);

  // Construct dynamic API URL
  const apiUrl = `${config.apiBaseUrl}/v2/workouts?page=${currentPage}&results=${resultsPerPage}`;

  // Use the type-safe fetch hook
  const { data: postsData, loading, error } = useFetch<WorkoutPost[]>(apiUrl);

  // Derive consolidated states
  const posts = postsData || [];
  const hasMoreResults = postsData ? postsData.length === resultsPerPage : true;

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleResultsPerPageChange = useCallback((newResultsPerPage: number) => {
    setResultsPerPage(newResultsPerPage);
    setCurrentPage(1); // Reset to first page when changing results per page
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="archives-container">
        <LoadingSpinner message="Loading archives..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="archives-container">
        <div className="error-message">
          <h2>Error loading archives</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Archives - F3RVA Workout Backblasts"
        description="Browse archived workout backblasts from F3RVA. Read detailed accounts of past workouts, QICs, PAX attendance, and workout locations across the Richmond region."
        keywords={['f3', 'archives', 'backblasts', 'workouts', 'richmond', 'virginia', 'fitness', 'history']}
        url="https://f3rva.org/archives"
        type="website"
      />

      <div className="archives-container">
        {/* Page Header */}
        <header className="archives-header-section">
          <h1 className="archives-main-title">Workout Archives</h1>
          <p className="archives-description">
            Relive the pain and glory of past F3RVA workouts. Browse backblasts from
            across the region.
          </p>
        </header>

        {/* Archives Grid */}
        <main className="archives-content-section">
          <div className="archives-posts-grid">
            {posts.map((post) => (
              <ArchivePostCard key={post.workoutId} post={post} />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            resultsPerPage={resultsPerPage}
            hasMoreResults={hasMoreResults}
            loading={loading}
            onPageChange={handlePageChange}
            onResultsPerPageChange={handleResultsPerPageChange}
          />

          {/* Empty State (if no posts) */}
          {posts.length === 0 && !loading && (
            <div className="archives-empty-state">
              <h3>No archives available yet</h3>
              <p>Check back soon for workout backblasts from our PAX!</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Archives;