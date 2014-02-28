var map, markers, terms, geom, maps, sidebar;

function setupMap() {
	map = L.map('map').setView([0,0], 2);
	L.tileLayer('https://a.tiles.mapbox.com/v3/examples.map-vyofok3q/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 8
	}).addTo(map);

	sidebar = L.control.sidebar('leaflet-sidebar', {
    position: 'right',
    autoPan: false
	});

	map.addControl(sidebar);

	markers = new L.MarkerClusterGroup({
		showCoverageOnHover: false,
		spiderfyOnMaxZoom: false,
		singleMarkerMode: true,
		animateAddingMarkers: true
	});

	$.ajax('/terms.json').done(function(data){
		terms = data;
	});

	$.ajax('/places.json').done(function(data){
		geom = data;
		$.each(data, function(i,val){

			latlng = val.geometry;

			if (val.searchTerm !== 'Africa' && val.searchTerm !== 'Africa--Maps' && val.searchTerm !== 'Volta' && val.searchTerm !== 'Lower Egypt'){
				for (var k = 0; k < terms[val.searchTerm]; k++){
					markers.addLayer(createMarker(val,latlng));
				}
			}
		});
		map.addLayer(markers);
		markers.on('clusterclick', function(e){
			if (map.getZoom() === 8){
				var title = e.layer._markers[0].options.searchTerm;
				var list = buildList(title);

				mapWidth = $('#map').width();
				mapHeight = $('#map').height();
				map.panBy([(e.originalEvent.layerX - (mapWidth/4)), (e.originalEvent.layerY - (mapHeight/2))]);
				
				$('#leaflet-sidebar').html("<h2>" + title + "</h2>" + list);
				sidebar.show();
			}
		});
	});

	$.ajax('/mapsofafrica.json').done(function(data){
		maps = data;
		
	});

	map.on('click', function(e){
		if (sidebar.isVisible()){
			sidebar.hide();
		}
	});

	map.on('drag', function(e){
		if (sidebar.isVisible()){
			sidebar.hide();
		}
	});
}

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

$(document).ready(function(){
	setupMap();
});