//replace the url for the spreadsheet being mapped here
window.onload=function(){
	getSpreadsheet('https://docs.google.com/spreadsheets/d/1cdP63d5ORuil8s8FLilXwrplr6hUCEpmlM4QNw6tw1Q/pubhtml');
}

//all of this is happening asynchronously; the callback is telling Tabletop to build the map using the spreadsheet
function getSpreadsheet(key){
  Tabletop.init( { 
    key: key,
    callback: buildMap,
    simpleSheet: true
  });
}

function buildMap(data, tabletop) {

L.mapbox.accessToken = 'pk.eyJ1IjoiY29yZS1naXMiLCJhIjoiaUxqQS1zQSJ9.mDT5nb8l_dWIHzbnOTebcQ';

  // build map
  var map = L.mapbox.map('map', 'mapbox.light').setView([0,0],1);
  map.zoomControl.setPosition('topright');
  map.options.minZoom = 4;
  map.options.maxZoom = 10;
  map.setMaxBounds([
	[20.179724, -137.285156], //southwest map coordinates
    [56.438204, -57.602539] //northeast map coordinates 
	])
  
  var points = L.featureGroup();
  var instantrunoffCurrent = L.featureGroup();
  var instantrunoffPast = L.featureGroup();
  var otherrankedchoicePast = L.featureGroup(); 
  var stvCurrent = L.featureGroup();
  var stvPast = L.featureGroup();
  var limitedvoteCurrent= L.featureGroup();
  var limitedvotePast = L.featureGroup();
  var cumulativvoteCurrent= L.featureGroup();
  var cumulativevotePast = L.featureGroup();
  
  for(var i=0;i<data.length;i++) {
    var marker = L.marker([parseFloat(data[i].lat), parseFloat(data[i].lng)]);
    var popupInfo = metadata(data[i]);
	
	//type in your desired dimensions for the markers; the marker will always be square
	var iconDim = 31;
	category = data[i].category.toLowerCase();
	marker.setIcon( L.icon({
		iconUrl: "markers/" + data[i].markerfile,
		iconSize: [iconDim, iconDim],
		iconAnchor: [iconDim/2, iconDim*0.9],
		popupAnchor: [0, 0]
		/*shadowUrl: 'my-icon-shadow.png',
		shadowSize: [68, 95],
		shadowAnchor: [22, 94]*/
	}));
    marker.bindPopup(popupInfo,{'maxWidth':'350','maxHeight':'350','minWidth':'200'});
    points.addLayer(marker);
	if (category === "instant runoff current") {
	   instantrunoffCurrent.addLayer(marker);
	}
	else if (category === "instant runoff inactive") {
	   instantrunoffPast.addLayer(marker);
	}
	else if (category === "other ranked choice inactive") {
	   otherrankedchoicePast.addLayer(marker);
	}
	else if (category === "single transferable vote current") {
	  stvCurrent.addLayer(marker);
	}
	else if (category === "single transferable vote inactive") {
	  stvPast.addLayer(marker);
	}
	else if (category === "limited vote current") {
	  limitedvoteCurrent.addLayer(marker);
	}
	else if (category === "limited vote inactive") {
	   limitedvotePast.addLayer(marker);
	}
	else if (category === "cumulative voting current") {
	  cumulativvoteCurrent.addLayer(marker);
	}
	else if (category === "cumulative voting inactive") {
	  cumulativevotePast.addLayer(marker);
	}
  }

  var overlayMaps = {
    "<img src='markers/instant-runoff.svg' height=24>Instant Runoff, current": instantrunoffCurrent,
	"<img src='markers/instant-runoff-inactive.svg' height=24>Instant Runoff, inactive": instantrunoffPast,
	"<img src='markers/other-ranked-choice-inactive.svg' height=24>Other Ranked Choice, inactive": otherrankedchoicePast,
	"<img src='markers/stv.svg' height=24>Single-Transferable Vote, current": stvCurrent,
	"<img src='markers/stv-inactive.svg' height=24>Single Transferable Vote, inactive": stvPast,
	"<img src='markers/limited-vote.svg' height=24>Limited Vote, current": limitedvoteCurrent,
	"<img src='markers/limited-vote-inactive.svg' height=24>Limited Vote, inactive":  limitedvotePast,
	"<img src='markers/cumulative-voting.svg' height=24>Cumulative Voting, current": cumulativvoteCurrent,
	"<img src='markers/cumulative-voting-inactive.svg' height=24>Cumulative Voting, inactive": cumulativevotePast
  };
  
  
  //This is intended to make the legned collapse by default on mobile devices
  //from http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
  var windowWidth = 0;
  
  if( typeof( window.innerWidth ) === 'number' ) {
  windowWidth = window.innerWidth;
} else if( document.documentElement && document.documentElement.clientWidth ) {
  windowWidth = document.documentElement.clientWidth;
} else if( document.body && document.body.clientWidth ) {
  windowWidth = document.body.clientWidth;
}

if (windowWidth < 400) {
  var collapseLegend = true;
} else {
  var collapseLegend = false;
}
  
  L.control.layers(false, overlayMaps, {position: 'bottomleft', collapsed:collapseLegend}).addTo(map);
  map.addLayer(instantrunoffCurrent);
  map.addLayer(instantrunoffPast,);
  map.addLayer(otherrankedchoicePast);
  map.addLayer(stvCurrent);
  map.addLayer(stvPast);
  map.addLayer(limitedvoteCurrent);
  map.addLayer(limitedvotePast);
  map.addLayer(cumulativvoteCurrent);
  map.addLayer(cumulativevotePast);
  
  
  var bounds = points.getBounds();
  map.fitBounds(bounds, {padding:[30,30]});

  map.setView(map.getCenter());

  map.on('click', function(e) {
    var coords = document.getElementById('coords');
    coords.innerHTML="<p>Lat: <strong>" + e.latlng.lat + "</strong>, Lng: <strong>" + e.latlng.lng+"</strong>";
  });
}

//add fields here that you do not want displayed in the popupInfo. Must be all lowercase

function metadata(properties) {
  //This is equivalent to the first row of the spreadsheet, these are the field names; field names are called keys
  var obj = Object.keys(properties);
  //This is all of the HTML that goes into the popup
  var info = "";
  for(var p=0; p<obj.length; p++) {
    var prop = obj[p];
    if (prop != 'lat' &&
        prop != 'lng' &&
		prop != 'single-or-multi' &&
		prop != 'category' &&
		prop != 'category-old' &&
		prop != 'subcategory-display' &&
        prop != 'marker-color' &&		
        prop != 'markerfile' &&
		prop != 'active' &&
        prop != 'rowNumber' &&
		prop != 'moreinfo-text1' &&
        prop != 'moreinfo-text2' &&
        prop != 'moreinfo-text3' &&
        prop != 'moreinfo-text4' &&
        prop != 'rowNumber' &&	
        prop != 'sort' &&
        prop != 'school' &&
        prop != 'statewide' &&		
		properties[prop].length > 0) {
      //prop is the field name from the spreadsheet; properties is the geoJSON generated from one row of the spreadsheet
	  //INSTEAD OF PROP, NEED TO WRITE A NEW FUNCTION THAT DOES TEXT SUBSTITUTIONS
	  //get rid of <strong>"+prop+"</strong>: to not show the field names in the popup
	  info += "<p class='"+prop+"'>"+properties[prop]+"</p>";
    }
  }
//console.log(info);
  return info;
}

function showErrors(err) {
  console.log(err);
}