import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaxMultiSelect } from './PaxMultiSelect';
import { MemberSummary } from '../../types/bigdata';

const mockMembers: MemberSummary[] = [
  { memberId: 1, f3Name: 'Splinter' },
  { memberId: 2, f3Name: 'Bleeder' },
  { memberId: 3, f3Name: 'Swag' },
  { memberId: 4, f3Name: 'Dingo' },
  { memberId: 5, f3Name: 'Lab Rat' },
];

describe('PaxMultiSelect Component', () => {
  it('renders label, count, and preselected chips', () => {
    const handleChange = vi.fn();
    render(
      <PaxMultiSelect
        id="test-pax"
        label="PAX Attendees"
        members={mockMembers}
        selectedNames={['Splinter', 'Bleeder']}
        onChange={handleChange}
      />
    );

    expect(screen.getByText('PAX Attendees')).toBeInTheDocument();
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByText('Splinter')).toBeInTheDocument();
    expect(screen.getByText('Bleeder')).toBeInTheDocument();
  });

  it('filters and selects a member from autocomplete', async () => {
    const handleChange = vi.fn();
    render(
      <PaxMultiSelect
        id="test-pax"
        label="PAX Attendees"
        members={mockMembers}
        selectedNames={[]}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'splint' } });

    // Suggestion item with ID #1 should appear
    const option = await screen.findByText(/ID #1/i);
    expect(option).toBeInTheDocument();

    fireEvent.click(option);
    expect(handleChange).toHaveBeenCalledWith(['Splinter']);
  });

  it('adds custom name on Enter or comma', () => {
    const handleChange = vi.fn();
    render(
      <PaxMultiSelect
        id="test-pax"
        label="PAX Attendees"
        members={mockMembers}
        selectedNames={['Splinter']}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Visiting Guy' } });
    fireEvent.keyDown(input, { key: ',' });

    expect(handleChange).toHaveBeenCalledWith(['Splinter', 'Visiting Guy']);
  });

  it('removes chip when clicking remove button', () => {
    const handleChange = vi.fn();
    render(
      <PaxMultiSelect
        id="test-pax"
        label="PAX Attendees"
        members={mockMembers}
        selectedNames={['Splinter', 'Bleeder']}
        onChange={handleChange}
      />
    );

    const removeSplinterBtn = screen.getByLabelText('Remove Splinter');
    fireEvent.click(removeSplinterBtn);

    expect(handleChange).toHaveBeenCalledWith(['Bleeder']);
  });

  it('removes last chip on Backspace when query input is empty', () => {
    const handleChange = vi.fn();
    render(
      <PaxMultiSelect
        id="test-pax"
        label="PAX Attendees"
        members={mockMembers}
        selectedNames={['Splinter', 'Bleeder']}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(handleChange).toHaveBeenCalledWith(['Splinter']);
  });

  it('supports keyboard navigation through suggestions', () => {
    const handleChange = vi.fn();
    render(
      <PaxMultiSelect
        id="test-pax"
        label="PAX Attendees"
        members={mockMembers}
        selectedNames={[]}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } }); // Matches Swag, Lab Rat

    // Arrow down to highlight first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalled();
  });

  it('differentiates roster members from custom/visiting PAX with custom chip styling', () => {
    const handleChange = vi.fn();
    render(
      <PaxMultiSelect
        id="test-pax"
        label="PAX Attendees"
        members={mockMembers}
        selectedNames={['Splinter', 'Visiting Guy']}
        onChange={handleChange}
      />
    );

    const splinterChip = screen.getByText('Splinter').closest('.pax-chip');
    const customChip = screen.getByText('Visiting Guy').closest('.pax-chip');

    expect(splinterChip).toHaveClass('pax-chip-roster');
    expect(splinterChip).toHaveAttribute('title', 'Splinter (F3 RVA Roster)');
    expect(customChip).toHaveClass('pax-chip-custom');
    expect(customChip).toHaveAttribute('title', 'Visiting Guy (New / Visiting PAX)');
    expect(screen.getByText('✨')).toBeInTheDocument();
  });
});
