# Google Analytics Integration

This site includes a Google Analytics implementation that is configured at build time.

## Configuration

The Google Analytics Measurement ID is injected into the application during the build process using the `VITE_GOOGLE_ANALYTICS_ID` environment variable. This is handled by the CI/CD pipeline, which uses secrets to configure different IDs for development and production environments.

- **Development:** Uses `secrets.DEV_GOOGLE_ANALYTICS_ID`
- **Production:** Uses `secrets.PROD_GOOGLE_ANALYTICS_ID`

## Features

- Automatic page view tracking on route changes
- Clean, minimal implementation
- Build-time configuration
- Automatic script loading
- Safe initialization (won't break if ID is not set)

## How it Works

1. The `GoogleAnalytics` component reads `import.meta.env.VITE_GOOGLE_ANALYTICS_ID`.
2. If the ID is present, it loads the Google Analytics script and initializes tracking.
3. Page views are automatically tracked when routes change.
4. If no ID is configured, analytics is safely disabled.

## Development vs Production

The CI/CD pipeline automatically handles the configuration for both development and production environments by setting the appropriate `VITE_GOOGLE_ANALYTICS_ID` at build time.