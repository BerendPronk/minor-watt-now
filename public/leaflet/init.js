var map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: .475,
  maxZoom: 3
});

map.on('click', function(e) {
  console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
});

var yx = L.latLng;

var xy = function(x, y) {
  if (L.Util.isArray(x)) {
    return yx(x[1], x[0]);
  }
  return yx(y, x);
};

var bounds = [[0,0], [600,900]];
var image = L.imageOverlay('public/data/austrailia-blank.jpg', bounds).addTo(map);

map.fitBounds(bounds);

map.setView(new L.LatLng(300.5, 428.5), .25);
