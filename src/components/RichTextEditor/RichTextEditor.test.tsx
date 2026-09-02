import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RichTextEditor } from './RichTextEditor';

describe('RichTextEditor', () => {
  it('renders toolbar buttons and editor content container', () => {
    const mockOnChange = vi.fn();
    render(
      <RichTextEditor
        content="<p>Hello F3 RVA</p>"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /strikethrough/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inline code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heading 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bullet list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /horizontal rule/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear formatting/i })).toBeInTheDocument();
  });

  it('disables toolbar buttons when disabled prop is true', () => {
    const mockOnChange = vi.fn();
    render(
      <RichTextEditor
        content="<p>Disabled Content</p>"
        onChange={mockOnChange}
        disabled={true}
      />
    );

    expect(screen.getByRole('button', { name: /bold/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /italic/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /strikethrough/i })).toBeDisabled();
  });
});
