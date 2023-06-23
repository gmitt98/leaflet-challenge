// Creating the map layer. I set the coordinates to about center on the continental US
var map = L.map('map').setView([40, -100], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
}).addTo(map);

// Get the earthquake data from USGS, here I am using 7 days
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    // Iterate over the earthquake features
    data.features.forEach(feature => {
      var coordinates = feature.geometry.coordinates;
      var magnitude = Math.round(100*Math.abs(feature.properties.mag))/100;
      var depth = Math.abs(coordinates[2]);

      console.log('Coordinates:', coordinates);
      console.log('Magnitude:', magnitude);
      console.log('Depth:', depth);

      // Define the marker size based on the earthquake magnitude
      var markerSize = Math.pow(magnitude/2,3)*3;

      // Define the marker color based on the earthquake depth
      var markerColor = getColor(depth);

      // Create a circle marker at the earthquake's coordinates with size and color
      L.circleMarker([coordinates[1], coordinates[0]], {
        radius: markerSize,
        fillColor: markerColor,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map)
        .bindPopup('Magnitude: ' + magnitude + '<br>Depth: ' + depth);
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Function to calculate marker color based on earthquake depth
function getColor(depth) {
  var colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026'];
  var depthRange = [0, 70, 150, 300, 500, 700, 1000];

  for (var i = 0; i < depthRange.length; i++) {
    if (depth <= depthRange[i]) {
      return colors[i];
    }
  }

  return colors[colors.length - 1];
}
