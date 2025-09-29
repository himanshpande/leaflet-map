import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Spinner, Card, Form, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";




// Custom marker icons
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const poiIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

// POI types configuration
const POI_TYPES = {
  hospital: { name: "Hospital", icon: "🏥", amenity: "hospital" },
  police: { name: "Police Station", icon: "🚔", amenity: "police" },
  school: { name: "School", icon: "🏫", amenity: "school" },
  restaurant: { name: "Restaurant", icon: "🍽️", amenity: "restaurant" },
  fuel: { name: "Fuel Station", icon: "⛽", amenity: "fuel" },
  atm: { name: "ATM", icon: "🏧", amenity: "atm" },
  pharmacy: { name: "Pharmacy", icon: "💊", amenity: "pharmacy" },
  bank: { name: "Bank", icon: "🏦", amenity: "bank" },
  hotel: { name: "Hotel", icon: "🏨", amenity: "hotel" },
  shopping: { name: "Shopping", icon: "🛍️", amenity: "shop" }
};

// Tile layers for switcher
const MAP_TILES = {
  street: {
    name: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '© OpenStreetMap contributors'
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles © Esri'
  },
  topo: {
    name: "Topographic",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '© OpenTopoMap contributors'
  }
};

// Fit bounds component
const FitBounds = ({ start, dest, route }) => {
  const map = useMap();
  if (start && dest) {
    let bounds;
    if (route && route.length > 0) {
      bounds = L.latLngBounds(route);
    } else {
      bounds = L.latLngBounds([start, dest]);
    }
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 12 });
  }
  return null;
};

const MapView = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [startInput, setStartInput] = useState("");
  const [destInput, setDestInput] = useState("");
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPOIType, setSelectedPOIType] = useState(null);
  const [pois, setPois] = useState([]);
  const [poiLoading, setPoiLoading] = useState(false);
  const [mapType, setMapType] = useState('street');
  const [currentTile, setCurrentTile] = useState('street');
  const [recentPlaces, setRecentPlaces] = useState(() => {
    // Load saved recent places from localStorage
    const saved = localStorage.getItem("recentPlaces");
    return saved ? JSON.parse(saved) : [];
  });
  const [showRecentPlaces, setShowRecentPlaces] = useState(false);
 const [darkMode, setDarkMode] = useState(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === null) {
    // No saved theme, default to dark
    return true;
  }
  return savedTheme === "dark";
});


  const mapRef = useRef();

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Save recent place
  const saveRecentPlace = (startInput, destInput, startCoords, destCoords) => {
    const newPlace = {
      id: Date.now(),
      start: startInput,
      destination: destInput,
      startCoords,
      destCoords,
      timestamp: new Date().toISOString()
    };
    
    setRecentPlaces(prev => {
      const updated = [newPlace, ...prev.filter(place => 
        !(place.start === startInput && place.destination === destInput)
      )].slice(0, 10); // Keep only last 10 places
      
      localStorage.setItem("recentPlaces", JSON.stringify(updated));
      return updated;
    });
  };

  // Load recent place
  const loadRecentPlace = (place) => {
    setStartInput(place.start);
    setDestInput(place.destination);
    setStartLocation(place.startCoords);
    setDestination(place.destCoords);
    setShowRecentPlaces(false);
    // Automatically fetch route
    fetchRoute(place.startCoords, place.destCoords);
  };

  // Clear recent places
  const clearRecentPlaces = () => {
    setRecentPlaces([]);
    localStorage.removeItem("recentPlaces");
  };

  // Fetch user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
      },
      (error) => {
        console.error("Error getting location:", error);
        setUserLocation([20.5937, 78.9629]); // fallback
      }
    );
  }, []);

  useEffect(() => {
    if (mapRef.current && startLocation && destination && route.length > 0) {
      const bounds = L.latLngBounds(route);
      mapRef.current.fitBounds(bounds, { padding: [20, 20], maxZoom: 12 });
    }
  }, [route, startLocation, destination]);

  // Search location using Nominatim
  const searchLocation = async (query, setter) => {
    if (!query) return null;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setter(coords);
        return coords;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Fetch route from OSRM
  const fetchRoute = async (startCoords, destCoords) => {
    if (!startCoords || !destCoords) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRoute(coords);
        setDistance((data.routes[0].distance / 1000).toFixed(2));
        setDuration((data.routes[0].duration / 60).toFixed(2));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch POIs from Overpass API
  const fetchPOIs = async (poiType) => {
    if (!startLocation || !destination || !poiType) return;
    setPoiLoading(true);
    setPois([]);
    try {
      const bounds = L.latLngBounds([startLocation, destination]);
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();

      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="${poiType.amenity}"](${south},${west},${north},${east});
          way["amenity"="${poiType.amenity}"](${south},${west},${north},${east});
          relation["amenity"="${poiType.amenity}"](${south},${west},${north},${east});
        );
        out center;
      `;
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: { 'Content-Type': 'text/plain' }
      });
      const data = await response.json();
      const poiList = data.elements.map(el => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        return {
          id: el.id,
          name: el.tags?.name || `${poiType.name} ${el.id}`,
          lat, lon,
          type: poiType.name,
          icon: poiType.icon,
          tags: el.tags || {}
        };
      }).filter(poi => poi.lat && poi.lon);
      setPois(poiList);
    } catch (error) {
      console.error(error);
    } finally {
      setPoiLoading(false);
    }
  };

  const handleFindRoute = async () => {
    
    setLoading(true);
    console.log("loader on",)
    setRoute([]); setDistance(null); setDuration(null);
    setPois([]); setSelectedPOIType(null);
    try {
      const startCoords = await searchLocation(startInput, setStartLocation);
      const destCoords = await searchLocation(destInput, setDestination);
      if (startCoords && destCoords) {
        await fetchRoute(startCoords, destCoords);
        // Save to recent places
        saveRecentPlace(startInput, destInput, startCoords, destCoords);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  // Show loader if location not fetched
if (!userLocation) {
  return (
    <div className="vh-100 d-flex justify-content-center align-items-center flex-column bg-loading text-center">
      <div className="weather-spinner mb-4"></div>
      <h4 className="text-white mb-2">Locating you...</h4>
      <p className="text-light opacity-75">Please allow location access to continue</p>

      <style>{`
        .bg-loading {
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          animation: backgroundShift 10s ease infinite;
        }

        @keyframes backgroundShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .weather-spinner {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 6px solid rgba(255, 255, 255, 0.1);
          border-top: 6px solid #00d4ff;
          animation: spin 1.2s linear infinite, pulse 1.8s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 15px 5px rgba(0, 212, 255, 0.6);
          }
        }

        h4, p {
          animation: fadeInUp 0.8s ease both;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}


  return (
    <div className={darkMode ? "app dark-mode" : "app light-mode"} style={{ 
      backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
      color: darkMode ? '#ffffff' : '#212529',
      minHeight: '100vh'
    }}>
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div
  className={`d-flex flex-column ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}
  style={{
    width: sidebarOpen ? '240px' : '53px',
    transition: 'width 0.3s',
    padding: sidebarOpen ? '1rem' : '0.5rem',
    backgroundColor: darkMode ? '#2d3748' : '#ffffff',
    borderRight: darkMode ? '1px solid #4a5568' : '1px solid #e2e8f0',
    boxShadow: darkMode ? '2px 0 4px rgba(0,0,0,0.3)' : '2px 0 4px rgba(0,0,0,0.1)'
  }}
>


        <div className="d-flex justify-content-between align-items-center mb-3">
          {sidebarOpen && <h5 style={{ color: darkMode ? '#e2e8f0' : '#2d3748' }}>Navigation</h5>}
          <Button 
            variant={darkMode ? "outline-light" : "outline-dark"} 
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              backgroundColor: darkMode ? '#4a5568' : '#f7fafc',
              borderColor: darkMode ? '#718096' : '#e2e8f0',
              color: darkMode ? '#ffffff' : '#2d3748'
            }}
          >
            {!sidebarOpen ? "☰" : "⨉"}
          </Button>
        </div>
        <div className="flex-column d-flex gap-2">
  <Button 
    variant={darkMode ? "outline-light" : "outline-primary"} 
    className="w-100 text-start d-flex align-items-center gap-2"
    style={{
      backgroundColor: darkMode ? '#4a5568' : '#f7fafc',
      borderColor: darkMode ? '#718096' : '#3182ce',
      color: darkMode ? '#ffffff' : '#2d3748',
      border: 'none',
      padding: '0.5rem'
    }}
  >
    🏠 {sidebarOpen && <span>Home</span>}
  </Button>
  <Button 
    variant={darkMode ? "outline-light" : "outline-primary"} 
    className="w-100 text-start d-flex align-items-center gap-2"
    style={{
      backgroundColor: darkMode ? '#4a5568' : '#f7fafc',
      borderColor: darkMode ? '#718096' : '#3182ce',
      color: darkMode ? '#ffffff' : '#2d3748',
      border: 'none',
      padding: '0.5rem'
    }}
  >
    🗺️ {sidebarOpen && <span>Map</span>}
  </Button>
  <Button 
    variant={darkMode ? "outline-light" : "outline-primary"} 
    className="w-100 text-start d-flex align-items-center gap-2"
    onClick={() => setShowRecentPlaces(!showRecentPlaces)}
    style={{
      backgroundColor: darkMode ? '#4a5568' : '#f7fafc',
      borderColor: darkMode ? '#718096' : '#3182ce',
      color: darkMode ? '#ffffff' : '#2d3748',
      border: 'none',
      padding: '0.5rem'
    }}
  >
    🕑 {sidebarOpen && <span>Recent Places</span>}
  </Button>
  <div className="mt-4">
  <Button 
    variant={darkMode ? "outline-warning" : "outline-dark"} 
    className="w-100 text-start d-flex align-items-center gap-2" 
    onClick={toggleTheme}
    style={{
      backgroundColor: darkMode ? '#744210' : '#f7fafc',
      borderColor: darkMode ? '#d69e2e' : '#2d3748',
      color: darkMode ? '#ffffff' : '#2d3748',
      border: 'none',
      padding: '0.5rem'
    }}
  >
  {darkMode ? "🌞" : "🌙"} {sidebarOpen && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
</Button>
</div>

</div>

      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column justify-content-between" style={{
        backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa'
      }}>
        {/* Search Card */}
        <Card className="m-3 shadow-sm" style={{
          backgroundColor: darkMode ? '#2d3748' : '#ffffff',
          borderColor: darkMode ? '#4a5568' : '#e2e8f0',
          color: darkMode ? '#ffffff' : '#2d3748'
        }}>
  <Card.Body className="d-flex flex-wrap gap-3 align-items-center" style={{
    backgroundColor: darkMode ? '#2d3748' : '#ffffff',
    color: darkMode ? '#ffffff' : '#2d3748'
  }}>
    <Form.Control 
      type="text" 
      placeholder="Start Location" 
      value={startInput} 
      onChange={(e) => setStartInput(e.target.value)} 
      style={{ 
        width: '200px',
        backgroundColor: darkMode ? '#4a5568' : '#ffffff',
        borderColor: darkMode ? '#718096' : '#e2e8f0',
        color: darkMode ? '#ffffff' : '#2d3748'
      }} 
    />
    <Form.Control 
      type="text" 
      placeholder="Destination" 
      value={destInput} 
      onChange={(e) => setDestInput(e.target.value)} 
      style={{ 
        width: '200px',
        backgroundColor: darkMode ? '#4a5568' : '#ffffff',
        borderColor: darkMode ? '#718096' : '#e2e8f0',
        color: darkMode ? '#ffffff' : '#2d3748'
      }} 
    />

    <Button 
      variant="primary" 
      onClick={handleFindRoute} 
      disabled={loading}
      style={{
        backgroundColor: darkMode ? '#3182ce' : '#007bff',
        borderColor: darkMode ? '#3182ce' : '#007bff',
        color: '#ffffff'
      }}
    >
      {loading ? (<><Spinner animation="border" size="sm" className="me-2" />Finding Route...</>) : "Find Route"}
    </Button>

    <Dropdown>
      <Dropdown.Toggle 
        variant="outline-primary"
        style={{
          backgroundColor: darkMode ? '#4a5568' : '#ffffff',
          borderColor: darkMode ? '#718096' : '#3182ce',
          color: darkMode ? '#ffffff' : '#2d3748'
        }}
      >
        {selectedPOIType ? `${selectedPOIType.icon} ${selectedPOIType.name}` : "Select POI Type"}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{
        backgroundColor: darkMode ? '#2d3748' : '#ffffff',
        borderColor: darkMode ? '#4a5568' : '#e2e8f0'
      }}>
        {Object.entries(POI_TYPES).map(([key, poi]) => (
          <Dropdown.Item 
            key={key} 
            onClick={() => { setSelectedPOIType(poi); fetchPOIs(poi); }}
            style={{
              backgroundColor: darkMode ? '#2d3748' : '#ffffff',
              color: darkMode ? '#ffffff' : '#2d3748'
            }}
          >
            {poi.icon} {poi.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>

    <Dropdown>
      <Dropdown.Toggle 
        variant="outline-secondary"
        style={{
          backgroundColor: darkMode ? '#4a5568' : '#ffffff',
          borderColor: darkMode ? '#718096' : '#6c757d',
          color: darkMode ? '#ffffff' : '#2d3748'
        }}
      >
        Map: {MAP_TILES[currentTile].name}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{
        backgroundColor: darkMode ? '#2d3748' : '#ffffff',
        borderColor: darkMode ? '#4a5568' : '#e2e8f0'
      }}>
        {Object.entries(MAP_TILES).map(([key, tile]) => (
          <Dropdown.Item 
            key={key} 
            onClick={() => setCurrentTile(key)}
            style={{
              backgroundColor: darkMode ? '#2d3748' : '#ffffff',
              color: darkMode ? '#ffffff' : '#2d3748'
            }}
          >
            {tile.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  
    {selectedPOIType && (
      <Button 
        variant="outline-danger" 
        size="sm" 
        onClick={() => { setSelectedPOIType(null); setPois([]); }}
        style={{
          backgroundColor: darkMode ? '#744210' : '#ffffff',
          borderColor: darkMode ? '#d69e2e' : '#dc3545',
          color: darkMode ? '#ffffff' : '#dc3545'
        }}
      >
        Clear POIs
      </Button>
    )}

    {poiLoading && <Spinner animation="border" size="sm" />}
    {pois.length > 0 && (
      <div className="small" style={{ color: darkMode ? '#a0aec0' : '#6c757d' }}>
        {pois.length} {selectedPOIType?.name.toLowerCase()}s found
      </div>
    )}
  
    <Button 
      variant="outline-danger" 
      size="sm" 
      onClick={handleLogout}
      style={{
        backgroundColor: darkMode ? '#744210' : '#ffffff',
        borderColor: darkMode ? '#d69e2e' : '#dc3545',
        color: darkMode ? '#ffffff' : '#dc3545'
      }}
    >
      🚪 Logout
    </Button>
  </Card.Body>
</Card>





        {/* Map Container */}
        <div className="flex-grow-1 m-3 rounded shadow position-relative">
          <MapContainer
            center={userLocation}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
          >
            <TileLayer url={MAP_TILES[currentTile].url} attribution={MAP_TILES[currentTile].attribution} />
            {startLocation && <Marker position={startLocation} icon={customIcon}><Popup>Start Location</Popup></Marker>}
            {destination && <Marker position={destination} icon={customIcon}><Popup>Destination</Popup></Marker>}
            {route.length > 0 && <Polyline positions={route} color="blue" />}
            {pois.map(poi => (
              <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={poiIcon}>
                <Popup>
                  <div>
                    <strong>{poi.icon} {poi.name}</strong><br/>
                    <small className="text-muted">{poi.type}</small>
                    {poi.tags.phone && (<><br/><small>📞 {poi.tags.phone}</small></>)}
                    {poi.tags.website && (<><br/><small>🌐 <a href={poi.tags.website} target="_blank" rel="noopener noreferrer">Website</a></small></>)}
                  </div>
                </Popup>
              </Marker>
            ))}
            {startLocation && destination && <FitBounds start={startLocation} dest={destination} route={route} />}
          </MapContainer>

          {loading && (<div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: darkMode ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255,255,255,0.8)', zIndex: 1000 }}><Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} /></div>)}
        </div>

        {/* Distance/Time Panel */}
        {/* Distance/Time Overlay */}
{distance && duration && (
  <div style={{
    position: 'absolute',
    top: '125px',
    left: '1700px',
    backgroundColor: darkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderRadius: '8px',
    padding: '10px 15px',
    zIndex: 1000,
    boxShadow: darkMode ? '0px 2px 6px rgba(0, 0, 0, 0.4)' : '0px 2px 6px rgba(0, 0, 0, 0.15)',
    border: darkMode ? '1px solid #4a5568' : '1px solid #e2e8f0'
  }}>
    <div className="fw-semibold mb-1" style={{ color: darkMode ? '#ffffff' : '#2d3748' }}>Route Summary</div>
    <div className="small" style={{ color: darkMode ? '#a0aec0' : '#6c757d' }}>🛣️ Distance: <strong style={{ color: darkMode ? '#ffffff' : '#2d3748' }}>{distance} km</strong></div>
    <div className="small" style={{ color: darkMode ? '#a0aec0' : '#6c757d' }}>⏱️ Duration: <strong style={{ color: darkMode ? '#ffffff' : '#2d3748' }}>{duration} mins</strong></div>
  </div>
)}

        

        
      </div>
    </div>

    {/* Recent Places Popup */}
    {showRecentPlaces && (
      <div 
        className="position-fixed w-100 h-100 d-flex justify-content-center align-items-center"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          top: 0,
          left: 0
        }}
        onClick={() => setShowRecentPlaces(false)}
      >
        <div 
          className="rounded shadow-lg"
          style={{
            backgroundColor: darkMode ? '#2d3748' : '#ffffff',
            border: darkMode ? '1px solid #4a5568' : '1px solid #e2e8f0',
            color: darkMode ? '#ffffff' : '#2d3748',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '70vh',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="d-flex justify-content-between align-items-center p-3 border-bottom"
            style={{
              backgroundColor: darkMode ? '#4a5568' : '#f8f9fa',
              borderColor: darkMode ? '#718096' : '#e2e8f0'
            }}
          >
            <h5 className="mb-0" style={{ color: darkMode ? '#ffffff' : '#2d3748' }}>
              🕑 Recent Places
            </h5>
            <div className="d-flex gap-2">
              {recentPlaces.length > 0 && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={clearRecentPlaces}
                  style={{
                    backgroundColor: darkMode ? '#744210' : '#ffffff',
                    borderColor: darkMode ? '#d69e2e' : '#dc3545',
                    color: darkMode ? '#ffffff' : '#dc3545'
                  }}
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowRecentPlaces(false)}
                style={{
                  backgroundColor: darkMode ? '#4a5568' : '#ffffff',
                  borderColor: darkMode ? '#718096' : '#6c757d',
                  color: darkMode ? '#ffffff' : '#2d3748'
                }}
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Content */}
          <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {recentPlaces.length === 0 ? (
              <div className="p-4 text-center">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                <p className="mb-0" style={{ color: darkMode ? '#a0aec0' : '#6c757d' }}>
                  No recent places found
                </p>
                <small style={{ color: darkMode ? '#718096' : '#9ca3af' }}>
                  Start searching for routes to see them here
                </small>
              </div>
            ) : (
              <div className="p-3">
                {recentPlaces.map((place, index) => (
                  <div
                    key={place.id}
                    className="border rounded p-3 mb-3 cursor-pointer"
                    style={{
                      backgroundColor: darkMode ? '#4a5568' : '#f8f9fa',
                      borderColor: darkMode ? '#718096' : '#e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = darkMode ? '#5a6578' : '#e9ecef';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = darkMode ? '#4a5568' : '#f8f9fa';
                    }}
                    onClick={() => loadRecentPlace(place)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="fw-semibold mb-1" style={{ color: darkMode ? '#ffffff' : '#2d3748' }}>
                          {place.start} → {place.destination}
                        </div>
                        <div className="small" style={{ color: darkMode ? '#a0aec0' : '#6c757d' }}>
                          {new Date(place.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="small" style={{ color: darkMode ? '#a0aec0' : '#6c757d' }}>
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default MapView;
