import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MdCalendarToday, MdPerson, MdGroup, MdLocationOn } from 'react-icons/md';
import SEO from '../../components/SEO';
import { getPostByDateAndSlug } from '../../data/archiveData';
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

  // Get the post data based on URL parameters
  const post = getPostByDateAndSlug(year!, month!, day!, slug!);

  // If post not found, redirect to 404
  if (!post) {
    return <Navigate to="/404" replace />;
  }

  // Format the date for display
  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Create SEO-friendly description from content
  const getPostExcerpt = (content: string): string => {
    // Strip HTML tags and get first 160 characters
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 160
      ? textContent.substring(0, 160).trim() + '...'
      : textContent;
  };

  return (
    <>
      <SEO
        title={`${post.title} - F3RVA Archives`}
        description={getPostExcerpt(post.content)}
        keywords={['f3', 'workout', 'backblast', 'fitness', 'richmond', 'virginia', ...post.qic, ...post.ao]}
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
                <span className="metadata-value">{formatDisplayDate(post.date)}</span>
              </div>
            </div>

            <div className="metadata-item">
              <div className="metadata-icon">
                <MdPerson />
              </div>
              <div className="metadata-content">
                <span className="metadata-label">QIC{post.qic.length > 1 ? 's' : ''}</span>
                <div className="metadata-value-list">
                  {post.qic.map((qic, index) => (
                    <span key={index} className="metadata-value">
                      {qic}
                      {index < post.qic.length - 1 && ', '}
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
                    <span key={index} className="metadata-value">
                      {ao}
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
                <span className="metadata-label">PAX ({post.pax.length})</span>
                <div className="pax-list">
                  {post.pax.map((paxMember, index) => (
                    <span key={index} className="pax-member">
                      {paxMember}
                      {index < post.pax.length - 1 && ', '}
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
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </main>

        {/* Post Footer with Author */}
        <footer className="post-footer-section">
          <div className="post-author-info">
            <span className="author-label">Posted by:</span>
            <span className="author-name">{post.author}</span>
          </div>
        </footer>
      </article>
    </>
  );
};

export default ArchivePost;