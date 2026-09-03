# Environment Configuration

This project uses Vite's environment variable system for managing configuration across different environments.

## Environment Files

The following environment files are used (in order of precedence):

1. **`.env.local`** - Local overrides (highest priority, not committed to git)
2. **`.env.development`** - Development-specific config (loaded when NODE_ENV=development)
3. **`.env.production`** - Production-specific config (loaded when NODE_ENV=production)
4. **`.env`** - Default config (lowest priority, committed to git)

## Available Variables

### `VITE_API_BASE_URL`
Base URL for API endpoints.

- **Local**: `http://localhost:8000` (default fallback)
- **Development**: `https://api.dev.f3rva.org`
- **Production**: `https://api.f3rva.org`

### `VITE_SLACK_CLIENT_ID`
Slack App Client ID for Sign in with Slack (OpenID Connect).

### `VITE_SLACK_REDIRECT_URI`
OAuth redirect URI callback endpoint.

- **Local**: `http://localhost:3000/auth/slack/callback` (or `http://localhost:5173/auth/slack/callback`)
- **Development**: `https://dev.f3rva.org/auth/slack/callback`
- **Production**: `https://f3rva.org/auth/slack/callback`

## Usage

### Local Development
```bash
npm run dev
# or
npm start
```
Uses `.env` by default (local API server)

### Development Build
```bash
npm run build:dev
```
Uses `.env.development` configuration

### Production Build
```bash
npm run build:prod
```
Uses `.env.production` configuration

## Local Overrides

To override environment variables locally:

1. Copy `.env.local.example` to `.env.local`
2. Modify values as needed
3. `.env.local` is ignored by git and will not be committed

Example `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Adding New Variables

1. Add the variable to appropriate `.env*` files with the `VITE_` prefix
2. Update the `Config` interface in `src/config.ts`
3. Add the variable to the config object
4. Document it in this file

## Important Notes

- Only variables prefixed with `VITE_` are exposed to the client-side code
- Environment files are loaded by Vite at build time, not runtime
- Never commit sensitive data to `.env`, `.env.development`, or `.env.production`
- Use `.env.local` for sensitive or personal configuration