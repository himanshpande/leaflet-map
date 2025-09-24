// MapTileSwitcher.jsx
import React from "react";
import { Dropdown, ButtonGroup } from "react-bootstrap";

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

const MapTileSwitcher = ({ currentTile, setCurrentTile }) => {
  return (
    <Dropdown as={ButtonGroup} className="m-2">
      <Dropdown.Toggle variant="secondary">{MAP_TILES[currentTile].name}</Dropdown.Toggle>
      <Dropdown.Menu>
        {Object.entries(MAP_TILES).map(([key, tile]) => (
          <Dropdown.Item key={key} onClick={() => setCurrentTile(key)}>
            {tile.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export { MapTileSwitcher, MAP_TILES };
