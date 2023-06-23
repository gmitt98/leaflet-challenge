// Creating the map layer. I set the coordinates to about center on the continental US
const map = L.map('map').setView([40, -100], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
}).addTo(map);

// Get the earthquake data from USGS, here I am using 7 days
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    // Iterate over the earthquake features
    data.features.forEach(feature => {
      let coordinates = feature.geometry.coordinates;
      let magnitude = Math.round(100*Math.abs(feature.properties.mag))/100;
      let depth = Math.abs(coordinates[2]);
      let time = new Date(feature.properties.time).toLocaleString();

      console.log('Coordinates:', coordinates);
      console.log('Magnitude:', magnitude);
      console.log('Depth:', depth);
      console.log('Time:', time);

      // Set marker size based on the earthquake magnitude
      let markerSize = Math.exp((magnitude/2),8)+2;

      // Set marker color based on the earthquake depth
      let markerColor = getColor(depth);

      // Draw the marker
      L.circleMarker([coordinates[1], coordinates[0]], {
        radius: markerSize,
        fillColor: markerColor,
        color: '#000000',
        weight: 0.5,
        opacity: 1,
        fillOpacity: .7
      }).addTo(map)
        .bindPopup('Date and Time: ' + time + '<br>Magnitude: ' + magnitude + '<br>Depth: ' + depth + ' km');
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Function to calculate marker color based on earthquake depth
function getColor(depth) {
  const colors = ['#07E4D1', '#07E462', '#1BE407', '#89E407', '#E4D107', '#E46207', '#351C0A'];
  const depthRange = [5, 10, 25, 50, 100, 250, 1000];

  for (let i = 0; i < depthRange.length; i++) {
    if (depth <= depthRange[i]) {
      return colors[i];
    }
  }

  return colors[colors.length - 1];
}
