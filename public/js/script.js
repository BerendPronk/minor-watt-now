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

  // d3.csv('public/data/generator-data.csv', clean, draw);

  drawMap(clean(participants));

  function clean(data) {
    return {
      ID: data['ID'],
      type: data['Type'],
      xPos: data['x-position'],
      yPos: data['y-position']
    }
  }

  function drawMap(err, data) {
    if (err) throw err;

    const generatorIcon = L.icon({
      iconUrl: 'public/leaflet/images/generator-marker.jpg',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    data.map(d => {
      L.marker(xy(d.xPos,d.yPos), {d})
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
