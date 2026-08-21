import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PaxAutocomplete from './PaxAutocomplete';
import { MemberSummary } from '../../../types/bigdata';

const mockMembers: MemberSummary[] = [
  { memberId: 101, f3Name: 'Bischoff' },
  { memberId: 102, f3Name: 'Lockjaw' },
  { memberId: 103, f3Name: 'Drip' },
];

describe('PaxAutocomplete Component', () => {
  it('renders input with ARIA combobox attributes', () => {
    render(
      <PaxAutocomplete
        id="test-pax"
        label="Test Member"
        members={mockMembers}
        selectedMember={null}
        onSelectMember={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox', { name: 'Test Member' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-controls', 'test-pax-listbox');
  });

  it('opens suggestion listbox on search input and supports keyboard navigation', () => {
    const onSelect = vi.fn();
    render(
      <PaxAutocomplete
        id="test-pax"
        label="Test Member"
        members={mockMembers}
        selectedMember={null}
        onSelectMember={onSelect}
      />
    );

    const input = screen.getByRole('combobox', { name: 'Test Member' });
    fireEvent.change(input, { target: { value: 'Bisc' } });

    expect(input).toHaveAttribute('aria-expanded', 'true');
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const option = screen.getByRole('option', { name: /Bischoff/i });
    expect(option).toBeInTheDocument();
    expect(option).toHaveAttribute('id', 'test-pax-opt-0');

    // Arrow down highlights option and sets aria-activedescendant
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'test-pax-opt-0');
    expect(option).toHaveAttribute('aria-selected', 'true');

    // Enter selects option
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(mockMembers[0]);
  });

  it('renders selected member chip and allows clearing', () => {
    const onSelect = vi.fn();
    render(
      <PaxAutocomplete
        id="test-pax"
        label="Test Member"
        members={mockMembers}
        selectedMember={mockMembers[0]}
        onSelectMember={onSelect}
      />
    );

    expect(screen.getByText('Bischoff')).toBeInTheDocument();
    expect(screen.getByText('#101')).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Change Test Member/i });
    fireEvent.click(clearBtn);

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
