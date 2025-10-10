import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import { config } from '../../config';
import { WorkoutPost } from '../../types/WorkoutPost';
import Pagination from '../../components/Pagination';
import ArchivePostCard from '../../components/ArchivePostCard';
import './Archives.css';

/**
 * Year archives listing page component for F3 RVA website
 * Displays all archived workout backblast posts for a specific year
 * Provides links to individual post pages using date-based URLs
 */
const YearArchives: React.FC = () => {
  const { year } = useParams<{ year: string }>();

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
    if (!year) {
      return;
    }
    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construct the API URL for posts by year with pagination
        const apiUrl = `${config.apiBaseUrl}/api/v2/getWorkoutsByDate.php?year=${year}&page=${currentPage}&results=${resultsPerPage}`;

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
  }, [year, currentPage, resultsPerPage]);

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
        <div className="loading-spinner">Loading year archives...</div>
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
          <h1 className="archives-main-title">{year} Workout Archives</h1>
          <p className="archives-description">
            Relive the workouts from {year}. Browse backblasts from our QICs and PAX
            across the Richmond region during this year.
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