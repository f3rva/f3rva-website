# Google Analytics Integration

This site includes a simple Google Analytics implementation that can be configured externally without modifying the code.

## Configuration

To enable Google Analytics tracking, uncomment and configure the script in `index.html`:

```html
<!-- Google Analytics Configuration -->
<script>window.GOOGLE_ANALYTICS_ID = 'G-XXXXXXXXXX';</script>
```

Replace `G-XXXXXXXXXX` with your actual Google Analytics Measurement ID.

## Features

- Automatic page view tracking on route changes
- Clean, minimal implementation
- No build platform dependencies
- Externalized configuration
- Automatic script loading
- Safe initialization (won't break if ID is not set)

## How it Works

1. The `GoogleAnalytics` component checks for `window.GOOGLE_ANALYTICS_ID`
2. If found, it loads the Google Analytics script and initializes tracking
3. Page views are automatically tracked when routes change
4. If no ID is configured, analytics is safely disabled

## Development vs Production

The same configuration works for both development and production. Simply set different analytics IDs in different environments' HTML files as needed.