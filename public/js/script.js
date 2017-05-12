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
        // Creates a notification
        createNotification(
          'registration',
          'neutral',
          `<p>New coinbox registered!</p>
          <button onclick="setCoinbox(${data.id})">Assign Location</button>`
        );
      }
    break;
    // If a coinbox received the amount of coins equal to the average price of foodtruck
    case 'new customer':
      foodTrucks[data.id].queue = data.queue;

      // Check whether queue is long or short
      switch (data.queueLength) {
        case 'short':
          // Creates a notification
          createNotification(
            'queue-short',
            'positive',
            `<p>The queue for ${foodTrucks[data.id].name} is short, get your snacks!</p>`,
            5000
          );
        break;
        case 'long':
          const discountTruck = getDiscountLocation(foodTrucks);
          let discountTruckProduct;
          let discountTruckPrice;

          if (data.discountLock !== true) {
            // Binds appropriate data to discount foodtruck by looping through participants object
            Object.keys(foodTrucks).forEach(function(key, index) {
              if (foodTrucks[key].name === discountTruck) {
                discountTruckProduct = foodTrucks[key].product;
                discountTruckPrice = foodTrucks[key].avgPrice;
              }
            });

            // [dest: Server] Tells the server that foodtruck has become crowded
            ws.send(
              JSON.stringify({
                type: 'discount',
                crowdedFoodTruck: foodTrucks[data.id].name,
                discountFoodTruck: discountTruck
              })
            );

            // Creates a notification to announce discount
            createNotification(
              'discount',
              'positive',
              `<p>${foodTrucks[data.id].name} is too crowded! Now 2 ${ discountTruckProduct } for ${ discountTruckPrice } coins at ${ getDiscountLocation(foodTrucks) }!</p>`
            );

            // Removes notification after 15 minutes
            setTimeout(() => {
              hideNotification(document.querySelector('.notification[data-type="discount"]'), 0);
            }, 900000);
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

// Analyses which foodtruck deserves more customers based on queue length
function getDiscountLocation(array) {
  let foodTruckNames = [];
  let foodTruckQueues = [];
  let shortestQueueTrucks = [];

  // Pushes queuelength of every foodtruck in arrays
  Object.keys(array).forEach(function(key, index) {
    foodTruckNames.push(array[key].name);
    foodTruckQueues.push(array[key].queue);
  });

  // Gets shortest queuelength
  let getShortestValue = foodTruckQueues.reduce((a, b) => {
    return Math.min(a, b);
  });

  // Gets foodtrucks with shortest queue value
  foodTruckQueues.map((length, index) => {
    if (length === getShortestValue) {
      shortestQueueTrucks.push(foodTruckNames[index]);
    }
  });

  // Returns a random foodtruck with the lowest queuelength
  return shortestQueueTrucks[Math.floor(Math.random() * shortestQueueTrucks.length)];
}

//

// Creates initial DOM-structure for tooltip
document.body.insertAdjacentHTML(
  'afterbegin',
  `<div class="tooltip" style="opacity: 0;"></div>`
);
const tooltip = document.querySelector('.tooltip');

// Creates initial DOM-structure for registry form
document.body.insertAdjacentHTML(
  'afterbegin',
  `<div class="register-form" style="opacity: 0;"></div>`
);
const registerForm = document.querySelector('.register-form');

// Variable that'll receive the foodTrucks from server
let foodTrucks = null;

// Initializes map icon that'll overwrite the default
const foodTruckIcon = L.icon({
  iconUrl: 'public/leaflet/images/foodtruck-icon.png',
  iconSize: [57, 50],
  iconAnchor: [28.5, 25]
});

// Initializes coinbox assignment lock
let setLocation = {
  state: false,
  box: null
};

// Disables coinbox assignment lock and binds ID of new coinbox to setLocation
function setCoinbox(id) {
  // Removes notification
  const notification = document.querySelector('.notification[data-type="registration"]');
  hideNotification(notification, 0);

  // Add pointer-cursor
  document.body.classList.add('assign-coinbox');

  setLocation.state = true;
  setLocation.box = id;
}

// Shows a registry form when user clicked on the festival map
map.on('click', function(e) {
  // Checks whether coinbox assignment lock is active
  if (setLocation.state === true) {
    // Removes pointer-cursor
    document.body.classList.remove('assign-coinbox');

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
  });
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
    `<p><strong>${item.name}</strong>, ${item.queue} ${ checkPlural(item.queue, 'person') } waiting</p>`;
}

// Hides tooltip
function hideTooltip() {
  tooltip.style.opacity = 0;
}

// Shows a modal with contextual data
function showDetails() {
  const item = this.options.foodTruck;

  document.body.insertAdjacentHTML(
    'afterbegin',
    `<section id="modal" class="modal">
      <h2>${item.name}</h2>
      <p>Sells ${item.product} for ${item.avgPrice} ${ checkPlural(item.avgPrice, 'coin') }.</p>
      <section class="queue">
        <span>${item.queue}</span>
        <p>${ checkPlural(item.queue, 'person') } waiting</p>
      </section>
      <span class="close" onclick="hideDetails()">✕</span>
    </section>`
  );
}

// Hides modal
function hideDetails() {
  document.querySelector('#modal').remove();
}

// Creates a notification
function createNotification(type, state, msg, timer) {
  let notification;

  // Creates DOM-structure
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<div class="notification ${ state }" data-type="${ type }">
      ${ msg }
    </div>`
  );

  // Defines notification and adds active class after 50ms
  notification = document.querySelector(`.notification[data-type="${ type }"]`);
  setTimeout(() => {
    notification.classList.add('active');
  }, 50);

  // Removes notification
  if (timer) {
    hideNotification(notification, timer);
  }
}

// Hides and removes notification after n seconds
function hideNotification(notification, timer) {
  setTimeout(() => {
    notification.classList.remove('active');
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, timer);
}

// Returns either singular or plural of a word
function checkPlural(amount, word) {
  if (amount === 1) {
    return word;
  } else {
    switch (word) {
      case 'person':
        return 'people';
      break;
      case 'coin':
        return 'coins';
      break;
    }
  }
}
