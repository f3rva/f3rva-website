import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MdCalendarToday, MdPerson, MdGroup, MdLocationOn } from 'react-icons/md';
import { config } from '../../config';
import { WorkoutPost } from '../../types/WorkoutPost';
import { formatDisplayDate } from '../../utils/dateUtils';
import { getPostExcerpt } from '../../utils/postUtils';
import { sanitizeHtml } from '../../utils/sanitizer';
import { isValidYear, isValidMonth, isValidDay, isValidSlug } from '../../utils/validation';
import SEO from '../../components/SEO';
import './ArchivePost.css';

/**
 * Archive post component for displaying individual workout backblast posts
 * Shows post metadata header, rich text content, and author information
 * Uses dynamic URL pattern /YYYY/MM/DD/post-name for clean permalinks
 */
const ArchivePost: React.FC = () => {
  const { year, month, day, slug } = useParams<{
    year: string;
    month: string;
    day: string;
    slug: string;
  }>();

  // State management for post data, loading, and errors
  const [post, setPost] = useState<WorkoutPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch post data from API
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchPost = async () => {
      console.log('Fetching post with params:', { year, month, day, slug });
      if (!year || !month || !day || !slug) {
        setError('Invalid URL parameters');
        setLoading(false);
        return;
      }

      // Input validation to prevent parameter injection
      if (!isValidYear(year) || !isValidMonth(month) || !isValidDay(day) || !isValidSlug(slug)) {
        setError('Invalid URL format');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Construct the API URL based on parameters
        const apiUrl = `${config.apiBaseUrl}/api/v2/getWorkoutByDateSlug.php?year=${year}&month=${month}&day=${day}&slug=${slug}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const postData: WorkoutPost = await response.json();
        setPost(postData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [year, month, day, slug]);

  // Loading state
  if (loading) {
    return (
      <div className="archive-post-container">
        <div className="loading-spinner">Loading post...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="archive-post-container">
        <div className="error-message">
          <h2>Error loading post</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // If post not found, redirect to 404
  if (!post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <SEO
        title={`${post.title} - F3RVA Archives`}
        description={getPostExcerpt(post.content)}
        keywords={[
          'f3', 'workout', 'backblast', 'fitness', 'richmond', 'virginia',
          ...post.ao.map(ao => ao.description)
        ]}
        url={`https://f3rva.org/${year}/${month}/${day}/${slug}`}
        type="article"
      />

      <article className="archive-post-container">
        {/* Post Header with Metadata */}
        <header className="post-header-section">
          <h1 className="post-main-title">{post.title}</h1>

          <div className="post-metadata-grid">
            <div className="metadata-item">
              <div className="metadata-icon">
                <MdCalendarToday />
              </div>
              <div className="metadata-content">
                <span className="metadata-label">Date</span>
                <span className="metadata-value">{formatDisplayDate(post.workoutDate)}</span>
              </div>
            </div>

            <div className="metadata-item">
              <div className="metadata-icon">
                <MdPerson />
              </div>
              <div className="metadata-content">
                <span className="metadata-label">QIC{post.q.length > 1 ? 's' : ''}</span>
                <div className="metadata-value-list">
                  {post.q.map((qic, index) => (
                    <span key={qic.memberId} className="metadata-value">
                      {qic.f3Name}
                      {index < post.q.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="metadata-item">
              <div className="metadata-icon">
                <MdLocationOn />
              </div>
              <div className="metadata-content">
                <span className="metadata-label">AO{post.ao.length > 1 ? 's' : ''}</span>
                <div className="metadata-value-list">
                  {post.ao.map((ao, index) => (
                    <span key={ao.id} className="metadata-value">
                      {ao.description}
                      {index < post.ao.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="metadata-item metadata-pax">
              <div className="metadata-icon">
                <MdGroup />
              </div>
              <div className="metadata-content">
                <span className="metadata-label">PAX ({post.pax?.length ?? 0})</span>
                <div className="pax-list">
                  {post.pax?.map((paxMember, index) => (
                    <span key={paxMember.memberId} className="pax-member">
                      {paxMember.f3Name}
                      {index < ((post.pax?.length ?? 0) - 1) && ', '}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Post Content */}
        <main className="post-content-section">
          <div
            className="post-rich-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </main>

        {/* Post Footer with Author */}
        <footer className="post-footer-section">
          <div className="post-author-info">
            <span className="author-label">Posted by:</span>
            <span className="author-name">{post.author || 'Unknown'}</span>
          </div>
        </footer>
      </article>
    </>
  );
};

export default ArchivePost;
