import React, { useState } from 'react';
import '../styles/docs.css';
import { Button } from '@chakra-ui/react';

const DocSearchBar = () => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      console.log(`Searching for: ${query}`);
      // Later: emit query to search engine or parent component
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="doc-searchbar">
      <input
        type="text"
        id="search"
        placeholder="Search documentation..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button className="wizard-btn doc-search-button" onClick={handleSearch} fontSize="sm" px={4} py={2}>
        Search
      </Button>
    </div>
  );
};

export default DocSearchBar;
