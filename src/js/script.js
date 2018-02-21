$(function () {
  	$('[data-toggle="tooltip"]').tooltip();
  	$('[data-toggle="popover"]').popover();


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
			$('#'+this.name.replace('slider','value')).val(slideEvt.value+$('#'+this.name.replace('slider','value')).data('unit-symbol'))	
		}
		
	});

})

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


var svg = d3.select("svg"),
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
});      