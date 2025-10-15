import React, { useState, useEffect } from 'react';
import SEO from '../../components/SEO';
import { config } from '../../config';
import { WorkoutPost } from '../../types/WorkoutPost';
import Pagination from '../../components/Pagination';
import ArchivePostCard from '../../components/ArchivePostCard';
import './Archives.css';

/**
 * Archives listing page component for F3 RVA website
 * Displays all archived workout backblast posts with metadata
 * Provides links to individual post pages using date-based URLs
 */
const Archives: React.FC = () => {
  // State management for posts, loading, and errors
  const [posts, setPosts] = useState<WorkoutPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<number>(10);
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(true);

  // Fetch posts data from API with pagination
  useEffect(() => {
    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construct the API URL with pagination parameters
        const apiUrl = `${config.apiBaseUrl}/api/v2/getWorkouts.php?page=${currentPage}&results=${resultsPerPage}`;

        const response = await fetch(apiUrl, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const postsData: WorkoutPost[] = await response.json();
        setPosts(postsData);

        // Determine if there are more results based on returned data length
        // If we get fewer results than requested, we've reached the end
        setHasMoreResults(postsData.length === resultsPerPage);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch posts');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [currentPage, resultsPerPage]);

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
        <div className="loading-spinner">Loading archives...</div>
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