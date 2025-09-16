import { useMap } from "react-leaflet";
import { useEffect } from "react";

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position && Array.isArray(position)) {
      console.log("Flying to:", position); // debug
      map.flyTo(position, 13, {
        animate: true,
        duration: 2
      });
    }
  }, [position, map]);

  return null;
}

export default MapController;
