import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../../config';
import { MemberSummary, AOAttendanceSummary } from '../../types/bigdata';
import { trackBigDataSearch, trackBigDataSearchSelect } from '../../utils/analytics';
import './BigDataSearch.css';

interface BigDataSearchProps {
  placeholder?: string;
}

export const BigDataSearch: React.FC<BigDataSearchProps> = ({
  placeholder = "Search any PAX or AO (e.g., 'Shakedown', 'Forge')...",
}) => {
  const [query, setQuery] = useState<string>('');
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [aos, setAos] = useState<AOAttendanceSummary[]>([]);
  const [allAos, setAllAos] = useState<AOAttendanceSummary[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Pre-fetch all AOs once for fast client-side filtering
  useEffect(() => {
    let isMounted = true;
    const fetchAos = async () => {
      try {
        const res = await fetch(`${config.apiBaseUrl}/v2/reports/ao`);
        if (res.ok) {
          const data: AOAttendanceSummary[] = await res.json();
          if (isMounted) setAllAos(data);
        }
      } catch {
        // Silently handle if AO fetch fails
      }
    };
    fetchAos();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced search for members & AOs
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setMembers([]);
      setAos([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      // Filter AOs locally
      const matchingAos = allAos
        .filter((ao) => ao.description.toLowerCase().includes(trimmed.toLowerCase()))
        .slice(0, 5);
      setAos(matchingAos);

      // Fetch matching members from API
      let fetchedMembers: MemberSummary[] = [];
      try {
        const memberRes = await fetch(
          `${config.apiBaseUrl}/v2/members/lookup?name=${encodeURIComponent(trimmed)}`
        );
        if (memberRes.ok) {
          fetchedMembers = await memberRes.json();
          setMembers(fetchedMembers.slice(0, 8));
        } else {
          setMembers([]);
        }
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
        setIsOpen(true);
        trackBigDataSearch({
          searchTerm: trimmed,
          paxCount: fetchedMembers.length,
          aoCount: matchingAos.length,
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, allAos]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectPax = useCallback(
    (member: MemberSummary) => {
      trackBigDataSearchSelect({
        searchTerm: query,
        selectedType: 'pax',
        selectedId: member.memberId,
        selectedName: member.f3Name,
      });
      setIsOpen(false);
      setQuery('');
      navigate(`/bigdata/pax/${member.memberId}`);
    },
    [navigate, query]
  );

  const handleSelectAo = useCallback(
    (ao: AOAttendanceSummary) => {
      trackBigDataSearchSelect({
        searchTerm: query,
        selectedType: 'ao',
        selectedId: ao.aoId,
        selectedName: ao.description,
      });
      setIsOpen(false);
      setQuery('');
      navigate(`/bigdata/ao/${ao.aoId}`);
    },
    [navigate, query]
  );

  const hasResults = members.length > 0 || aos.length > 0;

  return (
    <div ref={searchContainerRef} className="bigdata-search-wrapper">
      <div className="bigdata-search-bar">
        <span className="bigdata-search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          className="bigdata-search-field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          aria-label="Universal Search"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="bigdata-search-clear-btn"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="bigdata-search-dropdown" role="listbox">
          {loading && (
            <div className="bigdata-search-loading">Searching members and locations...</div>
          )}

          {!loading && !hasResults && (
            <div className="bigdata-search-no-results">
              No PAX or AOs found matching <strong>&quot;{query}&quot;</strong>
            </div>
          )}

          {!loading && hasResults && (
            <>
              {aos.length > 0 && (
                <div className="bigdata-search-category">
                  <div className="bigdata-search-category-title">📍 Areas of Operation (AOs)</div>
                  {aos.map((ao) => (
                    <button
                      key={`ao-${ao.aoId}`}
                      type="button"
                      className="bigdata-search-item"
                      onClick={() => handleSelectAo(ao)}
                    >
                      <div className="bigdata-search-item-primary">{ao.description}</div>
                      <div className="bigdata-search-item-badge ao-badge">
                        Avg {ao.averagePax} PAX
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {members.length > 0 && (
                <div className="bigdata-search-category">
                  <div className="bigdata-search-category-title">👤 PAX Members</div>
                  {members.map((member) => (
                    <button
                      key={`member-${member.memberId}`}
                      type="button"
                      className="bigdata-search-item"
                      onClick={() => handleSelectPax(member)}
                    >
                      <div className="bigdata-search-item-primary">{member.f3Name}</div>
                      <div className="bigdata-search-item-badge pax-badge">ID #{member.memberId}</div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BigDataSearch;
