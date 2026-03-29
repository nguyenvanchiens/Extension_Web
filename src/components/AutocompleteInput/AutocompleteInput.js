import React, { useState, useRef, useEffect } from 'react';
import './AutocompleteInput.css';

function AutocompleteInput({ value, onChange, suggestions, placeholder }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  const filtered = value
    ? suggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      )
    : suggestions;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      onChange(filtered[activeIndex]);
      setShowSuggestions(false);
      setActiveIndex(-1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (item) => {
    onChange(item);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
      />
      {showSuggestions && filtered.length > 0 && (
        <ul className="autocomplete-list">
          {filtered.map((item, index) => (
            <li
              key={item}
              className={`autocomplete-item ${index === activeIndex ? 'active' : ''}`}
              onMouseDown={() => handleSelect(item)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {highlightMatch(item, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="highlight">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}

export default AutocompleteInput;
