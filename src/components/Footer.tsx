import React from 'react';
import { FaFacebook, FaInstagram, FaSlack, FaXTwitter } from 'react-icons/fa6';
import { trackCommunityOutboundClick } from '../utils/analytics';
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
        
        <div className="footer-links-section">
          <h4 className="footer-section-title">Related Links</h4>
          <div className="external-links">
            <a 
              href="https://backblasts.f3rva.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link"
              onClick={() =>
                trackCommunityOutboundClick({
                  platform: 'backblasts',
                  destinationUrl: 'https://backblasts.f3rva.org',
                })
              }
            >
              Backblasts
            </a>
            <a 
              href="https://f3nation.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link"
              onClick={() =>
                trackCommunityOutboundClick({
                  platform: 'f3nation',
                  destinationUrl: 'https://f3nation.com',
                })
              }
            >
              F3Nation
            </a>
          </div>
        </div>

        <div className="footer-contact-section">
          <h4 className="footer-section-title">Connect</h4>
          <p className="footer-contact-info">
          </p>
          <div className="social-media-links">
            <a 
              href="https://f3-rva-workspace.slack.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Engage with F3RVA on Slack"
              onClick={() =>
                trackCommunityOutboundClick({
                  platform: 'slack',
                  destinationUrl: 'https://f3-rva-workspace.slack.com',
                })
              }
            >
              <FaSlack size={24} />
            </a>
            <a 
              href="https://instagram.com/F3Richmond" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Follow F3RVA on Instagram"
              onClick={() =>
                trackCommunityOutboundClick({
                  platform: 'instagram',
                  destinationUrl: 'https://instagram.com/F3Richmond',
                })
              }
            >
              <FaInstagram size={24} />
            </a>
            <a 
              href="https://facebook.com/F3Richmond" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Follow F3RVA on Facebook"
              onClick={() =>
                trackCommunityOutboundClick({
                  platform: 'facebook',
                  destinationUrl: 'https://facebook.com/F3Richmond',
                })
              }
            >
              <FaFacebook size={24} />
            </a>
            <a 
              href="https://x.com/F3Richmond" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Follow F3RVA on Twitter"
              onClick={() =>
                trackCommunityOutboundClick({
                  platform: 'x',
                  destinationUrl: 'https://x.com/F3Richmond',
                })
              }
            >
              <FaXTwitter size={24} />
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