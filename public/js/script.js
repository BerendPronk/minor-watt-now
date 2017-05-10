// (function() {
  const ws = new WebSocket(`ws://${location.hostname}:${location.port}`);
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  ws.addEventListener('open', console.log('Connected to Websocket!'));
  ws.addEventListener('message', socketMessage);

  function socketMessage(event) {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'new coinbox':
        console.log(`New coinbox registered with ID: ${data.id}`);
      break;
      case 'coinbox customer':
        console.log(`${data.id} had a new customer, total: ${data.coins}`)
      break;
      default:
        return false;
    }
  }

  // D3

  map.on('click', function(e) {
    console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)


  });

  function drawMap(data) {
    const foodTrucks = JSON.parse(data);
    const generatorIcon = L.icon({
      iconUrl: 'public/leaflet/images/generator-marker.jpg',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    console.log(foodTrucks)

    Object.keys(foodTrucks).forEach(function(key, index) {
      const foodTruck = foodTrucks[key];
      const xPos = foodTrucks[key].xPos;
      const yPos = foodTrucks[key].yPos;

      L.marker(xy(xPos,yPos), {foodTruck})
        .setIcon(generatorIcon)
        .addTo(map)
        .on('mouseover', showTooltip)
        .on('mouseout', hideTooltip)
    })
  }

  function showTooltip() {
    const item = this.options.d;

    tooltip.transition()
      .duration(200)
      .style('opacity', 1)
      .style('visibility', 'visible');
    tooltip.html(`<p>ID: ${item.ID},<br>Type: ${item.type}</p>`)
      .style("top", (event.clientY - 28) + "px")
      .style("left", (event.clientX + 10) + "px");

  }

  function hideTooltip() {
    tooltip.transition()
      .duration(200)
      .style('opacity', 0);
  }
// })()
