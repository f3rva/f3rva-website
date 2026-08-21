import React from 'react';
import { Link } from 'react-router-dom';

interface BigDataPageHeaderProps {
  title: string;
  description?: string;
  category?: string;
  actions?: React.ReactNode;
}

/**
 * Standardized Page Header component for all Big Data views.
 * Ensures consistent typography, spacing, breadcrumbs, and layout across the suite.
 */
export const BigDataPageHeader: React.FC<BigDataPageHeaderProps> = ({
  title,
  description,
  category = 'BIG DATA',
  actions,
}) => {
  return (
    <header className="bigdata-header-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="bigdata-breadcrumb">
            <Link to="/bigdata">BIG DATA</Link>
            {category && category !== 'BIG DATA' && (
              <>
                <span style={{ color: '#555' }}>/</span>
                <span>{category}</span>
              </>
            )}
          </div>
          <h1 className="bigdata-page-title">{title}</h1>
          {description && <p className="bigdata-page-desc">{description}</p>}
        </div>
        {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>{actions}</div>}
      </div>
    </header>
  );
};

export default BigDataPageHeader;
