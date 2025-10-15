import React from 'react';
import { MdNavigateNext, MdNavigateBefore } from 'react-icons/md';
import './Pagination.css';

/**
 * Props interface for the Pagination component
 */
export interface PaginationProps {
  /** Current page number (1-based) */
  currentPage: number;

  /** Number of results to show per page */
  resultsPerPage: number;

  /** Whether there are more results available */
  hasMoreResults: boolean;

  /** Whether the component is in a loading state */
  loading?: boolean;

  /** Callback when page changes (next/previous) */
  onPageChange: (newPage: number) => void;

  /** Callback when results per page changes */
  onResultsPerPageChange: (newResultsPerPage: number) => void;
}

/**
 * Reusable pagination component for archive pages
 * Provides navigation controls and results per page selection
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  resultsPerPage,
  hasMoreResults,
  loading = false,
  onPageChange,
  onResultsPerPageChange,
}) => {
  // Don't render pagination while loading
  if (loading) {
    return null;
  }

  const handleNextPage = () => {
    if (hasMoreResults) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleResultsPerPageChange = (newResultsPerPage: number) => {
    onResultsPerPageChange(newResultsPerPage);
  };

  return (
    <div className="pagination-controls">
      <div className="results-per-page">
        <label htmlFor="results-per-page-select">Results per page:</label>
        <select
          id="results-per-page-select"
          value={resultsPerPage}
          onChange={(e) => handleResultsPerPageChange(Number(e.target.value))}
          className="results-per-page-select"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="page-navigation">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
          className="pagination-button pagination-button-prev"
          aria-label="Previous page"
        >
          <MdNavigateBefore />
          Previous
        </button>

        <span className="page-info">Page {currentPage}</span>

        <button
          onClick={handleNextPage}
          disabled={!hasMoreResults}
          className="pagination-button pagination-button-next"
          aria-label="Next page"
        >
          Next
          <MdNavigateNext />
        </button>
      </div>
    </div>
  );
};

export default Pagination;