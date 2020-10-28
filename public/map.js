// This file should be split up into 3 files:
//  - UI Functions only
//  - map Functions only
//  - main() / code file

// Init Gobal Variables
var dayButtons = document.getElementsByClassName('day-selector');
var mapTop;
var mapBottom;
var db = firebase.firestore();


// Sleep functionality
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// This sleep function puts the day selector buttons at the top of the map,
// lets the info area draw, then snaps the bottom of the map container to it
sleep(200).then(() => {
  mapTop = document.getElementById('geo-status-area').offsetHeight;
  mapBottom = document.getElementById('info-area').offsetHeight;
  document.getElementById('day-selector-container').style.top = mapTop;
});

//////////////////
//   Map Code   //
//////////////////

// Dev Token
mapboxgl.accessToken = "pk.eyJ1IjoiYmdvYmxpcnNjaCIsImEiOiJjaXpuazEyZWowMzlkMzJvN3M3cThzN2ZkIn0.B0gMS_CvyKc_NHGmWejVqw";
// Production Token:
//mapboxgl.accessToken = 'pk.eyJ1IjoiYmdvYmxpcnNjaCIsImEiOiJjanpybWFsNWcxY3dnM21vNXZmN21lcXNrIn0.MwA-tEeJpUwITy7wkPwYJA';

// Minneapolis City Boundary Extent
var city_boundary = [
  [-93.32916,45.05125],
  [-93.19386,44.89015]
];

// initialize map
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-93.27, 44.98],
  zoom: 11,
});

// geocoder object
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  countries: "us",
  mapboxgl: mapboxgl
});
// add geocoder object to document
var geocoderHTML = document.getElementById('geocoder');
geocoderHTML.appendChild(geocoder.onAdd(map));

// var displayZoom determines whether or not to include zoom controls on map
if (isPortrait()) {
  var displayZoom = false;
}
else {
  var displayZoom = true;
};

// Add compass control to map (& zoom if landscape)
var nav = new mapboxgl.NavigationControl({showZoom: displayZoom});
map.addControl(nav, 'bottom-right');

// listen for window resize and update the map object accordingly
window.onresize = function() {
  sleep(300).then(() => {
    map.resize();
    mapTop = document.getElementById('geo-status-area').offsetHeight;
    document.getElementById('day-selector-container').style.top = mapTop;
  });
}

// Disable Map Rotation. Touch Rotation is still enabled, this is just to dissuade tilting.
map.dragRotate.disable();

// Create & add geolocate control button to the map.
var geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true,
  showAccuracy: true
});
map.addControl(geolocate, 'bottom-right');

// zoom to extent of Minneapolis
map.fitBounds(city_boundary);

// Route Data from City of Minneapolis:
// http://opendata.minneapolismn.gov/datasets/snow-emergency-routes
var routeData = {
  "id": "route-data",
  "type": "fill",
  "source": {
    type: 'vector',
    url: 'mapbox://bgoblirsch.routes2020'
  },
  "source-layer": "routes2020",
};

map.on('load', function () {
  // hide the loading Animation
  document.getElementById('loading-map').style.display = 'none';

  // Find the index of the first symbol layer in the map style
  // Do this in order to display labels over the route data
  var layers = map.getStyle().layers;
  var mapLabels;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      mapLabels = layers[i].id;
      break;
    }
  }

  // Add road data, then map labels above
  map.addLayer(routeData, mapLabels);

  // Get Snow Emergency Status
  // statusString is stored as "DAY_" so that it can be used in the getPaint()
  // and map.setPaintProperty function to style the map route layer accordingly
  var status = getStatus();
  if (status == 0) { // if no emergency, use day one as the active color style
    var statusString = 'DAY1'
  }
  else {
    statusString = 'DAY' + status
  }
  // Color Route Data According to Emergency Status
  map.setPaintProperty("route-data", "fill-color", getPaint(statusString))

  // Prompt user for geoloacation
  geolocate.trigger();

  // TODO: change this to await the geolocate
  sleep(3000).then(() => {
    var outlat = false;
    try {
      if ((geolocate._lastKnownPosition.coords.latitude < 44.89015) || (geolocate._lastKnownPosition.coords.latitude > 45.05125)) {
        outlat = true;
      }
      var outlon = false;
      if ((geolocate._lastKnownPosition.coords.longitude < -93.32916) || (geolocate._lastKnownPosition.coords.longitude > -93.19386)) {
        outlon = true;
      }
      if (outlat || outlon) {
        map.fitBounds(city_boundary);
      }
      else {
        geolocate.trackUserLocation = true;
      }
    } catch(error) {
      console.warn("Failed to get user's location", error);
    }
  });
});

//////////////////
// UI Functions //
//////////////////

// Check if Dark Mode is enabled
function checkDisplayMode() {
  if (document.getElementById('dark-mode').checked) {
    return 'dark';
  }
  else {
    return 'light';
  }
};

// check if window is portrait; used for determing which map control buttons to display/enable
function isPortrait() {
  if (window.screen.availHeight > window.screen.availWidth) {
    return true;
  }
  else { return false; }
}

// if a day selector button is deactivated, loop through the buttons and deactivate
// each, and hide the info area and route map layer
function deactivate() {
  var infoArea = document.getElementById('info-area');
  hideMapLayer();
  infoArea.style.display = 'none';
  for (var i = 0; i < dayButtons.length; i++) {
    dayButtons[i].classList.remove('active');
  }
}

function getStatus() {
  // check if an emergency has been Declared
  // return:
  // 0 for no Emergency
  // 1 for declared - day1
  // 2 for day 2
  // 3 for day 3
  // if it fails, return -1

  // create date string in MM-DD-YYY format
  var d = new Date();
  let m = d.getMonth() + 1; // add one to month because jan == 0
  let date = m + '-' + d.getDate() + '-' + d.getFullYear();
  let statusCode;

  // try looking up the date string in the firestore db;
  let docRef = db.collection("status").doc("status");
  docRef.get().then(function(doc) {
    if (doc.exists) {
      console.log(doc.data().status);
      if (doc.data().status == "0") {
        // call setStatus() with 0 if db says no emergency
        setStatus(0);
      } else if (doc.data().status == "1") {
        setStatus(1);
      } else if (doc.data().status == "2") {
        setStatus(2);
      } else if (doc.data().status == "3") {
        setStatus(3);
      }
    } else {
      statusCode = -1;
      console.log("Document does not exist");
    }
  }).catch(function(error) {
    statusCode = -1;
    console.log("Error getting doc: ", error);
  });
}

// set the status of the app: style map layer, display the right day, and set
// the active day selector button to the day that is passed to this function
// day is an int, and the encoding is described above in the getStatus() function
function setStatus(day) {
  // statusText starts as "Loading . . ."
  var statusText = document.getElementById('status-text');
  // used to select the correct html day selector object
  var dayText = 'day' + day + '-selector';
  if (day == 0) {
    // set status to 'No Emergency Declared'
    statusText.innerHTML = 'No Emergency Declared';
    statusText.className = 'no-emergency';
    // if day 1 button is not active, click it to make it active
    var dayButton = document.getElementById('day1-selector');
    if (!dayButton.classList.value.includes('active')) {
      dayButton.click();
    }
  } else if (day == 1) {
    // set status to 'Emergency Declared - Day 1'
    statusText.innerHTML = 'Emergency Declared - Day 1';
    statusText.className = 'emergency';
    var dayButton = document.getElementById(dayText);
    if (!dayButton.classList.value.includes('active')) {
      dayButton.click();
    }
  } else if (day == 2) {
    // set status to 'Day 2 of Snow Emergency'
    statusText.innerHTML = 'Day 2 of Snow Emergency';
    statusText.className = 'emergency';
    var dayButton = document.getElementById(dayText);
    if (!dayButton.classList.value.includes('active')) {
      dayButton.click();
    }
  } else if (day == 3) {
    // set status to 'Day 3 of Snow Emergency'
    statusText.innerHTML = 'Day 3 of Snow Emergency';
    statusText.className = 'emergency';
    var dayButton = document.getElementById(dayText);
    if (!dayButton.classList.value.includes('active')) {
      dayButton.click();
    }
  } else if (day == -1) {
    statusText.innerHTML = "Couldn't retreive status";
    statusText.style.color = 'yellow';
    console.log('could not retreive status');
  }
  else {
    console.log('uh-oh');
  }
}

// Open SidenNav
function openNav() {
  document.getElementById("SideNav").style.width = "340px";
}

// Close SideNav
// Set the width of the side navigation to 0
function closeNav() {
  document.getElementById("SideNav").style.width = "0";
}

function closeAgreement() {
  var agreement = document.getElementById("grey-backdrop");
  agreement.style.display = "none";
}

//////////////////
//   UI Code    //
//////////////////

// Add click event listener on the three Day Selection buttons
for (var i = 0; i < dayButtons.length; i++) {
  dayButtons[i].addEventListener('click', function() {
    // Grabs the value of the clicked button and appends it to 'day'
    var day = 'day' + this.value;
    // Check to see if the clicked button is active
    if (this.classList.value.includes('active')) {
      // if so, deactivate and hide content
      this.classList.toggle('active');
      hideMapLayer();
      document.getElementById('info-area').style.display = 'none';
      document.getElementById(day).style.display = 'none';
      map.resize();
    }
    else {
      // deactivate all buttons & hide info container
      for (j = 0; j < dayButtons.length; j++) {
        var iterDay = 'day' + dayButtons[j].value;
        document.getElementById(iterDay).style.display = 'none';
        if (dayButtons[j].classList.value.includes('active')) {
          dayButtons[j].classList.toggle('active');
        }
      }

      // set the clicked button to active
      this.classList.toggle('active');

      // Turn on the info container and the correct day info
      var day = 'day' + this.value;
      document.getElementById(day).style.display = 'flex';
      document.getElementById('info-area').style.display = 'flex';
      map.resize();

      // Style the map layer
      var day = "DAY" + this.value;
      setMapLayer(day, checkDisplayMode());
    }
  });
}

// Light/Dark Mode Toggler Logic
var darkModeSwitch = document.getElementById('dark-mode');
darkModeSwitch.addEventListener('change', function() {
  if (this.checked) {
    map.setStyle('mapbox://styles/mapbox/dark-v10');
    sleep(1000).then(() => {
      if (typeof map.getLayer('route-data') == 'undefined') {
        var layers = map.getStyle().layers;
        // Find the index of the first symbol layer in the map style
        var mapLabels;
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
            mapLabels = layers[i].id;
            break;
          }
        }
        map.addLayer(routeData,mapLabels);
        var status = getStatus();
        if (status = 0) {
          status = 'DAY1'
        }
        else {
          status = 'DAY' + status
        }
        map.setPaintProperty("route-data", "fill-color", getPaint(status));
        document.getElementById('day1-selector').click();
        document.getElementById('day1-selector').click();
        setStatus(getStatus());
      }
    });
  }
  else {
    map.setStyle('mapbox://styles/mapbox/streets-v10');
    sleep(2000).then(() => {
      if (typeof map.getLayer('route-data') == 'undefined') {
        var layers = map.getStyle().layers;
        // Find the index of the first symbol layer in the map style
        var mapLabels;
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
            mapLabels = layers[i].id;
            break;
          }
        }
        map.addLayer(routeData,'road-label-small');
        var status = getStatus();
        if (status = 0) {
          status = 'DAY1'
        }
        else {
          status = 'DAY' + status
        }
        map.setPaintProperty("route-data", "fill-color", getPaint(status))
        document.getElementById('day1-selector').click();
        document.getElementById('day1-selector').click();
      }
    });
  }
});


// ############# //
// ############# //
// Map Functions //
// ############# //
// ############# //

function hideMapLayer() {
  map.setLayoutProperty("route-data", "visibility", "none");
}


function getPaint(day) {
  var result = [
    "match",
    ["get", day],
    0, '#801f1f',
    1, '#278235',
    "#ccc",
  ]
  return result;

}

// set map layer style
function setMapLayer(day, mode) {
  fillColor = getPaint(day);
  map.setPaintProperty('route-data', 'fill-color', fillColor);
  if (map.getLayoutProperty('route-data', 'visibility') == 'none') {
    map.setLayoutProperty('route-data', 'visibility', 'visible');
  }
}
