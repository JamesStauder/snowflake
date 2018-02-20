$(function () {
  	$('[data-toggle="tooltip"]').tooltip();

  	// With JQuery
	// $('#ex1').slider({
	// 	formatter: function(value) {
	// 		return 'Current value: ' + value;
	// 	}
	// });

	// $("#ex6").on("slide", function(slideEvt) {
	// 	$("#ex6SliderVal").text(slideEvt.value);
	// });


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