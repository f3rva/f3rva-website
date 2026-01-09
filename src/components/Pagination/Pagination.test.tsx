import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  const defaultProps = {
    currentPage: 1,
    resultsPerPage: 10,
    hasMoreResults: true,
    onPageChange: vi.fn(),
    onResultsPerPageChange: vi.fn(),
  };

  it('should render nothing when loading is true', () => {
    const { container } = render(<Pagination {...defaultProps} loading={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render pagination controls when not loading', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByLabelText(/Previous page/i)).toBeDefined();
    expect(screen.getByLabelText(/Next page/i)).toBeDefined();
    expect(screen.getByText(/Page 1/i)).toBeDefined();
    expect(screen.getByLabelText(/Results per page/i)).toBeDefined();
  });

  describe('Previous Button', () => {
    it('should be disabled on the first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);
      const prevButton = screen.getByLabelText(/Previous page/i);
      expect((prevButton as HTMLButtonElement).disabled).toBe(true);
    });

    it('should be enabled on subsequent pages', () => {
      render(<Pagination {...defaultProps} currentPage={2} />);
      const prevButton = screen.getByLabelText(/Previous page/i);
      expect((prevButton as HTMLButtonElement).disabled).toBe(false);
    });

    it('should call onPageChange with previous page when clicked', () => {
      render(<Pagination {...defaultProps} currentPage={2} />);
      const prevButton = screen.getByLabelText(/Previous page/i);
      fireEvent.click(prevButton);
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Next Button', () => {
    it('should be enabled when hasMoreResults is true', () => {
      render(<Pagination {...defaultProps} hasMoreResults={true} />);
      const nextButton = screen.getByLabelText(/Next page/i);
      expect((nextButton as HTMLButtonElement).disabled).toBe(false);
    });

    it('should be disabled when hasMoreResults is false', () => {
      render(<Pagination {...defaultProps} hasMoreResults={false} />);
      const nextButton = screen.getByLabelText(/Next page/i);
      expect((nextButton as HTMLButtonElement).disabled).toBe(true);
    });

    it('should call onPageChange with next page when clicked', () => {
      render(<Pagination {...defaultProps} currentPage={1} hasMoreResults={true} />);
      const nextButton = screen.getByLabelText(/Next page/i);
      fireEvent.click(nextButton);
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Results Per Page Selector', () => {
    it('should show the correct selected value', () => {
      render(<Pagination {...defaultProps} resultsPerPage={50} />);
      const select = screen.getByLabelText(/Results per page/i) as HTMLSelectElement;
      expect(select.value).toBe('50');
    });

    it('should call onResultsPerPageChange when value is changed', () => {
      render(<Pagination {...defaultProps} />);
      const select = screen.getByLabelText(/Results per page/i);
      fireEvent.change(select, { target: { value: '20' } });
      expect(defaultProps.onResultsPerPageChange).toHaveBeenCalledWith(20);
    });
  });
});
