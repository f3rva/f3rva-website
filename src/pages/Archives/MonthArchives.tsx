import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { MdCalendarToday, MdPerson, MdGroup, MdLocationOn } from 'react-icons/md';
import SEO from '../../components/SEO';
import { getPostsByYearMonth, formatDateForUrl } from '../../data/archiveData';
import './Archives.css';

/**
 * Month archives listing page component for F3 RVA website
 * Displays all archived workout backblast posts for a specific year and month
 * Provides links to individual post pages using date-based URLs
 */
const MonthArchives: React.FC = () => {
  const { year, month } = useParams<{ year: string; month: string }>();

  if (!year || !month) {
    return <Navigate to="/archives" replace />;
  }

  // Get posts for the specified year and month
  const posts = getPostsByYearMonth(year, month);

  // Sort posts by date, newest first
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Format month name for display
  const formatMonthName = (year: string, month: string): string => {
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Create excerpt from content
  const getPostExcerpt = (content: string): string => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 200
      ? textContent.substring(0, 200).trim() + '...'
      : textContent;
  };

  const monthYearDisplay = formatMonthName(year, month);

  return (
    <>
      <SEO
        title={`${monthYearDisplay} Archives - F3RVA Workout Backblasts`}
        description={`Browse ${monthYearDisplay} workout backblasts from F3RVA. Read detailed accounts of workouts, QICs, PAX attendance, and workout locations from ${monthYearDisplay}.`}
        keywords={['f3', 'archives', 'backblasts', 'workouts', 'richmond', 'virginia', 'fitness', year, month]}
        url={`https://f3rva.org/${year}/${month}`}
        type="website"
      />

      <div className="archives-container">
        {/* Page Header */}
        <header className="archives-header-section">
          <h1 className="archives-main-title">{monthYearDisplay} Workout Archives</h1>
          <p className="archives-description">
            Relive the workouts from {monthYearDisplay}. Browse backblasts from our QICs and PAX
            across the Richmond region during this month.
          </p>

          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <Link to="/archives" className="breadcrumb-link">All Archives</Link>
            <span className="breadcrumb-separator">›</span>
            <Link to={`/${year}`} className="breadcrumb-link">{year}</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' })}</span>
          </nav>
        </header>

        {/* Archives Grid */}
        <main className="archives-content-section">
          {sortedPosts.length > 0 ? (
            <div className="archives-posts-grid">
              {sortedPosts.map((post) => {
                const { year: postYear, month: postMonth, day } = formatDateForUrl(post.date);
                const postUrl = `/${postYear}/${postMonth}/${day}/${post.slug}`;

                return (
                  <article key={post.id} className="archive-post-card">
                    <Link to={postUrl} className="post-card-link">
                      {/* Card Header */}
                      <header className="card-header">
                        <h2 className="card-title">{post.title}</h2>
                        <div className="card-date">
                          <MdCalendarToday className="date-icon" />
                          <span>{formatDisplayDate(post.date)}</span>
                        </div>
                      </header>

                      {/* Card Metadata */}
                      <div className="card-metadata">
                        <div className="metadata-row">
                          <div className="metadata-item">
                            <MdPerson className="metadata-icon" />
                            <span className="metadata-text">
                              <strong>QIC{post.qic.length > 1 ? 's' : ''}:</strong> {post.qic.join(', ')}
                            </span>
                          </div>
                          <div className="metadata-item">
                            <MdLocationOn className="metadata-icon" />
                            <span className="metadata-text">
                              <strong>AO{post.ao.length > 1 ? 's' : ''}:</strong> {post.ao.join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="metadata-item metadata-pax-item">
                          <MdGroup className="metadata-icon" />
                          <span className="metadata-text">
                            <strong>PAX ({post.pax.length}):</strong> {post.pax.join(', ')}
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
              <h3>No archives available for {monthYearDisplay}</h3>
              <p>Check back soon for workout backblasts from this month!</p>
              <div className="archives-empty-actions">
                <Link to={`/${year}`} className="tertiary-action-button">
                  View {year} Archives
                </Link>
                <Link to="/archives" className="tertiary-action-button">
                  View All Archives
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MonthArchives;