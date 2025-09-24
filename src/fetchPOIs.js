// fetchPOIs.js
export async function fetchPOIs(bbox, amenity) {
  // bbox = [south, west, north, east]
  const query = `
    [out:json];
    node[amenity=${amenity}](${bbox.join(",")});
    out;
  `;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  });
  const data = await res.json();
  return data.elements;
}
