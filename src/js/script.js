var status = 'stopped';
var TILE_SIZE = 256;

// https://stackoverflow.com/questions/8663246/javascript-timer-loop

setInterval(tickFunction, 500);

function tickFunction( )
{
  //this will repeat every 5 seconds
  //you can reset counter here
  if('playing' == status){
  	// log('tick');
  	// https://stackoverflow.com/questions/33474379/dynamically-set-value-of-bootstrap-slider
  	var newValue = parseInt($('.chartSlider').val())+5;

  	if( newValue > $('.timespanSlider').val() ){
  		log('Paused');
  		status = 'stopped';
		$('#pause').hide();
		$('#play').show();
  		return;
  	}

  	$('#chartValue').val(newValue);
  	chartSlider = $("#chartSlider").slider({'max':$('.timespanSlider').val()});
	chartSlider.slider('setValue', newValue);
	$('.chartSlider').attr('data-value',newValue);
	$('.chartSlider').val(newValue);
    surface($('.selectedID').val());
  }
  
}

$(function () {

	log('Starting....');

  	$('[data-toggle="tooltip"]').tooltip();
  	$('[data-toggle="popover"]').popover();

	// Update Slider on change
	$(".slider").on("slide", function(slideEvt) {
		if(this.name != undefined){
			value = slideEvt.value+$('#'+this.name.replace('Slider','Value')).data('unit-symbol');
			$('#'+this.name.replace('Slider','Value')).val(value);	
		}		
		
	}); // end on(slide)

	$(".slider").on("change", function(slideEvt) {
		if(this.name == 'chartSlider'){
			surface($('.selectedID').val());	
		}
	}); // end on(change)		

	$('input#generate').on('click',function(){
		if( $('.selectedID').val() == ''){
			log('Please Select a Glacier');
			return;
		}
  		log('Generating Chart');
  		log('Basal Lubrication: '+$('.basalLubricationSlider').val());
  		log('Terminus Position: '+$('.terminusPositionSlider').val());
  		log('Ice Rheology: '+$('.iceRheologySlider').val());
  		log('Climate Change: '+$('.climateChangeValue:checked').val());
  		log('Timespan: '+$('.timespanSlider').val());
  		log('Selected ID: '+$('.selectedID').val());
  		log('Starting AJAX');

  		surface($('.selectedID').val());

  		chartSlider = $("#chartSlider").slider({'max':$('.timespanSlider').val()});
  	    chartSlider.slider('setValue', 0);  
	    $('#chartValue').val(0);

  		$('.chart-data').removeClass('d-none');
  		$('.chart-data').show();  	

  		$('html, body').animate({
		    scrollTop: $(".chart-data").offset().top-60
		}, 1000);	
  	});

	$('#beginning').on('click', function(){
		log('Returning to Beginning');
		status = 'stopped';
		$('#chartValue').val(0);
		chartSlider.slider('setValue', 0);
		$('.chartSlider').attr('data-value',0);
		$('.chartSlider').val(0);
		$('#pause').hide();
		$('#play').show();
		surface($('.selectedID').val());
	});

	$('#end').on('click', function(){
		log('Advancing to End');
		status = 'stopped';
		$('#chartValue').val($('.timespanSlider').val());
		chartSlider.slider('setValue', $('.timespanSlider').val());
		$('.chartSlider').attr('data-value',$('.timespanSlider').val());
		$('.chartSlider').val($('.timespanSlider').val());
		$('#pause').hide();
		$('#play').show();
		surface($('.selectedID').val());
	});

	$('#play').on('click', function(){
		log('Playing');
		status = 'playing';
		$('#play').hide();
		$('#pause').removeClass('d-none');
		$('#pause').show();

		surface($('.selectedID').val());

		// loop to advance slider / redraw chart

	});	

	$('#pause').on('click', function(){
		log('Paused');
		status = 'stopped';
		$('#pause').hide();
		$('#play').show();

	});	

}) // end function

function log(message){
	value = $('textarea#console').val() + Date() + ' ' + message + "\n";
	$('textarea#console').val(value);
	var elem = document.getElementById('console');
  	elem.scrollTop = elem.scrollHeight;	
}

var TILE_URL = 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg';
// TILE_URL = 'http://via.placeholder.com/256?text=Zoom:+{z}+X:+{x}+Y:+{y}'
TILE_URL = 'http://10.211.55.7:3000/assets/tiles/{x}_{y}_{z}.jpg'
var map;
var mapEl;
var layer;
var layerID = 'my-custom-layer';

var markers = new Array();
var coordInfoWindows = new Array();

function createInfoWindowContent(latLng, title, description) {
        // var scale = 1 << zoom;

        // var worldCoordinate = project(latLng);

        // var pixelCoordinate = new google.maps.Point(
        //     Math.floor(worldCoordinate.x * scale),
        //     Math.floor(worldCoordinate.y * scale));

        // var tileCoordinate = new google.maps.Point(
        //     Math.floor(worldCoordinate.x * scale / TILE_SIZE),
        //     Math.floor(worldCoordinate.y * scale / TILE_SIZE));

        return [
          title,
          description,
          'LatLng: ' + latLng,
          //'Zoom level: ' + zoom,
          // 'World Coordinate: ' + worldCoordinate,
          // 'Pixel Coordinate: ' + pixelCoordinate,
          // 'Tile Coordinate: ' + tileCoordinate
        ].join('<br>');
      }

function initMap() {
        var greenland = new google.maps.LatLng(71.7069, -42.6043);
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 3,
          mapTypeId: 'hybrid',
          center: greenland,
          zoomControl: true,
		  mapTypeControl: false,
		  scaleControl: false,
		  streetViewControl: false,
		  rotateControl: false,
		  fullscreenControl: false

        });

        json = '/assets/markers.json';

        $.getJSON(json, function(json_data) {

			$.each(json_data, function(key, data) {

				log(data.Label);

			    var latLng = new google.maps.LatLng(data.Latitude, data.Longitude);

			    log(data.description);

			    var marker = new google.maps.Marker({
			        position:   latLng,
			        map:        map,
			       //  icon: {
				      //   anchor: new google.maps.Point(30, 30.26),
				      //   size: new google.maps.Size(151,151),
				      //   scaledSize: new google.maps.Size(50, 50),
				      //   url: '/assets/meltdown-logo.svg'
				      // },
				    // https://sites.google.com/site/gmapsdevelopment/  
				    icon: 'http://maps.google.com/mapfiles/ms/micons/red-pushpin.png',
			        title:      data.Label,
			        ID: data.ID,
			        description: data.Description
			    });

			    markers.push(marker);


			    marker.addListener('click', function() {
					log('Marker '+this.title+' '+this.ID+' Selected');
					$('.selectedID').val(this.ID);

					$.each(markers, function(){
						// Turn all markers Red
						this.setIcon('http://maps.google.com/mapfiles/ms/micons/red-pushpin.png');
					});
					// Turn this marker Green
					marker.setIcon('http://maps.google.com/mapfiles/ms/micons/grn-pushpin.png');

					$.each(coordInfoWindows, function(){
						// Turn off all coordInfoWindows
						this.close(map);
					});

					var coordInfoWindow = new google.maps.InfoWindow();
					coordInfoWindow.setContent(createInfoWindowContent(latLng, this.title, this.description ));
					coordInfoWindow.setPosition(latLng);
					coordInfoWindow.open(map);

					coordInfoWindows.push(coordInfoWindow);

		        });

			    // var details = data.website + ", " + data.phone + ".";

			    // bindInfoWindow(marker, map, infowindow, details);

			});

		});

        // var marker = new google.maps.Marker({
        //   position: uluru,
        //   map: map
        // });

        // ***DEBUG MAP MARKER***

        // var coordInfoWindow = new google.maps.InfoWindow();
        // coordInfoWindow.setContent(createInfoWindowContent(greenland, map.getZoom()));
        // coordInfoWindow.setPosition(greenland);
        // coordInfoWindow.open(map);

        // map.addListener('zoom_changed', function() {
        //   coordInfoWindow.setContent(createInfoWindowContent(greenland, map.getZoom()));
        //   coordInfoWindow.open(map);
        // });

        // ***END DEBUG MAP MARKER***


        // ***CUSTOM TILES***
        // Create a tile layer, configured to fetch tiles from TILE_URL.
		// layer = new google.maps.ImageMapType({
		// name: layerID,
		// getTileUrl: function(coord, zoom) {
		//   console.log(coord);
		//   var url = TILE_URL
		//     .replace('{x}', coord.x)
		//     .replace('{y}', coord.y)
		//     .replace('{z}', zoom);
		//   return url;
		// },
		// tileSize: new google.maps.Size(256, 256),
		// minZoom: 1,
		// maxZoom: 20
		// });

		// Apply the new tile layer to the map.
		// Removed until tiles can be generated
		// map.mapTypes.set(layerID, layer);
		// map.setMapTypeId(layerID);

		// ***END CUSTOM TILES***
      }

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(latLng) {
	var siny = Math.sin(latLng.lat() * Math.PI / 180);

	// Truncating to 0.9999 effectively limits latitude to 89.189. This is
	// about a third of a tile past the edge of the world tile.
	siny = Math.min(Math.max(siny, -0.9999), 0.9999);

	return new google.maps.Point(
	    TILE_SIZE * (0.5 + latLng.lng() / 360),
	    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
}      
    
var svg, g;

function surface(glacier){
	// log('Building Surface Chart');

	// Check for invalid Glacier before loading file
	if( ! Number.isInteger( parseInt(glacier) ) ){
		log('Invalid Glacier');
		return;
	}

	// d3.select("svg.surface g").remove();
	// d3.select("svg.surface path").remove();
	// svg.selectAll("*").remove();
	svg = d3.select("svg.surface"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	// d3.forceY([-1000,1000]);
	// d3.forceX([1000,0]);
	
	var x = d3.scaleLinear()
	    .rangeRound([0, width]);

	var y = d3.scaleLinear()
	    .rangeRound([height, 0]);

	// x.domain(d3.extent(data.bed, function(d) { return +d; }));
	//y = d3.scale.linear().range([0,width]);
	x.domain([100,0]);
	y.domain([-2000,2000]);

	var sealevel = d3.line()
	    .x(function(d) { return x(d.x); })
	    .y(122);
	    //.y(function(d) { return y(d); });


	var line_x = 0;
	var line = d3.line()
	    .x(function(d) { return x(d.x); })
	    .y(function(d) { return y(d.y); });
	    //.y(function(d) { return y(d); });

	var line2_x = 0;   
	var line2 = d3.line()
	    .x(function(d) { return x(d.x); })
	    .y(function(d) { return y(d.y); });

	// define the area
	  // https://bl.ocks.org/d3noob/119a138ef9bd1d8f0a8d57ea72355252
	  var area_x = 0;
	  var area = d3.area()
	    .x(function(d) { return x(d.x); })
	    .y0(height)
	    .y1(function(d) { return y(d.y); });
	    
	// define the area
	  // https://bl.ocks.org/d3noob/119a138ef9bd1d8f0a8d57ea72355252
	  var area2_x = 0;
	  var area2 = d3.area()
	    .x(function(d) { return x(d.x); })
	    .y0(height)
	    .y1(function(d) { return y(d.y); });        

	// log("/assets/"+glacier+".json");
	d3.json("/assets/"+glacier+".json", function(error, data) {
	  if (error) throw error;

	  // console.log(data.bed);
	  // console.log(d3.extent(data.bed, function(d) { console.log(d); return +d; }));
	  // d = data.bed;

	  
	  g.append("defs")
		 .append('pattern')
		 .attr('id', 'bedrock')
		 .attr('patternUnits', 'userSpaceOnUse')
		 .attr('width', 2048)
		 .attr('height', 1536)
		 .append("image")
		 .attr("xlink:href", "./assets/pattern_of_stone_texture.jpg")
		 .attr('width', 1024)
		 .attr('height', 768);

      g.select("defs")
		 .append('pattern')
		 .attr('id', 'glacier')
		 .attr('patternUnits', 'userSpaceOnUse')
		 .attr('width', 2048)
		 .attr('height', 1536)
		 .append("image")
		 .attr("xlink:href", "./assets/pattern_of_snow_texture.jpg")
		 .attr('width', 1024)
		 .attr('height', 768);

	  g.append("g")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(x))
	    .select(".domain")
	      .remove();

	  g.append("g")
	      .call(d3.axisLeft(y))
	    .append("text")
	      .attr("fill", "#000")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", "0.71em")
	      .attr("text-anchor", "end")
	      .text("Depth (m)");

	  bed_data = new Array();

	  var x_index = 0;
	  $.each(data.bed, function(k, v){
	  	var map_data = {x: 100-(x_index++)*(100/data.bed.length),y: v}
	  	bed_data.push(map_data);
	  });

	  surface_data = new Array();

	  var x_index = 0;
	  $.each(data.surface[$('#chartValue').val()], function(k, v){
	  	var map_data = {x: 100-(x_index++)*(100/data.bed.length),y: v}
	  	surface_data.push(map_data);
	  });

	  // g.append("path")
	  //     .datum(bed_data)
	  //     .attr("fill", "none")
	  //     .attr("stroke", "steelblue")
	  //     .attr("stroke-linejoin", "round")
	  //     .attr("stroke-linecap", "round")
	  //     .attr("stroke-width", 2.0)
	  //     .attr("d", line);

	  // log($('#chartValue').val());

	  // g.append("path")
	  //     .datum(surface_data)
	  //     .attr("fill", "none")
	  //     .attr("stroke", "steelblue")
	  //     .attr("stroke-linejoin", "round")
	  //     .attr("stroke-linecap", "round")
	  //     .attr("stroke-width", 2.0)
	  //     .attr("d", line2);  

	 d3.select("#glacier-area").remove();
	

	  // add the area
      g.append("path")
       .datum(surface_data)
       // .datum(data.surface[$('#chartValue').val()])
       .attr("class", "area")
       .attr("id","glacier-area")
       .attr("fill", "url(#glacier)")
       .attr("d", area);     

     d3.select("#bedrock-area").remove();

	  // // add the area
      g.append("path")
       .datum(bed_data)
       .attr("class", "area")
       .attr("id","bedrock-area")
       .attr("fill", "url(#bedrock)")
       .attr("d", area2);

    g.append("path")
	      .datum(bed_data)
	      .attr("fill", "none")
	      .attr("id","sealevel")
	      .attr("stroke", "deepskyblue")
	      .attr("stroke-linejoin", "round")
	      .attr("stroke-linecap", "round")
	      .attr("stroke-width", 2.0)
	      .attr("d", sealevel);   

	g.append("g")
	      .call(d3.axisLeft(y))
	    .append("text")
	      .attr("fill", "#000")
	      // .attr("transform", "rotate(-90)")
	      .attr("y", 110)
	      .attr("dy", "0.71em")
	      .attr("text-anchor", "end")
	      .text("Sealevel  |");

	}); // end tsv load 
}
    

