// (function() {
  const ws = new WebSocket(`ws://${location.hostname}:${location.port}`);

  ws.addEventListener('open', console.log('Connected to Websocket!'));
  ws.addEventListener('message', socketMessage);

  function socketMessage(event) {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'new coinbox':
        if (foodTrucks[data.id] === undefined) {
          console.log(`New coinbox registered with ID: ${data.id}`);

          document.body.insertAdjacentHTML(
            'afterbegin',
            `<div id="coinbox-notification">
            <p>New coinbox registered!</p>
            <button onclick="setCoinbox(${data.id})">Assign Location</button>
            </div>`
          );
        }
      break;
      case 'new customer':
        console.log(`${data.id} had a new customer, total in line: ${data.queue}`);

        foodTrucks[data.id].queue = data.queue;
      break;
      case 'empty coinbox':
        foodTrucks[data.id].queue = 0;
      break;
      default:
        return false;
    }
  }

  //

  const tooltipInit = document.body.insertAdjacentHTML(
    'afterbegin',
    `<div class="tooltip" style="opacity: 0;"></div>`
  );
  const tooltip = document.querySelector('.tooltip');

  const registerFormInit = document.body.insertAdjacentHTML(
    'afterbegin',
    `<div class="register-form" style="opacity: 0;"></div>`
  );
  const registerForm = document.querySelector('.register-form');

  let foodTrucks = null;

  const foodTruckIcon = L.icon({
    iconUrl: 'public/leaflet/images/generator-marker.jpg',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

  let setLocation = {
    state: false,
    box: null
  };

  function setCoinbox(id) {
    const coinboxNotification = document.querySelector('#coinbox-notification');
    coinboxNotification.remove();

    setLocation.state = true;
    setLocation.box = id;
  }

  map.on('click', function(e) {
    if (setLocation.state === true) {
      addMarker(e.latlng.lng, e.latlng.lat, {
        name: 'Not added yet',
        product: 'Not added yet'
      });

      showRegisterForm(e.latlng.lng, e.latlng.lat);
    }
  });

  function drawMap(data) {
    foodTrucks = data;

    Object.keys(foodTrucks).forEach(function(key, index) {
      const foodTruck = foodTrucks[key];
      const xPos = foodTrucks[key].xPos;
      const yPos = foodTrucks[key].yPos;

      addMarker(xPos, yPos, foodTruck);
    })
  }

  function addMarker(xPos, yPos, foodTruck) {
    L.marker(xy(xPos, yPos), { foodTruck })
      .setIcon(foodTruckIcon)
      .addTo(map)
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip)
      .on('click', showDetails)
  }

  function showRegisterForm(xPos, yPos) {
    registerForm.style.opacity = 1;
    registerForm.style.left = (event.clientX + 25) + 'px';
    registerForm.style.top = (event.clientY - 20) + 'px';

    registerForm.innerHTML =
      `<form action="/new-coinbox" method="post">
      <input type="hidden" name="id" value="${setLocation.box}">
        <input type="hidden" name="xPos" value="${xPos}">
        <input type="hidden" name="yPos" value="${yPos}">
        <label>
          Name of Food Truck
          <input type="text" name="name" required>
        </label>
        <label>
          Product to sell
          <input type="text" name="product" required>
        </label>
        <label>
          Average cost of product
          <input type="number" name="avgPrice" required>
        </label>
        <input type="submit">
      </form>`;

      setLocation.state = false;
      setLocation.box = null;
  }

  function showTooltip() {
    const item = this.options.foodTruck;

    tooltip.style.opacity = 1;
    tooltip.style.left = (event.clientX + 10) + 'px';
    tooltip.style.top = (event.clientY - 28) + 'px';

    tooltip.innerHTML =
      `<p>Name: ${item.name}<br>Sells: ${item.product}</p>`;
  }

  function hideTooltip() {
    tooltip.style.opacity = 0;
  }

  function showDetails() {
    console.log(foodTrucks[this.options.foodTruck.id]);
  }
// })()
