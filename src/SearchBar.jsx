import React, { useState } from "react";

function SearchBar({ onPlaceSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(
        query
      )}`
    );
    const data = await res.json();
    setResults(data);

    if (data.length > 0) {
      onPlaceSelect(data[0]); // pick first by default
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a place"
          style={{ width: "200px", padding: "5px" }}
        />
        <button type="submit">Search</button>
      </form>

      {/* Show multiple results */}
      <ul>
        {results.map((r, i) => (
          <li
            key={i}
            style={{ cursor: "pointer" }}
            onClick={() => onPlaceSelect(r)}
          >
            {r.display_name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchBar;
