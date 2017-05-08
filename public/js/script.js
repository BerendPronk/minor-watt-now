const info = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

d3.csv('public/data/generator-data.csv', clean, draw);

function clean(d) {

  return {
    ID: d['ID'],
    type: d['Type'],
    xPos: d['x-position'],
    yPos: d['y-position']
  }
}

function draw(err, data) {
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

  console.log(item.ID, item.type)

  info.transition()
    .duration(200)
    .style('opacity', 1)
    .style('visibility', 'visible');
  info.html(`<p>ID: ${item.ID},<br>Type: ${item.type}</p>`)
    .style("top", (event.clientY - 28) + "px")
    .style("left", (event.clientX + 10) + "px");

}

function hideTooltip() {
  info.transition()
    .duration(200)
    .style('opacity', 0);
}
