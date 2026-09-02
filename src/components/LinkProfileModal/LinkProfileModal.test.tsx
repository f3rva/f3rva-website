import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinkProfileModal } from './LinkProfileModal';

describe('LinkProfileModal', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/v2/members')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ memberId: 1, f3Name: 'Dingo' }],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          isLinked: true,
          accessToken: 'jwt-access-token-xyz',
          expiresIn: 86400,
          user: { memberId: 1, f3Name: 'Dingo', role: 'member' },
        }),
      } as Response);
    });
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <LinkProfileModal
        isOpen={false}
        tempToken="temp-token-123"
        slackDisplayName="Dingo"
        suggestedMember={{ memberId: 1, f3Name: 'Dingo' }}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with suggestion when open', () => {
    render(
      <LinkProfileModal
        isOpen={true}
        tempToken="temp-token-123"
        slackDisplayName="Dingo"
        suggestedMember={{ memberId: 1, f3Name: 'Dingo' }}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('heading', { name: /link your slack profile/i })).toBeInTheDocument();
    expect(screen.getByText(/Welcome,/i)).toBeInTheDocument();
    expect(screen.getAllByText('Dingo', { selector: 'strong' }).length).toBeGreaterThan(0);
    expect(screen.getByText('✓ Selected')).toBeInTheDocument();
  });

  it('submits confirmation and calls onSuccess with token', async () => {
    render(
      <LinkProfileModal
        isOpen={true}
        tempToken="temp-token-123"
        slackDisplayName="Dingo"
        suggestedMember={{ memberId: 1, f3Name: 'Dingo' }}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /confirm & log in/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        'jwt-access-token-xyz',
        86400,
        { memberId: 1, f3Name: 'Dingo', role: 'member' }
      );
    });
  });

  it('handles cancellation when close button is clicked', () => {
    render(
      <LinkProfileModal
        isOpen={true}
        tempToken="temp-token-123"
        slackDisplayName="Dingo"
        suggestedMember={null}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
