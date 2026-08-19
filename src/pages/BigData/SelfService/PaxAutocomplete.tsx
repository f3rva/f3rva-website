import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MemberSummary } from '../../../types/bigdata';

interface PaxAutocompleteProps {
  id: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  members: MemberSummary[];
  loadingMembers?: boolean;
  selectedMember: MemberSummary | null;
  onSelectMember: (member: MemberSummary | null) => void;
  disabled?: boolean;
}

export const PaxAutocomplete: React.FC<PaxAutocompleteProps> = ({
  id,
  label,
  placeholder = 'Type to search PAX by name...',
  helpText,
  members = [],
  loadingMembers = false,
  selectedMember,
  onSelectMember,
  disabled = false,
}) => {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<MemberSummary[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Instant in-memory client-side search across pre-fetched members
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 1 || selectedMember) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const matches = members
      .filter((m) => m.f3Name.toLowerCase().includes(trimmed))
      .slice(0, 10);

    setSuggestions(matches);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, [query, selectedMember, members]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = useCallback(
    (member: MemberSummary) => {
      onSelectMember(member);
      setQuery('');
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onSelectMember]
  );

  const handleClear = useCallback(() => {
    onSelectMember(null);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [onSelectMember]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && query.trim().length >= 1) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="pax-autocomplete-container" ref={containerRef}>
      <label htmlFor={id} className="pax-autocomplete-label">
        {label}
      </label>

      {helpText && <div className="pax-autocomplete-help">{helpText}</div>}

      {selectedMember ? (
        <div className="pax-selected-chip">
          <div className="pax-selected-info">
            <span className="pax-selected-icon">👤</span>
            <span className="pax-selected-name">{selectedMember.f3Name}</span>
            <span className="pax-selected-id">#{selectedMember.memberId}</span>
          </div>
          <button
            type="button"
            className="pax-chip-clear-btn"
            onClick={handleClear}
            disabled={disabled}
            aria-label={`Change ${label}`}
          >
            ✕ Change
          </button>
        </div>
      ) : (
        <div className="pax-autocomplete-input-wrapper">
          <span className="pax-input-icon" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            id={id}
            type="text"
            className="pax-autocomplete-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim().length >= 1) setIsOpen(true);
            }}
            placeholder={loadingMembers ? 'Loading members roster...' : placeholder}
            disabled={disabled || loadingMembers}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            role="combobox"
          />
          {loadingMembers && <span className="pax-input-spinner">...</span>}
        </div>
      )}

      {isOpen && !selectedMember && (
        <div className="pax-autocomplete-dropdown" role="listbox">
          {suggestions.length === 0 ? (
            <div className="pax-dropdown-message">
              No members found matching <strong>&quot;{query}&quot;</strong>
            </div>
          ) : (
            suggestions.map((member, idx) => (
              <button
                key={`sugg-${member.memberId}`}
                type="button"
                className={`pax-dropdown-item ${idx === highlightedIndex ? 'highlighted' : ''}`}
                onClick={() => handleSelect(member)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                role="option"
                aria-selected={idx === highlightedIndex}
              >
                <span className="pax-dropdown-name">{member.f3Name}</span>
                <span className="pax-dropdown-id">ID #{member.memberId}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PaxAutocomplete;
