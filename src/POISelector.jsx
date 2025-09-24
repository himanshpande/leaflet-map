import React, { useState } from "react";

function POISelector({ routeCoords, setPois, setPoiCounts }) {
  const [selected, setSelected] = useState([]);

  const categories = {
    Hospitals: "amenity=hospital",
    Police: "amenity=police",
    Schools: "amenity=school",
    ATMs: "amenity=atm",
    Restaurants: "amenity=restaurant",
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const fetchPOIs = async () => {
    if (!routeCoords || routeCoords.length === 0 || selected.length === 0) return;

    // 🔹 Find bounding box of the route
    let lats = routeCoords.map((c) => c.lat);
    let lngs = routeCoords.map((c) => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    let newPois = [];
    let counts = {};

    for (const category of selected) {
      const query = `
        [out:json][timeout:25];
        (
          node[${categories[category]}](${minLat},${minLng},${maxLat},${maxLng});
        );
        out;
      `;

      const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
      const res = await fetch(url);
      const data = await res.json();

      const pois = data.elements.map((el) => ({
        name: el.tags.name || category,
        position: [el.lat, el.lon],
      }));

      counts[category] = pois.length;
      newPois = [...newPois, ...pois];
    }

    setPois(newPois);
    setPoiCounts(counts);
  };

  return (
    <div>
      <h4>Select POIs</h4>
      {Object.keys(categories).map((cat) => (
        <div key={cat}>
          <label>
            <input
              type="checkbox"
              value={cat}
              onChange={handleChange}
              checked={selected.includes(cat)}
            />
            {cat}
          </label>
        </div>
      ))}
      <button onClick={fetchPOIs} style={{ marginTop: "10px" }}>Find POIs</button>
    </div>
  );
}

export default POISelector;
