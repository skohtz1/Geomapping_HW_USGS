// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var platesUrl= "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Place:" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  function pointToLayer(feature,latlng){
    return new L.circle(latlng, {radius: getRadius(feature.properties.mag),
    fillColor: getColor(feature.properties.mag),
    fillOpacity: .5,
    color: "#000",
    stroke: true,
    weight: .8
  })
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic2tvaHR6MSIsImEiOiJjamg5bmIzMncwZXpnM2RsNzhmcWNwMW96In0.Q4ht6GLLBDJCZIms2dpUCw"
  );

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1Ijoic2tvaHR6MSIsImEiOiJjamg5bmIzMncwZXpnM2RsNzhmcWNwMW96In0.Q4ht6GLLBDJCZIms2dpUCw");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic2tvaHR6MSIsImEiOiJjamg5bmIzMncwZXpnM2RsNzhmcWNwMW96In0.Q4ht6GLLBDJCZIms2dpUCw"
  );

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satelite": satellite
  };

  var tectPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes, tectPlates]
  });

  d3.json(platesUrl, function(plateData){
    L.geoJson(plateData,{
      color: "orange",
      weight: 2
    }).addTo(tectPlates);
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  

}

function getColor(d){
  if (d>5) {return "#a54500"}
  else if (d>4){return "#cc5500"}
  else if (d>3){return "#ff6f08"}
  else if (d>2){return "#ff9143"}
  else if (d>1) {return "#ffb37e"}
  else {return "#ffcca5"};
}

function getRadius(value){
  return value*25000;
}