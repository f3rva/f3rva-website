import React from 'react';
import { FaFacebook, FaInstagram, FaSlack, FaTwitter } from 'react-icons/fa';
import './Footer.css';

/**
 * Footer component for F3 RVA website
 * Contains organization information, social media links, and copyright
 * Provides consistent footer content across all pages
 */
const Footer: React.FC = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-content-container">
        <div className="footer-info-section">
          <h3 className="footer-organization-name">F3RVA</h3>
          <p className="footer-mission-statement">
            Building stronger men through fitness, fellowship, and faith in the Richmond region.
          </p>
        </div>
        
        <div className="footer-contact-section">
          <h4 className="footer-section-title">Connect With Us</h4>
          <p className="footer-contact-info">
            Connect with us through various social platforms.
          </p>
          <div className="social-media-links">
            <a 
              href="https://f3-rva-workspace.slack.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Engage with F3RVA on Slack"
            >
              <FaSlack size={24} />
            </a>
            <a 
              href="http://instagram.com/F3Richmond" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Follow F3RVA on Instagram"
            >
              <FaInstagram size={24} />
            </a>
            <a 
              href="http://facebook.com/F3Richmond" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Follow F3RVA on Facebook"
            >
              <FaFacebook size={24} />
            </a>
            <a 
              href="http://x.com/F3Richmond" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Follow F3RVA on Twitter"
            >
              <FaTwitter size={24} />
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-copyright-section">
        <p className="copyright-text">
          &copy; {new Date().getFullYear()} F3RVA. F3Corporate, LLC. F3Corporate, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;