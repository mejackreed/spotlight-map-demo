var map, markers, terms, geom, maps, sidebar;

function setupMap() {

	//Setup initial map view.  TODO: Will want to do this based off of results set bounding box eventually
	map = L.map('map').setView([0,0], 2);
	L.tileLayer('https://a.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 8
	}).addTo(map);

	//Sets up leaflet-sidebar
	sidebar = L.control.sidebar('leaflet-sidebar', {
    position: 'right',
    autoPan: false
	});

	//Adds leaflet-sidebar control to map (object)
	map.addControl(sidebar);

	//Creates new cluster object, this is where map markers will be pushed
	markers = new L.MarkerClusterGroup({
		showCoverageOnHover: false,
		spiderfyOnMaxZoom: false,
		singleMarkerMode: true,
		animateAddingMarkers: true
	});

	//Grab the placename terms - counts
	$.ajax('terms.json').done(function(data){
		terms = data;
	});

	//Grab the place geometry
	$.ajax('places.json').done(function(data){
		geom = data;

		//iterate through the geometry
		$.each(data, function(i,val){

			latlng = val.geometry;

			//We don't want to map Africa, Africa--Maps, Volta, or Lower Egypt because the turned out weird
			if (val.searchTerm !== 'Africa' && val.searchTerm !== 'Africa--Maps' && val.searchTerm !== 'Volta' && val.searchTerm !== 'Lower Egypt'){
				
				//create a marker for each search term based off the number of times it is used, count coming from terms
				for (var k = 0; k < terms[val.searchTerm]; k++){

					//add marker to marker cluster object
					markers.addLayer(createMarker(val,latlng));
				}
			}
		});

		//add marker cluster object to the map (objects)
		map.addLayer(markers);

		//Add click listener to markercluster
		markers.on('clusterclick', function(e){

			//if map is at the lowest zoom level
			if (map.getZoom() === 8){

				//get the title from the markers inside of the markercluster object
				var title = e.layer._markers[0].options.searchTerm;

				//build the results list sidebar
				var list = buildList(title);

				//Move the map so that it centers the clicked cluster TODO account for various size screens
				mapWidth = $('#map').width();
				mapHeight = $('#map').height();
				map.panBy([(e.originalEvent.layerX - (mapWidth/4)), (e.originalEvent.layerY - (mapHeight/2))]);
				
				//Update sidebar div with new html
				$('#leaflet-sidebar').html("<h2>" + title + "</h2>" + list);

				//Show the sidebar!
				sidebar.show();
			}
		});
	});

	//Get the Maps of Africa document data
	$.ajax('mapsofafrica.json').done(function(data){
		maps = data;
		
	});

	//Add click listener to map
	map.on('click', function(e){

		//hide the sidebar if it is visible
		if (sidebar.isVisible()){
			sidebar.hide();
		}
	});

	//drag listener on map
	map.on('drag', function(e){

		//hide the sidebar if it is visible
		if (sidebar.isVisible()){
			sidebar.hide();
		}
	});
}

//builds the html for the list in sidebar
function buildList(title){
	var list = "<div><ul class='media-list'>";
	$.each(maps, function(i,val){
		if ($.inArray(title, val.subject_geographic_ssim) !== -1){
			list += "<li class='media'><a class='pull-left' href='#'><img class='media-object sidebar-thumb' src='" + val.thumbnail_square_url_ssm + "'></a><div class='media-body'><h4 class='media-heading'><a href='#'>" + val.full_title_tesim + "</a></h4></div></li>";
		}
	});
	list += "</ul></div>";
	return list;
}

//creates a marker that has a click listener in it.  This is necesary to account for places that only have 1 count
function createMarker(val, latlng){
	return new L.Marker([latlng.lat, latlng.lng], {searchTerm: val.searchTerm}).on('click', function(e){
		var title = e.target.options.searchTerm;
		var list = buildList(title);
		mapWidth = $('#map').width();
		mapHeight = $('#map').height();
		map.panBy([(e.originalEvent.layerX - (mapWidth/4)), (e.originalEvent.layerY - (mapHeight/2))]);
		$('#leaflet-sidebar').html("<h2>" + title + "</h2>" + list);
		sidebar.show();
	});
}

//on ready, setup the map
$(document).ready(function(){
	setupMap();
});