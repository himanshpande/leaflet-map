import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import SearchBar from "./SearchBar";
import SavedPlaces from "./SavedPlaces";
import MapController from "./MapController";  // 👈 new import

function MapView({ onLogout }) {
  const [places, setPlaces] = useState(() => {
    const saved = localStorage.getItem("places");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPosition, setSelectedPosition] = useState([20.5937, 78.9629]); // India

  useEffect(() => {
    localStorage.setItem("places", JSON.stringify(places));
  }, [places]);

  const handleSavePlace = (place) => {
    setPlaces([...places, place]);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", padding: "10px", borderRight: "1px solid #ccc" }}>
        <h3>Saved Places</h3>
        <SavedPlaces places={places} onSelect={(pos) => setSelectedPosition(pos)} />
        <button onClick={onLogout} style={{ marginTop: "20px" }}>Logout</button>
      </div>

      {/* Map Section */}
      <div style={{ flex: 1 }}>
        <SearchBar
          onPlaceSelect={(place) => {
            const coords = [parseFloat(place.lat), parseFloat(place.lon)];
            setSelectedPosition(coords);
            handleSavePlace({
              name: place.display_name,
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lon),
            });
          }}
        />

       <MapContainer
  center={[20.5937, 78.9629]}   // initial India center
  zoom={5}
  style={{ height: "100vh", width: "100%" }}
>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

  {/* controller to move map when position changes */}
  <MapController position={selectedPosition} />

  {places.map((p, idx) => (
    <Marker key={idx} position={[p.lat, p.lng]}>
      <Popup>{p.name}</Popup>
    </Marker>
  ))}
</MapContainer>


      </div>
    </div>
  );
}

export default MapView;
