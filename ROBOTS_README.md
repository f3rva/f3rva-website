# Robots.txt Environment Configuration

This project uses environment-specific robots.txt files to control search engine crawling behavior across development and production environments.

## Files Structure

```
public/
├── robots-dev.txt    # Development robots.txt (blocks all crawlers)
├── robots-prod.txt   # Production robots.txt (allows crawlers with restrictions)
└── robots.txt        # Auto-generated from environment-specific file
```

## Environment Configurations

### Development (`robots-dev.txt`)
- **Purpose**: Blocks all search engine crawlers
- **Behavior**: 
  - Disallows all user agents from crawling any content
  - No sitemap reference
  - High crawl delay (86400 seconds = 24 hours)
- **Usage**: Used for development/staging environments to prevent indexing

### Production (`robots-prod.txt`)
- **Purpose**: Allows crawlers with appropriate restrictions
- **Behavior**:
  - Allows crawling of public content
  - Blocks admin, private, and API endpoints
  - Includes sitemap reference
  - Reasonable crawl delay (1 second)
- **Usage**: Used for production environment to enable SEO

## GitHub Actions Integration

The deployment workflow automatically uses the correct robots.txt:

### Development Deployment
- **Trigger**: Push to `main` branch
- **Robots**: Uses `robots-dev.txt` (blocks crawlers)
- **Environment**: Development/staging site

### Production Deployment
- **Trigger**: Release published
- **Robots**: Uses `robots-prod.txt` (allows crawlers)
- **Environment**: Production site

## Local Development

### NPM Scripts
```bash
# Development server (auto-sets dev robots.txt)
npm run dev
npm run start

# Build commands
npm run build:dev    # Build with development robots.txt
npm run build:prod   # Build with production robots.txt

# Manual robots.txt setup
npm run setup-robots:dev   # Set robots.txt to development version
npm run setup-robots:prod  # Set robots.txt to production version
```

### Manual Setup
```bash
# Set development robots.txt
node scripts/setup-robots.js dev

# Set production robots.txt
node scripts/setup-robots.js prod
```

## How It Works

1. **Environment-specific files**: Two separate robots.txt files are maintained
2. **Build-time selection**: The appropriate file is copied to `robots.txt` during build
3. **GitHub Actions**: Deployment workflows automatically select the correct version
4. **Local development**: Scripts ensure the correct version is used locally

## Benefits

- **SEO Protection**: Development sites are completely blocked from indexing
- **Production Optimization**: Production sites have proper crawler guidance
- **Automatic Deployment**: No manual intervention needed for deployments
- **Local Development**: Easy switching between configurations

## Maintenance

- **Update Development Rules**: Edit `public/robots-dev.txt`
- **Update Production Rules**: Edit `public/robots-prod.txt`
- **Never Edit**: `public/robots.txt` (auto-generated, will be overwritten)

## Verification

After deployment, verify the correct robots.txt is in use:

```bash
# Check development site
curl https://dev.f3rva.org/robots.txt

# Check production site  
curl https://f3rva.org/robots.txt
```