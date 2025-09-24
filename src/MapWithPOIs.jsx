// src/MapWithPOIs.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Function to move map to new coordinates
function FlyTo({ coords }) {
  const map = useMap();
  if (coords) {
    map.flyTo(coords, 13, { animate: true });
  }
  return null;
}

const poiCategories = {
  Hospital: 'amenity=hospital',
  Police: 'amenity=police',
  School: 'amenity=school',
  ATM: 'amenity=atm',
  Restaurant: 'amenity=restaurant',
};

export default function MapWithPOIs() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);
  const [route, setRoute] = useState([]);
  const [pois, setPois] = useState([]);
  const [selectedPOIs, setSelectedPOIs] = useState([]);
  const [poiSummary, setPoiSummary] = useState({});

  // Geocoding function
  const geocode = async (place) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        place
      )}`
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  };

  // Fetch route using OSRM
  const fetchRoute = async (fromC, toC) => {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromC[1]},${fromC[0]};${toC[1]},${toC[0]}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      return data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    }
    return [];
  };

  // Fetch POIs along route
  const fetchPOIs = async (center) => {
    let poiData = [];
    let summary = {};

    for (let category of selectedPOIs) {
      const query = `
        [out:json];
        node[${poiCategories[category]}](around:2000,${center[0]},${center[1]});
        out;`;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const data = await res.json();
      if (data.elements) {
        const markers = data.elements.map((el) => ({
          id: el.id,
          lat: el.lat,
          lon: el.lon,
          name: el.tags.name || category,
          category,
        }));
        poiData = [...poiData, ...markers];
        summary[category] = markers.length;
      }
    }

    setPois(poiData);
    setPoiSummary(summary);
  };

  // Handle search
  const handleSearch = async () => {
    const fCoords = await geocode(from);
    const tCoords = await geocode(to);
    if (fCoords && tCoords) {
      setFromCoords(fCoords);
      setToCoords(tCoords);
      const r = await fetchRoute(fCoords, tCoords);
      setRoute(r);
      await fetchPOIs(fCoords); // Fetch POIs near starting point
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Controls */}
      <div className="p-4 bg-gray-100 flex gap-2 items-center">
        <input
          type="text"
          placeholder="From..."
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border px-2 py-1"
        />
        <input
          type="text"
          placeholder="To..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border px-2 py-1"
        />
        <select
          multiple
          value={selectedPOIs}
          onChange={(e) =>
            setSelectedPOIs(
              Array.from(e.target.selectedOptions, (opt) => opt.value)
            )
          }
          className="border px-2 py-1"
        >
          {Object.keys(poiCategories).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Search
        </button>
      </div>

      {/* POI Summary */}
      <div className="p-2 bg-gray-200 text-sm">
        {Object.entries(poiSummary).map(([cat, count]) => (
          <span key={cat} className="mr-4">
            {cat}: {count}
          </span>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {fromCoords && <FlyTo coords={fromCoords} />}
          {fromCoords && (
            <Marker position={fromCoords}>
              <Popup>Start: {from}</Popup>
            </Marker>
          )}
          {toCoords && (
            <Marker position={toCoords}>
              <Popup>Destination: {to}</Popup>
            </Marker>
          )}

          {route.length > 0 && (
            <Polyline positions={route} color="blue" />
          )}

          {pois.map((poi) => (
            <Marker
              key={poi.id}
              position={[poi.lat, poi.lon]}
              icon={L.icon({
                iconUrl:
                  poi.category === "Hospital"
                    ? "https://cdn-icons-png.flaticon.com/512/2967/2967350.png"
                    : poi.category === "Police"
                    ? "https://cdn-icons-png.flaticon.com/512/2991/2991108.png"
                    : poi.category === "School"
                    ? "https://cdn-icons-png.flaticon.com/512/1048/1048949.png"
                    : poi.category === "ATM"
                    ? "https://cdn-icons-png.flaticon.com/512/483/483408.png"
                    : "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
                iconSize: [25, 25],
              })}
            >
              <Popup>
                <b>{poi.name}</b> <br />
                {poi.category}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
