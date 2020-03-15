jQuery.noConflict();

$('#exampleModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) // Button that triggered the modal
  var recipient = button.data('whatever') // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this)
  modal.find('.modal-title').text('Enter your ' + recipient + ' address')
  modal.find('.modal-body input').val(recipient)
});
//popover
$(document).ready(function(){
  $('[data-toggle="popover"]').popover();   
});

var x = document.getElementById("demo");
$("#load").click(getLocation);
function getLocation() {
  if (navigator.geolocation) {
    $("#load").html("Detecting");
    $("#load").append("&nbsp;<i class='fa fa-circle-o-notch fa-spin'>");
    navigator.geolocation.getCurrentPosition(showPosition,error);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}
function error(){
  $("#load").html("Click here");
  $("#load").remove("i");
}
function showPosition(position) {
  
    document.getElementById('map').innerHTML = "<div id='mapDiv' style=' height: 400px'></div>";//this div is where map will be created. Since error that map container is already initialised we create a div and place the mapDiv in it
    map = L.map('mapDiv').setView([position.coords.latitude, position.coords.longitude], 13);
    // set map tiles source
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
    // add marker to the map
    marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);
    // add popup to the marker
    marker.bindPopup("<b>Your Location</b>").openPopup();

  x.innerHTML = "Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude;
    $("[name='latitude']").attr("value",position.coords.latitude);
    $("[name='longitude']").attr("value",position.coords.longitude);
    

  $("#load").html("Click here");
  $("#load").remove("i");
}
