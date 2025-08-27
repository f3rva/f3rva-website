import React from 'react';
import MainNavigationHeader from './Header';
import Footer from './Footer';
import './Layout.css';

interface MainSiteLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

/**
 * Main layout wrapper component for F3 RVA website
 * Provides consistent page structure with header, main content, and footer
 * Ensures proper semantic HTML structure and accessibility landmarks
 */
const MainSiteLayout: React.FC<MainSiteLayoutProps> = ({ children, pageTitle }) => {
  return (
    <div className="main-site-layout">
      <MainNavigationHeader />
      
      <main className="primary-content-area" role="main">
        {pageTitle && (
          <div className="page-title-section">
            <h1 className="page-main-title">{pageTitle}</h1>
          </div>
        )}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainSiteLayout;