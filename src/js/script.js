var status = 'stopped';
var TILE_SIZE = 256;

$(function () {

	log('Starting....');

  	$('[data-toggle="tooltip"]').tooltip();
  	$('[data-toggle="popover"]').popover();

	// Update Slider on change
	$(".slider").on("slide", function(slideEvt) {
		if(this.name != undefined){
			value = slideEvt.value+$('#'+this.name.replace('slider','value')).data('unit-symbol');
			$('#'+this.name.replace('slider','value')).val(value);	
		}		
	}); // end on(slide)

	$('input#generate').on('click',function(){
		if( $('.selectedID').val() == ''){
			log('Please Select a Glacier');
			return;
		}
  		log('Generating Chart');
  		log('Rainfall: '+$('.rainfallslider').val());
  		log('Temperature: '+$('.tempslider').val());
  		log('Snowfall: '+$('.snowfallslider').val());
  		log('Timespan: '+$('.timespanslider').val());
  		log('Selected ID: '+$('.selectedID').val());
  		
  		log('Starting AJAX');

  		surface();

  		chartSlider = $("#chartslider").slider({'max':$('.timespanslider').val()});
  		
	    // chartSlider.slider('setAttribute', );  
	    chartSlider.slider('setValue', 0);  
	    $('#chartvalue').val(0);

  		$('.chart-data').removeClass('d-none');
  		$('.chart-data').show();  		
  	});

	$('#beginning').on('click', function(){
		log('Returning to Beginning');
		status = 'stopped';
		$('#chartvalue').val(0);
		chartSlider.slider('setValue', 0);
		$('.chartslider').attr('data-value',0);
		$('.chartslider').val(0);
		$('#pause').hide();
		$('#play').show();
	});

	$('#end').on('click', function(){
		log('Advancing to End');
		status = 'stopped';
		$('#chartvalue').val($('.timespanslider').val());
		chartSlider.slider('setValue', $('.timespanslider').val());
		$('.chartslider').attr('data-value',$('.timespanslider').val());
		$('.chartslider').val($('.timespanslider').val());
		$('#pause').hide();
		$('#play').show();
	});

	$('#play').on('click', function(){
		log('Playing');
		status = 'playing';
		$('#play').hide();
		$('#pause').removeClass('d-none');
		$('#pause').show();

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
}

var TILE_URL = 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg';
// TILE_URL = 'http://via.placeholder.com/256?text=Zoom:+{z}+X:+{x}+Y:+{y}'
TILE_URL = 'http://10.211.55.7:3000/assets/tiles/{x}_{y}_{z}.jpg'
var map;
var mapEl;
var layer;
var layerID = 'my-custom-layer';

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

			    var marker = new google.maps.Marker({
			        position:   latLng,
			        map:        map,
			       //  icon: {
				      //   anchor: new google.maps.Point(30, 30.26),
				      //   size: new google.maps.Size(151,151),
				      //   scaledSize: new google.maps.Size(50, 50),
				      //   url: '/assets/meltdown-logo.svg'
				      // },
			        title:      data.Label,
			        ID: data.ID
			    });

			    marker.addListener('click', function() {
		          log('Marker '+this.title+' '+this.ID+' Selected');
		          $('.selectedID').val(this.ID);
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
      
function surface(){
	log('Building Surface Chart');

	var svg = d3.select("svg.surface"),
	    margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = +svg.attr("width") - margin.left - margin.right,
	    height = +svg.attr("height") - margin.top - margin.bottom,
	    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	   
	
	var x = d3.scaleLinear()
	    .rangeRound([0, width]);

	var y = d3.scaleLinear()
	    .rangeRound([height, 0]);

	var line = d3.line()
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.surface_1); });

	var line2 = d3.line()
	    .x(function(d) { return x(d.year); })
	    .y(function(d) { return y(d.surface_2); });

	// define the area
	  // https://bl.ocks.org/d3noob/119a138ef9bd1d8f0a8d57ea72355252
	  var area = d3.area()
	    .x(function(d) { return x(d.year); })
	    .y0(height)
	    .y1(function(d) { return y(d.surface_1); });
	    
	// define the area
	  // https://bl.ocks.org/d3noob/119a138ef9bd1d8f0a8d57ea72355252
	  var area2 = d3.area()
	    .x(function(d) { return x(d.year); })
	    .y0(height)
	    .y1(function(d) { return y(d.surface_2); });        


	d3.tsv("assets/surface-sample.txt", function(d) {
	  // d.date = parseTime(d.date);
	  // d.close = +d.close;
	  return d;
	}, function(error, data) {
	  if (error) throw error;

	  x.domain(d3.extent(data, function(d) { return +d.year; }));
	  y.domain(d3.extent(data, function(d) { return +d.surface_2; }));

	  

	  g.append("defs")
		 .append('pattern')
		 .attr('id', 'bedrock')
		 .attr('patternUnits', 'userSpaceOnUse')
		 .attr('width', 1024)
		 .attr('height', 768)
		 .append("image")
		 .attr("xlink:href", "./assets/pattern_of_stone_texture.jpg")
		 .attr('width', 1024)
		 .attr('height', 768);

      g.select("defs")
		 .append('pattern')
		 .attr('id', 'glacier')
		 .attr('patternUnits', 'userSpaceOnUse')
		 .attr('width', 1024)
		 .attr('height', 768)
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

	  g.append("path")
	      .datum(data)
	      .attr("fill", "none")
	      .attr("stroke", "white")
	      .attr("stroke-linejoin", "round")
	      .attr("stroke-linecap", "round")
	      .attr("stroke-width", 2.0)
	      .attr("d", line);

	  g.append("path")
	      .datum(data)
	      .attr("fill", "none")
	      .attr("stroke", "steelblue")
	      .attr("stroke-linejoin", "round")
	      .attr("stroke-linecap", "round")
	      .attr("stroke-width", 2.0)
	      .attr("d", line2);  

	      // add the area
      g.append("path")
       .data([data])
       .attr("class", "area")
       .attr("fill", "url(#glacier)")
       .attr("d", area);     


	  // add the area
      g.append("path")
       .data([data])
       .attr("class", "area")
       .attr("fill", "url(#bedrock)")
       .attr("d", area2);

     
    


	}); // end tsv load 
}
    

