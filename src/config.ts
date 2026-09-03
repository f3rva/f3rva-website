/**
 * Application configuration loaded from environment variables
 *
 * Environment files loaded in order of precedence:
 * 1. .env.local (highest priority, not committed to git)
 * 2. .env.development / .env.production (based on NODE_ENV)
 * 3. .env (lowest priority, committed to git)
 */

interface Config {
  /** Base URL for API endpoints */
  apiBaseUrl: string;
  /** Timeout for external API requests in milliseconds */
  apiTimeoutMs: number;
  /** Slack OAuth Client ID for Member Login */
  slackClientId: string;
  /** Slack OAuth Redirect URI */
  slackRedirectUri: string;
}

export const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiTimeoutMs: 10000,
  slackClientId: import.meta.env.VITE_SLACK_CLIENT_ID || '',
  slackRedirectUri:
    import.meta.env.VITE_SLACK_REDIRECT_URI ||
    (typeof window !== 'undefined' ? `${window.location.origin}/auth/slack/callback` : '/auth/slack/callback'),
};

// Validate required environment variables in development
if (import.meta.env.DEV) {
  console.log('🔧 Config loaded:', {
    apiBaseUrl: config.apiBaseUrl,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  });
}
