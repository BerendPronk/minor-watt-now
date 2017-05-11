// (function() {
  // Initializes websocket to the webaddress this file exists on
  const ws = new WebSocket(`ws://${location.hostname}:${location.port}`);

  // Websocket event handling
  ws.addEventListener('open', console.log('Connected to Websocket!'));
  ws.addEventListener('message', socketMessage);

  // Checks type of message to run different functions
  function socketMessage(event) {
    const data = JSON.parse(event.data);
    let notification;

    switch (data.type) {
      // If a coinbox is activated and successfully connected to same websocket
      case 'new coinbox':
        // Checks if foodtruck already exists on server
        if (foodTrucks[data.id] === undefined) {
          console.log(`New coinbox registered with ID: ${data.id}`);

          // Creates notification
          document.body.insertAdjacentHTML(
            'afterbegin',
            `<div class="notification" data-type="registration">
              <p>New coinbox registered!</p>
              <button onclick="setCoinbox(${data.id})">Assign Location</button>
            </div>`
          );

          // Defines notification and adds active class after 50ms
          notification = document.querySelector('.notification[data-type="registration"]');
          setTimeout(() => {
            notification.classList.add('active');
          }, 50);
        }
      break;
      // If a coinbox received the amount of coins equal to the average price of foodtruck
      case 'new customer':
        console.log(`${data.id} had a new customer, total in line: ${data.queue}`);
        foodTrucks[data.id].queue = data.queue;

        // Check whether queue is long or short
        switch (data.queueLength) {
          case 'short':
          // Creates notification
            document.body.insertAdjacentHTML(
              'afterbegin',
              `<div class="notification positive" data-type="queue-short">
                <p>The queue for ${foodTrucks[data.id].name} is short, get your snacks!</p>
              </div>`
            );

            // Defines notification and shows it
            notification = document.querySelector('.notification[data-type="queue-short"]');

            // Shows, hides and removes notification
            setTimeout(() => {
              notification.classList.add('active');
            }, 50);
            hideNotification(notification, 5000);
          break;
          case 'long':
            // Creates notification
            document.body.insertAdjacentHTML(
              'afterbegin',
              `<div class="notification negative" data-type="queue-long">
                <p>The queue for ${foodTrucks[data.id].name} is ${data.queueLength}.</p>
              </div>`
            );

            // Defines notification and shows it
            notification = document.querySelector('.notification[data-type="queue-long"]');

            // Shows, hides and removes notification
            setTimeout(() => {
              notification.classList.add('active');
            }, 50);
            hideNotification(notification, 5000);

            // Analyses which foodtruck deserves more customers based on queue length
            function getDiscountLocation() {
              console.log(foodTrucks)
            }
          break;
        }
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
    const notification = document.querySelector('.notification[data-type="registration"]');
    hideNotification(notification, 0);

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
      .on('click', showDetails);
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

  // Hides modal
  function hideDetails() {
    // modal hiding
  }

  // Hides and removes notification after n seconds
  function hideNotification(notification, timer) {
    setTimeout(() => {
      notification.classList.remove('active');
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.remove()
      }, 500);
    }, timer);
  }
// })()
