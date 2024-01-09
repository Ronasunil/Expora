import L from "leaflet";

const getAllMarkers = function (markers, map) {
  const group = new L.featureGroup(markers);

  map.fitBounds(group.getBounds().pad(0.1));
};

export const renderAllMarkers = function (coordinates) {
  const markers = [];
  // displaying map
  const map = L.map("map", {
    center: L.latLng(49.2125578, 16.62662018),
    zoom: 1,
  });

  //Adding a Tile layer to map
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  coordinates.forEach(function (coordinate) {
    const marker = L.marker(coordinate.latLng).addTo(map);

    // binding a popup  for every marker
    marker.bindPopup(coordinate.description, { autoClose: false }).openPopup();

    // pushing it to marker array for displaying every marker in map
    markers.push(marker);
  });

  getAllMarkers(markers, map);
};
