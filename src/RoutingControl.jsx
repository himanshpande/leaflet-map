// RoutingControl.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function RoutingControl({ from, to, onRoute }) {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: true,
      show: false,
    })
      .on("routesfound", function (e) {
        const coords = e.routes[0].coordinates; // full route
        if (onRoute) onRoute(coords);
      })
      .addTo(map);

    return () => map.removeControl(routingControl);
  }, [from, to, map, onRoute]);

  return null;
}

export default RoutingControl;
