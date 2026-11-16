import { config } from '../config';

/**
 * Builds the Slack OpenID Connect authorization URL.
 * Includes the `team` parameter when `config.slackTeamId` is configured so Slack
 * scopes the login directly to the workspace instead of routing through generic
 * workspace lookup (which can trigger desktop/mobile app handoff loops).
 */
export function buildSlackAuthUrl(state: string): string | null {
  if (!config.slackClientId) {
    return null;
  }

  const params = new URLSearchParams({
    response_type: 'code',
    scope: 'openid profile email',
    client_id: config.slackClientId,
    redirect_uri: config.slackRedirectUri,
    state,
  });

  if (config.slackTeamId) {
    params.set('team', config.slackTeamId);
  }

  return `https://slack.com/openid/connect/authorize?${params.toString()}`;
}
