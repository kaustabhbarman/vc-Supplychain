import React from 'react';
import './SearchContainer.css'

const SearchContainer = ({ cid, onCidChange, onCidSubmit }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search for a Content Identifier here..."
        value={cid}
        onChange={onCidChange}
      />
      <button onClick={() => onCidSubmit(cid)} className="search-button">
        Search
      </button>
    </div>
  );
};

export default SearchContainer;