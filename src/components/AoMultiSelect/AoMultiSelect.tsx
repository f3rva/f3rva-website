import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AOSummary } from '../../types/bigdata';
import './AoMultiSelect.css';

interface AoMultiSelectProps {
  id: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  aos?: AOSummary[];
  loadingAos?: boolean;
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
      <mark key={i} className="ao-match-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const AoMultiSelect: React.FC<AoMultiSelectProps> = ({
  id,
  label,
  placeholder = 'Type to search or add AO...',
  helpText,
  aos = [],
  loadingAos = false,
  selectedNames = [],
  onChange,
  disabled = false,
  maxSelections,
  icon,
}) => {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<AOSummary[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAtMax = Boolean(maxSelections && selectedNames.length >= maxSelections);

  // Search & rank AO candidates excluding already selected names
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 1 || isAtMax) {
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    const selectedSet = new Set(selectedNames.map((n) => n.trim().toLowerCase()));

    const matches = (aos || [])
      .filter((a) => a && typeof a.description === 'string' && a.description.trim())
      .filter((a) => !selectedSet.has(a.description.trim().toLowerCase()))
      .filter((a) => a.description.toLowerCase().includes(trimmed))
      .sort((a, b) => {
        const aName = a.description.toLowerCase();
        const bName = b.description.toLowerCase();

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
  }, [query, selectedNames, aos, isAtMax]);

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

    const exactMatch = suggestions.some(
      (s) => s.description.trim().toLowerCase() === query.trim().toLowerCase()
    );
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
          addName(suggestions[highlightedIndex].description);
        } else if (highlightedIndex === suggestions.length && !exactMatch) {
          addName(query);
        } else if (suggestions.length > 0) {
          addName(suggestions[0].description);
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
    (s) => s.description.trim().toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <div className="ao-multiselect-container" ref={containerRef}>
      <div className="ao-multiselect-header">
        <label htmlFor={id} className="ao-multiselect-label">
          {icon && <span className="ao-multiselect-icon">{icon}</span>}
          {label}
        </label>
        <span className="ao-multiselect-count" aria-live="polite">
          {selectedNames.length} selected
        </span>
      </div>

      {helpText && <div className="ao-multiselect-help">{helpText}</div>}

      <div
        className={`ao-multiselect-box ${disabled ? 'disabled' : ''} ${isAtMax ? 'at-max' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="ao-chips-wrap">
          {selectedNames.map((name, index) => {
            const trimmedName = String(name || '').trim();
            const isKnownAo = (aos || []).some(
              (a) =>
                a &&
                typeof a.description === 'string' &&
                a.description.trim().toLowerCase() === trimmedName.toLowerCase()
            );

            return (
              <span
                key={`ao-chip-${name}-${index}`}
                className={`ao-chip ${isKnownAo ? 'ao-chip-known' : 'ao-chip-custom'}`}
                title={isKnownAo ? `${name} (Registered AO)` : `${name} (Custom / Pop-up AO)`}
              >
                <span className="ao-chip-avatar">{isKnownAo ? '📍' : '✨'}</span>
                <span className="ao-chip-text">{name}</span>
                <button
                  type="button"
                  className="ao-chip-remove"
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
              className="ao-multiselect-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.trim()) setIsOpen(true);
              }}
              placeholder={
                selectedNames.length === 0
                  ? loadingAos
                    ? 'Loading AOs...'
                    : placeholder
                  : 'Add another AO...'
              }
              disabled={disabled || loadingAos}
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
          className="ao-multiselect-dropdown"
          role="listbox"
          aria-label={`${label} suggestions`}
        >
          {suggestions.map((ao, idx) => (
            <button
              key={`ao-opt-${ao.id || idx}`}
              id={`${id}-opt-${idx}`}
              type="button"
              className={`ao-dropdown-item ${idx === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => addName(ao.description)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              role="option"
              aria-selected={idx === highlightedIndex}
            >
              <span className="ao-dropdown-name">{highlightMatch(ao.description, query)}</span>
              {ao.slug && <span className="ao-dropdown-slug">/{ao.slug}</span>}
            </button>
          ))}

          {query.trim() && !exactMatchExists && (
            <button
              id={`${id}-opt-${suggestions.length}`}
              type="button"
              className={`ao-dropdown-item ao-dropdown-custom ${
                highlightedIndex === suggestions.length ? 'highlighted' : ''
              }`}
              onClick={() => addName(query)}
              onMouseEnter={() => setHighlightedIndex(suggestions.length)}
              role="option"
              aria-selected={highlightedIndex === suggestions.length}
            >
              <span className="ao-dropdown-name">
                ✨ Add &quot;<strong>{query.trim()}</strong>&quot; as custom AO
              </span>
              <span className="ao-dropdown-custom-badge">Custom / Pop-up</span>
            </button>
          )}

          {suggestions.length === 0 && !query.trim() && (
            <div className="ao-dropdown-message">Type to search registered AOs...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AoMultiSelect;
