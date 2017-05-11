const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: .475,
  maxZoom: 3
});

const yx = L.latLng;

function xy(x, y) {
  if (L.Util.isArray(x)) {
    return yx(x[1], x[0]);
  }
  return yx(y, x);
};

const bounds = [[0,0], [648,1125]];
const image = L.imageOverlay('public/data/festival-poster_large.jpg', bounds).addTo(map);

map.fitBounds(bounds);

// map.setView(new L.LatLng(300.5, 428.5), .25);
