import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  /** Optional message text to display under the spinner */
  message?: string;
  /** Size of the spinner: 'small', 'medium', or 'large' (default is 'medium') */
  size?: 'small' | 'medium' | 'large';
  /** Fullscreen overlay mode */
  fullScreen?: boolean;
}

/**
 * LoadingSpinner component provides a premium, modern animated spinner
 * in harmony with the F3 RVA brand aesthetic.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
}) => {
  const containerClassName = `f3-spinner-container size-${size} ${fullScreen ? 'fullscreen' : ''}`;

  return (
    <div className={containerClassName} data-testid="loading-spinner">
      <div className="f3-spinner-visual">
        <svg
          className="f3-spinner-svg"
          viewBox="0 0 50 50"
          aria-hidden="true"
        >
          {/* Background track circle */}
          <circle
            className="f3-spinner-track"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
          {/* Animated pulsing/spinning head arc */}
          <circle
            className="f3-spinner-head"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <div className="f3-spinner-center-glow" />
      </div>
      {message && <p className="f3-spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
