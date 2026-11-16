import { describe, it, expect, beforeEach } from 'vitest';
import { buildSlackAuthUrl } from './slackAuth';
import { config } from '../config';

describe('buildSlackAuthUrl', () => {
  const originalClientId = config.slackClientId;
  const originalRedirectUri = config.slackRedirectUri;
  const originalTeamId = config.slackTeamId;

  beforeEach(() => {
    config.slackClientId = '123.456';
    config.slackRedirectUri = 'https://f3rva.org/auth/slack/callback';
    config.slackTeamId = '';
  });

  afterAll(() => {
    config.slackClientId = originalClientId;
    config.slackRedirectUri = originalRedirectUri;
    config.slackTeamId = originalTeamId;
  });

  it('returns null when slackClientId is not configured', () => {
    config.slackClientId = '';
    expect(buildSlackAuthUrl('/backblast/new')).toBeNull();
  });

  it('builds the OIDC authorize URL without team when slackTeamId is empty', () => {
    const result = buildSlackAuthUrl('/backblast/new');
    expect(result).not.toBeNull();
    const url = new URL(result!);
    expect(url.origin + url.pathname).toBe('https://slack.com/openid/connect/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toBe('openid profile email');
    expect(url.searchParams.get('client_id')).toBe('123.456');
    expect(url.searchParams.get('redirect_uri')).toBe('https://f3rva.org/auth/slack/callback');
    expect(url.searchParams.get('state')).toBe('/backblast/new');
    expect(url.searchParams.has('team')).toBe(false);
  });

  it('includes the team query parameter when slackTeamId is configured', () => {
    config.slackTeamId = 'T0B5MNGH0JJ';
    const result = buildSlackAuthUrl('/bigdata/claim-alias');
    expect(result).not.toBeNull();
    const url = new URL(result!);
    expect(url.searchParams.get('team')).toBe('T0B5MNGH0JJ');
    expect(url.searchParams.get('state')).toBe('/bigdata/claim-alias');
  });
});
