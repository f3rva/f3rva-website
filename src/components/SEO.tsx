import React from 'react';
import { sanitizeJSON } from '../utils/sanitizer';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: object;
  canonical?: string;
}

/**
 * SEO component for managing meta tags, Open Graph, Twitter Cards, and structured data
 * Uses React 19's native document metadata support - elements are automatically hoisted to <head>
 * Provides comprehensive SEO optimization for each page
 */
const SEO: React.FC<SEOProps> = ({
  title = 'F3RVA - Always 70 and Sunny',
  description = 'F3RVA - Fitness, Fellowship, Faith in Richmond, Virginia. Building stronger men through community workouts and leadership development.',
  keywords = ['f3', 'fitness', 'fellowship', 'faith', 'richmond', 'virginia', 'community', 'men', 'workout', 'free'],
  image = '/images/f3-logo.webp',
  url = 'https://f3rva.org',
  type = 'website',
  author = 'F3RVA',
  publishedTime,
  modifiedTime,
  structuredData,
  canonical
}) => {
  const fullTitle = title === 'F3RVA - Always 70 and Sunny' ? title : `${title} | F3RVA`;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;
  const fullCanonicalUrl = canonical || url;

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="F3RVA" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@F3Richmond" />
      <meta name="twitter:creator" content="@F3Richmond" />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Geographic Meta Tags */}
      <meta name="geo.region" content="US-VA" />
      <meta name="geo.placename" content="Richmond, Virginia" />
      <meta name="geo.position" content="37.5407;-77.4360" />
      <meta name="ICBM" content="37.5407, -77.4360" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {sanitizeJSON(structuredData)}
        </script>
      )}
    </>
  );
};

export default SEO;