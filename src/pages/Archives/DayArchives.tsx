import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { config } from '../../config';
import { formatDateDisplay } from '../../utils/dateUtils';
import { WorkoutPost } from '../../types/WorkoutPost';
import ArchivePostCard from '../../components/ArchivePostCard';
import Pagination from '../../components/Pagination';
import SEO from '../../components/SEO';
import './Archives.css';

/**
 * Day archives listing page component for F3 RVA website
 * Displays all archived workout backblast posts for a specific date
 * Provides links to individual post pages using date-based URLs
 */
const DayArchives: React.FC = () => {
  const { year, month, day } = useParams<{ year: string; month: string; day: string }>();

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
    if (!year || !month || !day) {
      return;
    }

    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construct the API URL for posts by date with pagination
        const apiUrl = `${config.apiBaseUrl}/api/v2/getWorkoutsByDate.php?year=${year}&month=${month}&day=${day}&page=${currentPage}&results=${resultsPerPage}`;

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
  }, [year, month, day, currentPage, resultsPerPage]);

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
        <div className="loading-spinner">Loading day archives...</div>
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