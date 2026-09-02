import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MemberSummary } from '../../types/bigdata';
import './PaxMultiSelect.css';

interface PaxMultiSelectProps {
  id: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  members?: MemberSummary[];
  loadingMembers?: boolean;
  selectedNames: string[];
  onChange: (names: string[]) => void;
  disabled?: boolean;
  maxSelections?: number;
  icon?: React.ReactNode;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="pax-match-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const PaxMultiSelect: React.FC<PaxMultiSelectProps> = ({
  id,
  label,
  placeholder = 'Type to search or add name...',
  helpText,
  members = [],
  loadingMembers = false,
  selectedNames = [],
  onChange,
  disabled = false,
  maxSelections,
  icon,
}) => {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<MemberSummary[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAtMax = Boolean(maxSelections && selectedNames.length >= maxSelections);

  // Search & rank candidates excluding already selected names
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 1 || isAtMax) {
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    const selectedSet = new Set(selectedNames.map((n) => n.trim().toLowerCase()));

    const matches = (members || [])
      .filter((m) => m && typeof m.f3Name === 'string' && m.f3Name.trim())
      .filter((m) => !selectedSet.has(m.f3Name.trim().toLowerCase()))
      .filter((m) => m.f3Name.toLowerCase().includes(trimmed))
      .sort((a, b) => {
        const aName = a.f3Name.toLowerCase();
        const bName = b.f3Name.toLowerCase();

        // 1. Exact match first
        const aExact = aName === trimmed;
        const bExact = bName === trimmed;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // 2. Starts with query next
        const aStarts = aName.startsWith(trimmed);
        const bStarts = bName.startsWith(trimmed);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // 3. Word boundary starts with query
        const aWord = aName.includes(' ' + trimmed);
        const bWord = bName.includes(' ' + trimmed);
        if (aWord && !bWord) return -1;
        if (!aWord && bWord) return 1;

        // 4. Shorter length preferred, then alphabetical
        if (aName.length !== bName.length) {
          return aName.length - bName.length;
        }
        return aName.localeCompare(bName);
      })
      .slice(0, 10);

    setSuggestions(matches);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, [query, selectedNames, members, isAtMax]);

  // Scroll active item into view during arrow key navigation
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const activeEl = dropdownRef.current.querySelector(`#${id}-opt-${highlightedIndex}`) as HTMLElement;
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, id]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const exists = selectedNames.some((n) => n.trim().toLowerCase() === trimmed.toLowerCase());
      if (!exists && (!maxSelections || selectedNames.length < maxSelections)) {
        onChange([...selectedNames, trimmed]);
      }
      setQuery('');
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [selectedNames, onChange, maxSelections]
  );

  const removeName = useCallback(
    (indexToRemove: number) => {
      onChange(selectedNames.filter((_, idx) => idx !== indexToRemove));
      inputRef.current?.focus();
    },
    [selectedNames, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || (e.key === 'Enter' && !isOpen)) {
      e.preventDefault();
      if (query.trim()) {
        addName(query);
      }
      return;
    }

    if (e.key === 'Backspace' && !query && selectedNames.length > 0) {
      e.preventDefault();
      removeName(selectedNames.length - 1);
      return;
    }

    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && query.trim()) {
        setIsOpen(true);
      }
      return;
    }

    // Total dropdown options = suggestions + (custom add option if query doesn't exactly match top suggestion)
    const exactMatch = suggestions.some((s) => s.f3Name.trim().toLowerCase() === query.trim().toLowerCase());
    const totalOptions = exactMatch ? suggestions.length : suggestions.length + 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < 0 ? 0 : prev < totalOptions - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev <= 0 ? totalOptions - 1 : prev - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          addName(suggestions[highlightedIndex].f3Name);
        } else if (highlightedIndex === suggestions.length && !exactMatch) {
          addName(query);
        } else if (suggestions.length > 0) {
          addName(suggestions[0].f3Name);
        } else if (query.trim()) {
          addName(query);
        }
        break;
      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const exactMatchExists = suggestions.some(
    (s) => s.f3Name.trim().toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <div className="pax-multiselect-container" ref={containerRef}>
      <div className="pax-multiselect-header">
        <label htmlFor={id} className="pax-multiselect-label">
          {icon && <span className="pax-multiselect-icon">{icon}</span>}
          {label}
        </label>
        <span className="pax-multiselect-count" aria-live="polite">
          {selectedNames.length} selected
        </span>
      </div>

      {helpText && <div className="pax-multiselect-help">{helpText}</div>}

      <div
        className={`pax-multiselect-box ${disabled ? 'disabled' : ''} ${isAtMax ? 'at-max' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="pax-chips-wrap">
          {selectedNames.map((name, index) => {
            const trimmedName = String(name || '').trim();
            const isRoster = (members || []).some(
              (m) =>
                m &&
                typeof m.f3Name === 'string' &&
                m.f3Name.trim().toLowerCase() === trimmedName.toLowerCase()
            );

            return (
              <span
                key={`chip-${name}-${index}`}
                className={`pax-chip ${isRoster ? 'pax-chip-roster' : 'pax-chip-custom'}`}
                title={isRoster ? `${name} (F3 RVA Roster)` : `${name} (New / Visiting PAX)`}
              >
                <span className="pax-chip-avatar">{isRoster ? '👤' : '✨'}</span>
                <span className="pax-chip-text">{name}</span>
                <button
                  type="button"
                  className="pax-chip-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeName(index);
                  }}
                  disabled={disabled}
                  aria-label={`Remove ${name}`}
                >
                  ✕
                </button>
              </span>
            );
          })}

          {!isAtMax && (
            <input
              ref={inputRef}
              id={id}
              type="text"
              className="pax-multiselect-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.trim()) setIsOpen(true);
              }}
              placeholder={
                selectedNames.length === 0
                  ? loadingMembers
                    ? 'Loading roster...'
                    : placeholder
                  : 'Add more (type or comma)...'
              }
              disabled={disabled || loadingMembers}
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls={`${id}-listbox`}
              aria-activedescendant={
                isOpen && highlightedIndex >= 0 ? `${id}-opt-${highlightedIndex}` : undefined
              }
            />
          )}
        </div>
      </div>

      {isOpen && !isAtMax && (
        <div
          ref={dropdownRef}
          id={`${id}-listbox`}
          className="pax-multiselect-dropdown"
          role="listbox"
          aria-label={`${label} suggestions`}
        >
          {suggestions.map((member, idx) => (
            <button
              key={`opt-${member.memberId}`}
              id={`${id}-opt-${idx}`}
              type="button"
              className={`pax-dropdown-item ${idx === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => addName(member.f3Name)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              role="option"
              aria-selected={idx === highlightedIndex}
            >
              <span className="pax-dropdown-name">{highlightMatch(member.f3Name, query)}</span>
              <span className="pax-dropdown-id">ID #{member.memberId}</span>
            </button>
          ))}

          {query.trim() && !exactMatchExists && (
            <button
              id={`${id}-opt-${suggestions.length}`}
              type="button"
              className={`pax-dropdown-item pax-dropdown-custom ${
                highlightedIndex === suggestions.length ? 'highlighted' : ''
              }`}
              onClick={() => addName(query)}
              onMouseEnter={() => setHighlightedIndex(suggestions.length)}
              role="option"
              aria-selected={highlightedIndex === suggestions.length}
            >
              <span className="pax-dropdown-name">
                ✨ Add &quot;<strong>{query.trim()}</strong>&quot; as custom PAX
              </span>
              <span className="pax-dropdown-custom-badge">New / Visiting</span>
            </button>
          )}

          {suggestions.length === 0 && !query.trim() && (
            <div className="pax-dropdown-message">Type to search F3 roster...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaxMultiSelect;
