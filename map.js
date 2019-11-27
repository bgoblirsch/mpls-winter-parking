// This file should be split up into 3 files:
//  - UI Functions only
//  - map Functions only
//  - main() / code file
//
// Should try to pull out some repeated code as functions
// - for example, would make fixing this like this easier:
//   + when nothing is selected, then screen is rotated to portrait, map does expand like it should

// Init Variables

// Get HTML head element to use for loading css files
var head = document.getElementsByTagName('HEAD')[0];
var dayButtons = document.getElementsByClassName('day-selector');
var mapTop;

// ############ //
// ############ //
// UI Functions //
// ############ //
// ############ //

// Sleep functionality
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

sleep(200).then(() => {
  mapTop = document.getElementById('geo-status-area').offsetHeight;
  document.getElementById('day-selector-container').style.top = mapTop;
  // For beta only
  //document.getElementById('emergency-declarer').style.top = mapTop + 60;
});

// Check if Dark Mode is enabled
function checkDisplayMode() {
  if (document.getElementById('dark-mode').checked) {
    return 'dark';
  }
  else {
    return 'light';
  }
};

// if (landscape) { "Day 1 Info v"} else {"Day 1"}
/*
function changeDayButtonContent() {
  var dayButtons = document.getElementsByClassName('day-selector');
  if (isPortrait()) {
    for (i = 0; i < dayButtons.length; i++) {
      var dayNumber = dayButtons[i].value
      dayButtons[i].innerHTML = `Day ${dayNumber}`;
      //dayButtons[i].firstChild.innerHTML = `Day ${dayNumber}`;
    }
  } else {
    for (i = 0; i < dayButtons.length; i++) {
      var dayNumber = dayButtons[i].value;
      dayButtons[i].innerHTML = `Day ${dayNumber} Info <i class="fa fa-caret-down"></i>`;
    }
  }
}
*/

function isPortrait() {
  if (window.screen.availHeight > window.screen.availWidth) {
    return true;
  }
  else { return false; }
}

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
  // returns:
  // 0 for no Emergency
  // 1 for declared - day1
  // 2 for day 2
  // 3 for day 3
  // if it fails, return -1
  return 1;
}

function setStatus(day) {
  var statusText = document.getElementById('status-text');
  var dayText = 'day' + day + '-selector';
  if (day == 0) {
    // set status to 'No Emergency Declared'
    statusText.innerHTML = 'No Emergency Declared';
    statusText.className = 'no-emergency';
    var dayButton = document.getElementById('day1-selector');
    if (!dayButton.classList.value.includes('active')) {
      dayButton.click();
    }
    /*
    if (!document.getElementById('day1-selector').classList.value.includes('active')) {
      document.getElementById('day1-selector').click();
    }
    */
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
// Also stop the video if it's playing
function closeNav() {
  stopVideos();
  document.getElementById("SideNav").style.width = "0";
}
// Code to stop youtube video on nav close
// Later change so that it only pauses the video
var stopVideos = function () {
	var videos = document.querySelectorAll('iframe, video');
	Array.prototype.forEach.call(videos, function (video) {
		if (video.tagName.toLowerCase() === 'video') {
			video.pause();
		} else {
			var src = video.src;
			video.src = src;
		}
	});
};

function closeAgreement() {
  var agreement = document.getElementById("grey-backdrop");
  agreement.style.display = "none";
}

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
  var lineColor;
  /*
  if (mode == 'dark') {
    if (day == 1) {
      fillColor = [
          'match',
          ['get', 'DAY1'],
          0, '#801f1f',
          1, '#278235',
          '#ccc',
        ];
    } else if (day == 2) {
      fillColor = [
          'match',
          ['get', 'DAY2'],
          0, '#801f1f',
          1, '#278235',
          '#ccc',
        ];
    } else if (day == 3) {
      fillColor = [
          'match',
          ['get', 'DAY3'],
          0, '#801f1f',
          1, '#278235',
          '#ccc',
        ];
    }
    else {
      console.log('invalid parameter for setMapLayer()');
      console.log(day);
    }
  }
  else if (mode == 'light') {
    if (day == 1) {
      fillColor = [
          'match',
          ['get', 'DAY1'],
          0, '#d92525',
          1, '#75f569',
          '#ccc',
        ];
    } else if (day == 2) {
      fillColor = [
          'match',
          ['get', 'DAY2'],
          0, '#d92525',
          1, '#75f569',
          '#ccc',
        ];
    } else if (day == 3) {
      fillColor = [
          'match',
          ['get', 'DAY3'],
          0, '#d92525',
          1, '#75f569',
          '#ccc',
        ];
    }
    else {
      console.log('invalid parameter for setMapLayer()');
      console.log(day);
    }
  }
  else {
    console.log('invalid value set for variable mode:');
    console.log(mode);
  }
  */
  fillColor = getPaint(day);

  map.setPaintProperty('route-data', 'fill-color', fillColor);
  //map.setPaintProperty('route-data', 'fill-outline-color', outlineColor);
  if (map.getLayoutProperty('route-data', 'visibility') == 'none') {
    map.setLayoutProperty('route-data', 'visibility', 'visible');
  }
}

// ############# //
// ############# //
//   Map Code    //
// ############# //
// ############# //

// Mapbox Token:
mapboxgl.accessToken = 'pk.eyJ1IjoiYmdvYmxpcnNjaCIsImEiOiJjanpybWFsNWcxY3dnM21vNXZmN21lcXNrIn0.MwA-tEeJpUwITy7wkPwYJA';
// Minneapolis City Boundary Extent
var city_boundary = [
  [-93.32916,45.05125],
  [-93.19386,44.89015]
];

// initialize map
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v10', // stylesheet location
  center: [-93.27, 44.98], // starting position [lng, lat]
  zoom: 11, // starting zoom
  //minZoom: 11,
});

// geocoder object
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  countries: "us",
  mapboxgl: mapboxgl
});
var geocoderHTML = document.getElementById('geocoder');
geocoderHTML.appendChild(geocoder.onAdd(map));

// var displayZoom determines whether or not to include zoom controls on map
if (isPortrait()) {
  var displayZoom = false;
}
else {
  var displayZoom = true;
};

// Add compass to map (& zoom if landscape)
var nav = new mapboxgl.NavigationControl({showZoom: displayZoom});
map.addControl(nav, 'bottom-right');

// Add/remove zoom on orientation change
// Also resize the map
/*
window.addEventListener("orientationchange", function() {
  map.removeControl(nav);
  displayZoom = !displayZoom;
  nav = new mapboxgl.NavigationControl({showZoom: displayZoom});
  map.addControl(nav, 'bottom-right');
  changeDayButtonContent();
  }
);
*/


window.onresize = function() {
  sleep(300).then(() => {
    map.resize();
    mapTop = document.getElementById('geo-status-area').offsetHeight;
    document.getElementById('day-selector-container').style.top = mapTop;
  });
}


// Disable Map Rotation. Touch Rotation is still enabled, this is just to dissuade tilting.
map.dragRotate.disable();

// Add geolocate control to the map.
var geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
});
map.addControl(geolocate, 'bottom-right');

map.fitBounds(city_boundary);

var routeData = {
  "id": "route-data",
  "type": "fill",
  "source": {
    type: 'vector',
    url: 'mapbox://bgoblirsch.3o2enpx8'
  },
  "source-layer": "Snow_Emergency_Routes-74gvfg",
  //"minzoom": 12,
};

map.on('load', function () {
  document.getElementById('loading-map').style.display = 'none';
  //document.getElementById('loading-text').style.display = 'none';
  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  var mapLabels;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      mapLabels = layers[i].id;
      break;
    }
  }

  // Add road data
  // map.addSource(snow_route_data);
  map.addLayer(routeData, mapLabels);
  var status = getStatus();
  if (status = 0) {
    status = 'DAY1'
  }
  else {
    status = 'DAY' + status
  }
  map.setPaintProperty("route-data", "fill-color", getPaint(status))

  // Get snow emergency status and set UI accordingly
  var statusResult = getStatus();
  setStatus(statusResult);

  // Prompt user for geoloacation
  geolocate.trigger();
  sleep(3000).then(() => {
    var outlat = false;
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
  });

  // if (y > x) {prompt for location} else {point at search}
});

// ############ //
// ############ //
//   UI Code    //
// ############ //
// ############ /

//* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content
// This allows the user to have multiple dropdowns without any conflict */


// Add click event listener on the three dropdown button
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
        if (dayButtons[j].classList.value.includes('active')) {
          dayButtons[j].classList.toggle('active');
          var selectedDay = 'day' + dayButtons[j].value;
          document.getElementById(selectedDay).style.display = 'none';
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

/*
// Beta buttons
var betaButtons = document.getElementsByClassName('emergency-btn');
var betaArea = document.getElementById('emergency-declarer');

for (var i = 0; i < betaButtons.length; i++) {
  betaButtons[i].addEventListener('click', function() {
    setStatus(this.value);
  });
}

var betaSwitch = document.getElementById('beta-mode');
betaSwitch.addEventListener('change', function() {
  if (this.checked) {
    betaArea.style.display = 'flex';
  }
  else {
    betaArea.style.display = 'none';
  }
});
*/

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


/* No longer used
var welcomeSelectors = document.getElementsByClassName('radio-btn');
for (var i = 0; i < welcomeSelectors.length; i++) {
  welcomeSelectors[i].addEventListener("change", function() {
    if (this.children[0].checked) {
      darkModeSwitch.click();
      //this.style.borderColor = "#257AFD";
    }
    else if (!this.children[0].checked) {
      //this.style.borderColor = "white";
    }
    else {
      console.log("unexpected error in welcome selector listener");
    }
  });
}
*/
