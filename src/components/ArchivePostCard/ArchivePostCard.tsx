import React from 'react';
import { Link } from 'react-router-dom';
import { MdCalendarToday } from 'react-icons/md';
import { WorkoutPost } from '../../types/WorkoutPost';
import { formatDisplayDate, formatDateForUrl } from '../../utils/dateUtils';
import { getPostExcerpt } from '../../utils/postUtils';

/**
 * Props interface for the ArchivePostCard component
 */
export interface ArchivePostCardProps {
  /** The workout post data to display */
  post: WorkoutPost;
}

/**
 * Reusable archive post card component
 * Displays workout post information in a consistent card format across all archive pages
 */
const ArchivePostCard: React.FC<ArchivePostCardProps> = ({ post }) => {
  // Generate the post URL from the workout date
  const { year, month, day } = formatDateForUrl(post.workoutDate);
  const postUrl = `/${year}/${month}/${day}/${post.slug}`;

  // Extract display data from WorkoutPost structure
  const qicNames = post.q.map(q => q.f3Name);
  const aoNames = post.ao.map(ao => ao.description);

  // Handle PAX display - use count if available, otherwise fall back to names
  const paxCount = post.paxCount || 0;
  const paxNames = post.pax?.map(pax => pax.f3Name) || [];
  const hasPaxCount = typeof post.paxCount === 'number';

  return (
    <article className="archive-post-card">
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
              <span className="metadata-text">
                <strong>QIC{qicNames.length > 1 ? 's' : ''}:</strong> {qicNames.join(', ')}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-text">
                <strong>AO{aoNames.length > 1 ? 's' : ''}:</strong> {aoNames.join(', ')}
              </span>
            </div>
          </div>
          <div className="metadata-item metadata-pax-item">
            <span className="metadata-text">
              {hasPaxCount ? (
                <><strong>PAX:</strong> {paxCount} participant{paxCount !== 1 ? 's' : ''}</>
              ) : (
                <><strong>PAX ({paxNames.length}):</strong> {paxNames.join(', ')}</>
              )}
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
          <span className="card-author">By {post.author || 'Unknown'}</span>
          <span className="read-more-text">Read more →</span>
        </footer>
      </Link>
    </article>
  );
};

export default ArchivePostCard;