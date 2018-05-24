var status = 'stopped';
var TILE_SIZE = 256;
var svg = Array();
var g = Array();
var svg_2, g_2;
var area,area2;
var resolution = '100';
var chart1_data;
var chart2_data;

var width;
var height;
var Min, Max, domain;


bed_data = new Array();
surface_data = new Array();

var x = Array();
var y = Array();


setInterval(tickFunction, 100);
function tickFunction( )
{
	//this will repeat every 1 second
	//you can reset counter here
	if('playing' == status)
	{
  		// https://stackoverflow.com/questions/33474379/dynamically-set-value-of-bootstrap-slider
  		var newValue = parseInt($('.chartSlider').val())+1;

  		if( newValue > $('.timespanSlider').val() )
			{
  			//log('Paused');
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
		update_chart($('.selectedID').val(),'chart1');
		update_chart($('.selectedID').val(),'chart2');
	}
}

$(function () 
{
  	$('[data-toggle="tooltip"]').tooltip();
  	$('[data-toggle="popover"]').popover();

	// Update Slider on change
	$(".slider").on("slide", function(slideEvt)
	{
		if(this.name != undefined)
		{
			value = slideEvt.value+$('#'+this.name.replace('Slider','Value')).data('unit-symbol');
			$('#'+this.name.replace('Slider','Value')).val(value);	
		}		
		
	}); // end on(slide)

	$(".slider").on("change", function(slideEvt) 
	{
		if(this.name == 'chartSlider')
		{
		
			update_chart($('.selectedID').val(),'chart1');
			update_chart($('.selectedID').val(),'chart2');
			
		}
	}); // end on(change)		

	$('input#generate').on('click',function()
	{
		if( $('.selectedID').val() == '')
		{
			return;
		}

		draw_chart($('.selectedID').val(),'chart1');
		draw_chart($('.selectedID').val(),'chart2');

  		chartSlider = $("#chartSlider").slider({'max':$('.timespanSlider').val()});
		chartSlider.slider('setValue', 0);  

		$('#chartValue').val(0);

  		$('.chart-data').removeClass('d-none');
  		$('.chart-data').show();  	

  		$('html, body').animate(
		{
		    scrollTop: $(".chart-data").offset().top-60
		}, 1000);	
  	});

	$('#beginning').on('click', function()
	{
		status = 'stopped';
		$('#chartValue').val(0);
		chartSlider.slider('setValue', 0);
		$('.chartSlider').attr('data-value',0);
		$('.chartSlider').val(0);
		$('#pause').hide();
		$('#play').show();
		update_chart($('.selectedID').val(),'chart1');
		update_chart($('.selectedID').val(),'chart2');
	});

	$('#end').on('click', function()
	{
		status = 'stopped';
		$('#chartValue').val($('.timespanSlider').val());
		chartSlider.slider('setValue', $('.timespanSlider').val());
		$('.chartSlider').attr('data-value',$('.timespanSlider').val());
		$('.chartSlider').val($('.timespanSlider').val());
		$('#pause').hide();
		$('#play').show();
		update_chart($('.selectedID').val(),'chart1');
		update_chart($('.selectedID').val(),'chart2');
	});

	$('#play').on('click', function()
	{
		status = 'playing';
		$('#play').hide();
		$('#pause').removeClass('d-none');
		$('#pause').show();

		update_chart($('.selectedID').val(),'chart1');
		update_chart($('.selectedID').val(),'chart2');
		
		// loop to advance slider / redraw chart

	});	

	$('#pause').on('click', function()
	{
		status = 'stopped';
		$('#pause').hide();
		$('#play').show();

	});	

}) // end function

var TILE_URL = 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg';
// TILE_URL = 'http://via.placeholder.com/256?text=Zoom:+{z}+X:+{x}+Y:+{y}'
TILE_URL = 'http://10.211.55.7:3000/assets/tiles/{x}_{y}_{z}.jpg'
var map;
var mapEl;
var layer;
var layerID = 'my-custom-layer';

var markers = new Array();
var polygons = new Array();
var coordInfoWindows = new Array();

function createInfoWindowContent( title, description) {
        return [
          title,
	  description
        ].join('<br>');
      }

function initMap() {
        var greenland = new google.maps.LatLng(71.7069, -42.6043);

        var map = new google.maps.Map(document.getElementById('map'),
	{
          zoom: 3,
	  maxZoom: 12,
          minZoom: 2,
          mapTypeId: 'hybrid',
          center: greenland,
          zoomControl: true,
		  mapTypeControl: false,
		  scaleControl: false,
		  streetViewControl: false,
		  rotateControl: false,
		  fullscreenControl: false
        });
	
        jsonMarkers = '/assets/markers.json';
        $.getJSON(jsonMarkers, function(json_data)
	{
		$.each(json_data, function(key, data) 
			{
			var latLng = new google.maps.LatLng(data.Latitude, data.Longitude);
				
			jsonShapeFile = '/assets/cacheFolder/' + data.ID + '_Shape.json';

			$.getJSON(jsonShapeFile, function(shape_data)
			{
				var midLine = [];
				var polygon = [];
				var polygon2 = [];

				$.each(shape_data.Midline, function(index)
				{
					midLine.push(shape_data.Midline[index]);
				});

				$.each(shape_data.Shear1, function(index)
				{
					polygon.push(shape_data.Shear1[index]);
				});
		
				$.each(shape_data.Shear2, function(index)
				{
					polygon2.push(shape_data.Shear2[index]);
				});

				$.each(polygon2, function()
				{
					polygon.push(polygon2.pop());
				});

				var midLineCoords = [];
				$.each(midLine, function(index)
				{
					var coords = {lat: midLine[index][1], lng: midLine[index][0]};
					midLineCoords.push(coords);
				});

				var midPath = new google.maps.Polyline({
         				path: midLineCoords,
         				geodesic: true,
					strokeColor: '#FF0000',
					strokeOpacity: 1.0,
					strokeWeight: 2
	       				});
				midPath.setMap(map);


				var polygonCoords = [];
				$.each(polygon, function(index)
				{
					var coords = {lat: polygon[index][1], lng: polygon[index][0]};
					polygonCoords.push(coords); 
				});
				var polygon = new google.maps.Polygon({
					path: polygonCoords,
					strokeColor: '#0000FF',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#0000FF',
					fillOpacity: 0.35,
					title: data.Label,
					ID: data.ID,
					description: data.Description,
					Max: data.Max,
					Min: data.Min,
					domain: data.domain,
					position: latLng
					});
				polygon.setMap(map);
				polygons.push(polygon);
	                        polygon.addListener('click', function() 
				{
                                        //log('Marker '+this.title+' '+this.ID+' Selected');
                                        $('.selectedID').val(this.ID);
                                        $('.selectedDomain').val(this.domain);
                                        $('.selectedMin').val(this.Min);
                                        $('.selectedMax').val(this.Max);
					

					$.each(polygons, function()
					{
					this.setOptions({fillColor: '#0000FF'});
					this.setOptions({strokeColor: '#0000FF'});
					});

					this.setOptions({fillColor: '#FF0000'});
					this.setOptions({strokeColor: '#FF0000'});

                                        $.each(coordInfoWindows, function()
					{
						this.close(map);
                                        });

                                        var coordInfoWindow = new google.maps.InfoWindow();
                                        coordInfoWindow.setContent(createInfoWindowContent( this.title, this.description ));
                                        coordInfoWindow.setPosition(latLng);
                                        coordInfoWindow.setZIndex(-1);
                                        coordInfoWindow.open(map, this);

                                        coordInfoWindows.push(coordInfoWindow);
				});

			});
		});

	});

}

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(latLng) 
{
	var siny = Math.sin(latLng.lat() * Math.PI / 180);

	// Truncating to 0.9999 effectively limits latitude to 89.189. This is
	// about a third of a tile past the edge of the world tile.
	siny = Math.min(Math.max(siny, -0.9999), 0.9999);

	return new google.maps.Point(
	    TILE_SIZE * (0.5 + latLng.lng() / 360),
	    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
}      
    

function draw_chart(glacier,chart)
{
	svg[chart] = d3.select("svg."+chart);
	
	if( typeof svg[chart].selectAll === "function" )
	{
		svg[chart].selectAll("*").remove();
	}
	
	var margin = {top: 20, right: 20, bottom: 30, left: 50};
	width = +svg[chart].attr("width") - margin.left - margin.right;
	height = +svg[chart].attr("height") - margin.top - margin.bottom;
	g[chart] = Array();
	g[chart]['layer1'] = svg[chart].append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	g[chart]['layer2'] = svg[chart].append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	g[chart]['layer3'] = svg[chart].append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	g[chart]['layer4'] = svg[chart].append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	Min = $('.selectedMin').val();
	Max = $('.selectedMax').val();
	domain = $('.selectedDomain').val();
	
	x[chart] = d3.scaleLinear().rangeRound([0, width]);
	y[chart] = d3.scaleLinear().rangeRound([height, 0]);

	x[chart].domain([domain,0]);
	y[chart].domain([Min,Max]);

	

	// define the area
	// https://bl.ocks.org/d3noob/119a138ef9bd1d8f0a8d57ea72355252
	var area_x = 0;
	area = d3.area()
	.x(function(d) {return x[chart](d.x); })
	.y0(height)
	.y1(function(d) { return y[chart](d.y); });
	    
	// define the area
	// https://bl.ocks.org/d3noob/119a138ef9bd1d8f0a8d57ea72355252
	var area2_x = 0;
	area2 = d3.area()
		.x(function(d) { return x[chart](d.x); })
		.y0(height)
	.y1(function(d) { return y[chart](d.y); });        

	g[chart]['layer2'].append("defs")
		.append('pattern')
		.attr('id', 'bedrock')
		.attr('patternUnits', 'userSpaceOnUse')
		.attr('width', 2048)
		.attr('height', 1536)
		.append("image")
		.attr("xlink:href", "./assets/pattern_of_stone_texture.jpg")
		.attr('width', 1024)
		.attr('height', 768);

	g[chart]['layer1'].append("defs")
		.append('pattern')
		.attr('id', 'glacier')
		.attr('patternUnits', 'userSpaceOnUse')
		.attr('width', 2048)
		.attr('height', 1536)
		.append("image")
		.attr("xlink:href", "./assets/pattern_of_snow_texture.jpg")
		.attr('width', 1024)
		.attr('height', 768);

	g[chart]['layer3'].append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x[chart]))
		.append("text")
		.attr("fill", "#000")
		.attr("x", width-6)
		.attr("y",  - 6)
		.attr("text-anchor", "end")
		.style("font-size", "22px")

		.text("Distance (km)")
		  
		g[chart]['layer3'].append("g")
		.call(d3.axisLeft(y[chart]))
		.append("text")
		.attr("fill", "#000")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.style("font-size", "22px")
		.text("Elevation (m)");

	initial_chart(glacier,chart);
}

function initial_chart(glacier,chart)
{

	// Check for invalid Glacier before loading file
	if( ! Number.isInteger( parseInt(glacier) ) )
	{
		return;
	}
	
		
	d3.json("/assets/"+glacier+"_"+resolution+".json", function(error, data)
	{
	
		if (error) throw error;
	  
		bed_data[chart] = new Array();
	  	var x_index = 0;

		$.each(data.bedrock, function(k, v)
		{
	  		var map_data = {x: (data.bedrock.length - ++x_index)*(data.domain/(data.bedrock.length-1)),y: v}
	  		bed_data[chart].push(map_data);
		});

		surface_data[chart] = new Array();

		x_index = 0;
		x2_index = 0;

		$.each(data[chart][$('#chartValue').val()], function(k, v)
		{
	  		if(x_index++ % (data[chart][$('#chartValue').val()].length/resolution) != 0)
			{
				return;
			}
	
			var map_data = {x: (data.bedrock.length - ++x2_index)*(data.domain/(data.bedrock.length-1)),y: v}
			surface_data[chart].push(map_data);
		});
 
		d3.select("svg."+chart+" #glacier-area").remove();
	
		g[chart]['layer1'].append("path")
		.datum(surface_data[chart])
		.attr("class", "area")
		.attr("id","glacier-area")
		.attr("fill", "url(#glacier)")
		.attr("d", area);
     
		// // add the area
		g[chart]['layer2'].append("path")
		.datum(bed_data[chart])
		.attr("class", "area")
		.attr("id","bedrock-area")
		.attr("fill", "url(#bedrock)")
		.attr("d", area2);
		
		var sealevel = d3.line()
		.x(function(d) { return x[chart](d.x); })
		.y(height*(Max/Math.abs(Max - Min)));

		g[chart]['layer4'].append("path")
		.datum(bed_data[chart])
		.attr("fill", "none")
		.attr("id","sealevel")
		.attr("stroke", "deepskyblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 2.0)
		.attr("d", sealevel);
		
	}); 
}

function update_chart(glacier,chart)
{
	// Check for invalid Glacier before loading file
	if( ! Number.isInteger( parseInt(glacier) ) )
	{
		return;
	}
	
	d3.json("/assets/"+glacier+"_"+resolution+".json", function(error, data) 
	{
		if (error) throw error;
	  
		bed_data[chart] = new Array();
		var x_index = 0;

		$.each(data.bedrock, function(k, v)
		{
	  		var map_data = {x: (data.bedrock.length - x_index++)*(data.domain/data.bedrock.length),y: v}
	  		bed_data[chart].push(map_data);
	  	});

		surface_data[chart] = new Array();

		x_index = 0;
		x2_index = 0;

		$.each(data[chart][$('#chartValue').val()], function(k, v)
		{
	  		if(x_index++ % (data[chart][$('#chartValue').val()].length/resolution) != 0)
			{
				return;
			}
		var map_data = {x: (data.bedrock.length - ++x2_index)*(data.domain/(data.bedrock.length-1)),y: v}
	  	surface_data[chart].push(map_data);
		});
	  
		d3.select("svg."+chart+" #glacier-area").remove();

		// add the area
		g[chart]['layer1'].append("path")
		.datum(surface_data[chart])
		.attr("class", "area")
		.attr("id","glacier-area")
		.attr("fill", "url(#glacier)")
		.attr("d", area);     
	}); 
}
