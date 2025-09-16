import React from "react";

function SavedPlaces({ places, onSelect }) {
  return (
    <ul>
      {places.length === 0 && <li>No saved places</li>}
      {places.map((p, idx) => (
        <li key={idx} style={{ cursor: "pointer" }} onClick={() => onSelect([p.lat, p.lng])}>
          {p.name}
        </li>
      ))}
    </ul>
  );
}

export default SavedPlaces;
