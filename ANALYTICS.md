# Google Analytics Integration

This site includes a Google Analytics implementation that is configured at build time.

## Configuration

The Google Analytics Measurement ID is injected into the application during the build process using the `VITE_GOOGLE_ANALYTICS_ID` environment variable. This is handled by the CI/CD pipeline, which uses secrets to configure different IDs for development and production environments.

- **Development:** Uses `secrets.DEV_GOOGLE_ANALYTICS_ID`
- **Production:** Uses `secrets.PROD_GOOGLE_ANALYTICS_ID`

## Features

- **Google Consent Mode v2:** Default `analytics_storage: 'denied'` enables privacy-compliant cookieless pings and machine learning modeling; dynamically updates to `'granted'` upon user consent.
- **SPA Pageview & Title Synchronization:** Explicit GA4 `page_view` events with asynchronous React 19 document metadata resolution.
- **Strictly Typed Custom Event Taxonomy:** Centralized in `src/utils/analytics.ts` (zero `any`).
- **Community Conversion Telemetry:** Tracks workout directions clicks, AO tags, FNG video plays, Big Data searches, alias claims, and outbound community links.
- **Error Telemetry:** Automatic `page_not_found` capture on 404 pages.

## How it Works

1. The `GoogleAnalytics` component reads `import.meta.env.VITE_GOOGLE_ANALYTICS_ID` and validates format.
2. Initializes Google Consent Mode v2 with default restricted storage and loads `gtag.js`.
3. Listens for `cookieConsentAccepted` and `cookieConsentDeclined` events to dynamically update consent.
4. Automatically tracks route transitions and document titles via `page_view` events.
5. Interactive components dispatch typed telemetry via helper functions in `src/utils/analytics.ts`.

## Event Taxonomy

- `workout_directions_click`: Clicked map directions for an AO.
- `workout_tag_click`: Clicked AO name in schedule table to view backblasts.
- `fng_video_play`: Played "What is F3?" Vimeo video.
- `fng_podcast_click`: Clicked Art of Manliness podcast link.
- `fng_find_workout_click`: Clicked New Guy CTA to view schedule.
- `bigdata_search`: Searched PAX or AO in Big Data universal search.
- `bigdata_search_select`: Selected a PAX or AO from search dropdown.
- `claim_alias_submit`: Submitted an alias claim request.
- `community_outbound_click`: Clicked Slack, Instagram, Facebook, X, or F3Nation links.
- `page_not_found`: Hit a 404 route with broken path and referrer.

## Development vs Production

The CI/CD pipeline automatically handles the configuration for both development and production environments by setting the appropriate `VITE_GOOGLE_ANALYTICS_ID` at build time.