import React, { useState } from "react";

const SearchBar = ({ onPlaceSelect }) => {
  const [query, setQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    // Nominatim API for place search
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.length > 0) {
      const place = data[0]; // take first result
      onPlaceSelect({
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        display_name: place.display_name,
      });
    } else {
      alert("No results found!");
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ marginBottom: "10px" }}>
      <input
        type="text"
        placeholder="Search for a location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "8px", width: "250px", marginRight: "8px" }}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
