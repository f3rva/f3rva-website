/**
 * Sitemap generation script for F3RVA website
 * Generates XML sitemap for better search engine indexing
 */

import fs from 'fs';
import path from 'path';

const baseUrl = 'https://f3rva.org';

// Define site routes with their properties
const routes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'weekly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/about',
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/schedule',
    priority: '0.9',
    changefreq: 'weekly',
    lastmod: new Date().toISOString()
  },
  {
    path: '/new-guy',
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: new Date().toISOString()
  }
];

/**
 * Generate XML sitemap content
 */
function generateSitemap() {
  const sitemapHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;
  
  const sitemapFooter = `</urlset>`;
  
  const urlEntries = routes.map(route => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <priority>${route.priority}</priority>
    <changefreq>${route.changefreq}</changefreq>
  </url>`).join('\n');
  
  return `${sitemapHeader}
${urlEntries}
${sitemapFooter}`;
}

/**
 * Write sitemap to public directory
 */
function writeSitemap() {
  const sitemap = generateSitemap();
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log(`✅ Sitemap generated successfully at: ${sitemapPath}`);
  console.log(`📄 Generated ${routes.length} URL entries`);
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🚀 Generating sitemap for F3RVA website...');
    writeSitemap();
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSitemap, writeSitemap, routes };