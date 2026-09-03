import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AoMultiSelect } from './AoMultiSelect';
import { AOSummary } from '../../types/bigdata';

const mockAos: AOSummary[] = [
  { id: 1, description: 'First Watch', slug: 'first-watch' },
  { id: 2, description: 'Dogpile', slug: 'dogpile' },
  { id: 3, description: 'NoToll', slug: 'notoll' },
  { id: 4, description: 'Spider Run', slug: 'spider-run' },
];

describe('AoMultiSelect Component', () => {
  it('renders label, count, and preselected chips', () => {
    const handleChange = vi.fn();
    render(
      <AoMultiSelect
        id="test-ao"
        label="Area of Operations (AO)"
        aos={mockAos}
        selectedNames={['First Watch', 'Dogpile']}
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Area of Operations (AO)')).toBeInTheDocument();
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByText('First Watch')).toBeInTheDocument();
    expect(screen.getByText('Dogpile')).toBeInTheDocument();
  });

  it('filters and selects an AO from autocomplete', async () => {
    const handleChange = vi.fn();
    render(
      <AoMultiSelect
        id="test-ao"
        label="Area of Operations (AO)"
        aos={mockAos}
        selectedNames={[]}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'first' } });

    // Suggestion item with slug /first-watch should appear
    const option = await screen.findByText(/\/first-watch/i);
    expect(option).toBeInTheDocument();

    fireEvent.click(option);
    expect(handleChange).toHaveBeenCalledWith(['First Watch']);
  });

  it('adds custom AO name on Enter or comma', () => {
    const handleChange = vi.fn();
    render(
      <AoMultiSelect
        id="test-ao"
        label="Area of Operations (AO)"
        aos={mockAos}
        selectedNames={['First Watch']}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Pop-up AO' } });
    fireEvent.keyDown(input, { key: ',' });

    expect(handleChange).toHaveBeenCalledWith(['First Watch', 'Pop-up AO']);
  });

  it('removes chip when clicking remove button', () => {
    const handleChange = vi.fn();
    render(
      <AoMultiSelect
        id="test-ao"
        label="Area of Operations (AO)"
        aos={mockAos}
        selectedNames={['First Watch', 'Dogpile']}
        onChange={handleChange}
      />
    );

    const removeBtn = screen.getByLabelText('Remove First Watch');
    fireEvent.click(removeBtn);

    expect(handleChange).toHaveBeenCalledWith(['Dogpile']);
  });

  it('removes last chip on Backspace when query input is empty', () => {
    const handleChange = vi.fn();
    render(
      <AoMultiSelect
        id="test-ao"
        label="Area of Operations (AO)"
        aos={mockAos}
        selectedNames={['First Watch', 'Dogpile']}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(handleChange).toHaveBeenCalledWith(['First Watch']);
  });

  it('differentiates known registered AOs from custom pop-up AOs with custom chip styling', () => {
    const handleChange = vi.fn();
    render(
      <AoMultiSelect
        id="test-ao"
        label="Area of Operations (AO)"
        aos={mockAos}
        selectedNames={['First Watch', 'Secret Convergence']}
        onChange={handleChange}
      />
    );

    const knownChip = screen.getByText('First Watch').closest('.ao-chip');
    const customChip = screen.getByText('Secret Convergence').closest('.ao-chip');

    expect(knownChip).toHaveClass('ao-chip-known');
    expect(knownChip).toHaveAttribute('title', 'First Watch (Registered AO)');
    expect(customChip).toHaveClass('ao-chip-custom');
    expect(customChip).toHaveAttribute('title', 'Secret Convergence (Custom / Pop-up AO)');
    expect(screen.getByText('✨')).toBeInTheDocument();
    expect(screen.getByText('📍')).toBeInTheDocument();
  });
});
