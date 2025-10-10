import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { MdCalendarToday, MdPerson, MdGroup, MdLocationOn } from 'react-icons/md';
import SEO from '../../components/SEO';
import { config } from '../../config';
import { WorkoutPost } from '../../types/WorkoutPost';
import { formatDisplayDate, formatDateForUrl } from '../../utils/dateUtils';
import { getPostExcerpt } from '../../utils/postUtils';
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

  // Fetch posts data from API
  useEffect(() => {
    if (!year) {
      return;
    }
    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construct the API URL for posts by year
        const apiUrl = `${config.apiBaseUrl}/api/v2/getWorkoutsByDate.php?year=${year}`;

        const response = await fetch(apiUrl, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const postsData: WorkoutPost[] = await response.json();
        setPosts(postsData);
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
  }, [year]);

  // Return early if invalid parameters
  if (!year) {
    return <Navigate to="/archives" replace />;
  }

  // Sort posts by date, newest first
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime()
  );


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
          {sortedPosts.length > 0 ? (
            <div className="archives-posts-grid">
              {sortedPosts.map((post) => {
                const { year: postYear, month, day } = formatDateForUrl(post.workoutDate);
                const postUrl = `/${postYear}/${month}/${day}/${post.slug}`;

                // Extract display data from WorkoutPost structure
                const qicNames = post.q.map(q => q.f3Name);
                const aoNames = post.ao.map(ao => ao.description);
                const paxCount = post.paxCount || 0;

                return (
                  <article key={post.workoutId} className="archive-post-card">
                    <Link to={postUrl} className="post-card-link">
                      {/* Card Header */}
                      <header className="card-header">
                        <h2 className="card-title">{post.title}</h2>
                        <div className="card-date">
                          <MdCalendarToday className="date-icon" />
                          <span>{formatDisplayDate(post.workoutDate)}</span>
                        </div>
                      </header>

                      {/* Card Metadata */}
                      <div className="card-metadata">
                        <div className="metadata-row">
                          <div className="metadata-item">
                            <MdPerson className="metadata-icon" />
                            <span className="metadata-text">
                              <strong>QIC{qicNames.length > 1 ? 's' : ''}:</strong> {qicNames.join(', ')}
                            </span>
                          </div>
                          <div className="metadata-item">
                            <MdLocationOn className="metadata-icon" />
                            <span className="metadata-text">
                              <strong>AO{aoNames.length > 1 ? 's' : ''}:</strong> {aoNames.join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="metadata-item metadata-pax-item">
                          <MdGroup className="metadata-icon" />
                          <span className="metadata-text">
                            <strong>PAX:</strong> {paxCount} participant{paxCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Card Content Preview */}
                      <div className="card-content">
                        <p className="card-excerpt">
                          {getPostExcerpt(post.content)}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <footer className="card-footer">
                        <span className="card-author">By {post.author}</span>
                        <span className="read-more-text">Read more →</span>
                      </footer>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="archives-empty-state">
              <h3>No archives available for {year}</h3>
              <p>Check back soon for workout backblasts from this year!</p>
              <Link to="/archives" className="tertiary-action-button">
                View All Archives
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default YearArchives;