// (function() {
  // Initializes websocket to the webaddress this file exists on
  const ws = new WebSocket(`ws://${location.hostname}:${location.port}`);

  // Websocket event handling
  ws.addEventListener('open', console.log('Connected to Websocket!'));
  ws.addEventListener('message', socketMessage);

  // Checks type of message to run different functions
  function socketMessage(event) {
    const data = JSON.parse(event.data);

    switch (data.type) {
      // If a coinbox is activated and successfully connected to same websocket
      case 'new coinbox':
        // Checks if foodtruck already exists on server
        if (foodTrucks[data.id] === undefined) {
          console.log(`New coinbox registered with ID: ${data.id}`);

          // Shows notification
          document.body.insertAdjacentHTML(
            'afterbegin',
            `<div id="coinbox-notification">
            <p>New coinbox registered!</p>
            <button onclick="setCoinbox(${data.id})">Assign Location</button>
            </div>`
          );
        }
      break;
      // If a coinbox received the amount of coins equal to the average price of foodtruck
      case 'new customer':
        console.log(`${data.id} had a new customer, total in line: ${data.queue}`);
        foodTrucks[data.id].queue = data.queue;
      break;
      // If the money tray of the coinbox is disposed by a button press (when there is no one in line)
      case 'empty coinbox':
        foodTrucks[data.id].queue = 0;
      break;
      default:
        return false;
    }
  }

  //

  // Creates initial DOM-structure for tooltip
  const tooltipInit = document.body.insertAdjacentHTML(
    'afterbegin',
    `<div class="tooltip" style="opacity: 0;"></div>`
  );
  const tooltip = document.querySelector('.tooltip');

  // Creates initial DOM-structure for registry form
  const registerFormInit = document.body.insertAdjacentHTML(
    'afterbegin',
    `<div class="register-form" style="opacity: 0;"></div>`
  );
  const registerForm = document.querySelector('.register-form');

  // Variable that'll receive the foodTrucks from server
  let foodTrucks = null;

  // Initializes map icon that'll overwrite the default
  const foodTruckIcon = L.icon({
    iconUrl: 'public/leaflet/images/generator-marker.jpg',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

  // Initializes coinbox assignment lock
  let setLocation = {
    state: false,
    box: null
  };

  // Disables coinbox assignment lock and binds ID of new coinbox to setLocation
  function setCoinbox(id) {
    const coinboxNotification = document.querySelector('#coinbox-notification');
    coinboxNotification.remove();

    setLocation.state = true;
    setLocation.box = id;
  }

  // Shows a registry form when user clicked on the festival map
  map.on('click', function(e) {
    // Checks whether coinbox assignment lock is active
    if (setLocation.state === true) {
      addMarker(e.latlng.lng, e.latlng.lat, {
        name: 'Not added yet',
        product: 'Not added yet'
      });

      showRegisterForm(e.latlng.lng, e.latlng.lat);
    }
  });

  // Draws map with incoming data
  function drawMap(data) {
    // Assigns data from server to client's foodTrucks variable
    foodTrucks = data;

    // Adds a marker for every foodtruck
    Object.keys(foodTrucks).forEach(function(key, index) {
      const foodTruck = foodTrucks[key];
      const xPos = foodTrucks[key].xPos;
      const yPos = foodTrucks[key].yPos;

      addMarker(xPos, yPos, foodTruck);
    })
  }

  // Binds a marker to the festival map with Leaflet
  function addMarker(xPos, yPos, foodTruck) {
    L.marker(xy(xPos, yPos), { foodTruck })
      .setIcon(foodTruckIcon)
      .addTo(map)
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip)
      .on('click', showDetails)
  }

  // Shows the registry form and assigns DOM-structure to element
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

      // Reset coinbox assignment lock
      setLocation.state = false;
      setLocation.box = null;
  }

  // Shows tooltip and fills it with contextual data
  function showTooltip() {
    const item = this.options.foodTruck;

    tooltip.style.opacity = 1;
    tooltip.style.left = (event.clientX + 10) + 'px';
    tooltip.style.top = (event.clientY - 28) + 'px';

    tooltip.innerHTML =
      `<p>Name: ${item.name}<br>Sells: ${item.product}</p>`;
  }

  // Hides tooltip
  function hideTooltip() {
    tooltip.style.opacity = 0;
  }

  // Shows a modal with contextual data
  function showDetails() {
    console.log(foodTrucks[this.options.foodTruck.id]);
  }
// })()
