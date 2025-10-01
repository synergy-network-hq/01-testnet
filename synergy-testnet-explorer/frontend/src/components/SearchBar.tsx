import React, { useState } from "react";
import "../styles/SearchBar.css";
import "font-awesome/css/font-awesome.min.css";

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState("");

    return (
        <div className="search-bar">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Block #, Tx Hash, or Address" />
            <button
                type="button"
                className="fa fa-search"
            >
            </button>
        </div>
    );
};

export default SearchBar;
