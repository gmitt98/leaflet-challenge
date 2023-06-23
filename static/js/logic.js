// Creating some map options for fun
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 10,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const cyclosm = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
  maxZoom: 10,
  attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
});

const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
});

// Creating the map layer with OSM as the default. I set the coordinates to about center on the continental US
const map = L.map('map', {
    center: [40, -100],
    zoom: 5, layers: [osm]
});

// Base layers and controls
const baseMaps = {
    "OpenStreetMap": osm,
    "CyclOSM": cyclosm,
    "Esri NatGeoWorldMap": Esri_NatGeoWorldMap,
    "Esri WorldImagery": Esri_WorldImagery,
    "CartoDB DarkMatter":CartoDB_DarkMatter
};

// Add the basemap control layers to the map so users can select the one they want
L.control.layers(baseMaps).addTo(map);



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
};




// Adding a legend (this part sourced and heavily cribbed from stackexchange)
const legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    const depthRange = [0, 5, 10, 25, 50, 100, 250, 1000];
    // loop through our depth intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depthRange.length; i++) {
      div.innerHTML +=
        '<div><span style="background:' + getColor(depthRange[i] + 1) + '; display:inline-block; width:18px; height:18px; margin-right:8px; opacity:0.7;"></span> ' +
        depthRange[i] + (depthRange[i + 1] ? '&ndash;' + depthRange[i + 1] + 'km' + '<br>' : 'km+') + '</div>';
    }
    return div;
  };
  legend.addTo(map);
  