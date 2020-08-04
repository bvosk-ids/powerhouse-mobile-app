var geocoder = null;
var map = null;
function initialize() {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var mapOptions = {
        zoom: 17,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById('location-map'), mapOptions);
}

function codeAddress(address) {
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                title:"Work Order Location"
            });

        } else {
            if ( status == google.maps.GeocoderStatus.ZERO_RESULTS ) {
                alert("The map could not be displayed because the location address could not be found.");
            } else {
                alert("The map had a problem displaying this location: " + status);
            }
        }
    });
}



//var center;
//var currentLocation;
//var marker;
//var bounds=new google.maps.LatLngBounds;
//var map;
//
//function showMap(e,t,n) {
//    setTimeout(function(){
//            var r = {zoom:20,maxZoom:21,minZoom:0,mapTypeId:google.maps.MapTypeId.ROADMAP,zoomControl:true,streetViewControl:true};
//
//            map = new google.maps.Map(document.getElementById(e),r);
//            currentLocation = new google.maps.LatLng(t,n);
//
//            marker =new google.maps.Marker({map:map,position:currentLocation,title:"Work Order Location"});
//
//            map.setZoom(0);google.maps.event.trigger(map,"resize");
//
//            bounds= new google.maps.LatLngBounds;
//
//            bounds.extend(currentLocation);
//
//            map.fitBounds(bounds);
//            map.fitBounds(bounds);
//
//            map.setCenter(currentLocation)
//        },1e3);
//};