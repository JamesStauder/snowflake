$(function () {

	log('Starting....');

  	$('[data-toggle="tooltip"]').tooltip();
  	$('[data-toggle="popover"]').popover();

  	$('input#generate').on('click',function(){
  		log('Button Clicked');
  	});

  	// With JQuery
	// $('.slider').slider({
	// 	formatter: function(value) {
	// 		return 'Current value: ' + value;
	// 	}
	// });

	$(".slider").on("slide", function(slideEvt) {
		// $("#ex6SliderVal").text(slideEvt.value);
		
		if(this.name != undefined){
			// console.log(slideEvt.value);
			// console.log(this.name.replace('slider','value'));
			// console.log('.'+this.name.replace('slider','value'));
			// $('#'+this.name.replace('slider','value')).val(slideEvt.value)	
			// $('#'+this.name.replace('slider','value')).val('888');
			// console.log($('#tempvalue').val());
			// console.log('input#'+this.name.replace('slider','value'));
			// console.log('value: '+$('#'+this.name.replace('slider','value')).val());
			// log('Slider Updated');
			$('#'+this.name.replace('slider','value')).val(slideEvt.value+$('#'+this.name.replace('slider','value')).data('unit-symbol'))	

		}
		
	});

	// stock();

	surface();

}) // end function

function log(message){
	$('textarea#console').val($('textarea#console').val() + Date() + ' ' + message + "\n");
}

function initMap() {
        var greenland = {lat: 71.7069, lng: -42.6043};
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 3,
          center: greenland,
          zoomControl: true,
		  mapTypeControl: false,
		  scaleControl: false,
		  streetViewControl: false,
		  rotateControl: false,
		  fullscreenControl: false

        });
        // var marker = new google.maps.Marker({
        //   position: uluru,
        //   map: map
        // });
      }

function stock(){

	log('Building Stock Chart');

	var svg = d3.select("svg.stock"),
	    margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = +svg.attr("width") - margin.left - margin.right,
	    height = +svg.attr("height") - margin.top - margin.bottom,
	    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var parseTime = d3.timeParse("%d-%b-%y");

	var x = d3.scaleTime()
	    .rangeRound([0, width]);

	var y = d3.scaleLinear()
	    .rangeRound([height, 0]);

	var line = d3.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.close); });

	d3.tsv("assets/data.tsv", function(d) {
	  d.date = parseTime(d.date);
	  d.close = +d.close;
	  return d;
	}, function(error, data) {
	  if (error) throw error;

	  x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain(d3.extent(data, function(d) { return d.close; }));

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
	      .text("Price ($)");

	  g.append("path")
	      .datum(data)
	      .attr("fill", "none")
	      .attr("stroke", "steelblue")
	      .attr("stroke-linejoin", "round")
	      .attr("stroke-linecap", "round")
	      .attr("stroke-width", 1.5)
	      .attr("d", line);
	}); // end tsv load 
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
    

