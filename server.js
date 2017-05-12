// Defines used packages
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const httpServer = require('http').Server;
const WebSocket = require('ws');

// Defines server variables
const app = express();
const server = httpServer(app);
const wsServer = new WebSocket.Server({ server });

// Foodtruck (dummy) data, which will be filled with other participants later on
const participants = require(__dirname + '/public/data/participants');
const foodTrucks = participants.data;

// Lock to keep track of one single discount at the time
let discountLock = false;

// Declares which server functionalities the app must use
app
	.use('/public', express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }));

// Sets EJS view engine
app
	.set('view engine', 'ejs')
	.set('views', path.join(__dirname, 'views'));

// Declares app routing
app
	.get('/', (req, res) => {
		// Renders index template with foodtruck data
		res.render('index', {
			foodTrucks: JSON.stringify(foodTrucks)
		});
	})
	.post('/new-coinbox', (req, res) => {
		// Adds a new foodtruck if registry form was sent from client
		foodTrucks[req.body.id] = {
			id: req.body.id,
			name: req.body.name,
			product: req.body.product,
			avgPrice:  Number(req.body.avgPrice),
			xPos: Number(req.body.xPos),
			yPos: Number(req.body.yPos),
			queue: 0
		}

		// [dest: NodeMCU] Finishes initialization of coinbox and starts the sensors
		wsServer.broadcast(
			JSON.stringify({
				id: req.body.id,
				type: 'assigned coinbox',
				avgPrice: req.body.avgPrice
			})
		);

		// Renders index with newly added foodtruck
		res.render('index', {
			foodTrucks: JSON.stringify(foodTrucks)
		});
	});

// Declares broadcast function, to send to all devices connected to the socket
wsServer.broadcast = data => {
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Initializes socket events if connection is successful
wsServer.on('connection', (socket) => {
	// Binds event to socket to listen for messages
	socket.on('message', (message) => {
		// Parses incoming message
		try {
			message = JSON.parse(message);
		} catch (err) {
			console.log(`No message found in ${message}`);
		}

		// Processes socket message input
		return processMessage(socket, message);
	});
});

// Checks type of message to run different functions
function processMessage(socket, message) {
	switch (message.type) {
		// If a new coinbox is activated and connected to the websocket
		case 'participate':
			console.log(`${message.id} is joining the festival!`);

			// [dest: Client] Shows pop-up to assign coinbox to location
			wsServer.broadcast(
				JSON.stringify({
					id: message.id,
					type: 'new coinbox'
				})
			);
		break;
		// If a coinbox received the amount of coins equal to the average price of foodtruck
		case 'customer':
			console.log(`${message.id} just received a customer!, ${message.queue}`);
			foodTrucks[message.id].queue = message.queue;

			const queue = foodTrucks[message.id].queue;
			let queueLength;

			// Guesses wait time based on queue length
			if (queue >= 10) {
				queueLength = 'long';
			} else if (queue >= 5 && queue < 10) {
				queueLength = 'medium';
			} else {
				queueLength = 'short';
			}

			// [dest: Client] Adds a crowd-value to specific coinbox
			wsServer.broadcast(
				JSON.stringify({
					id: message.id,
					type: 'new customer',
					queue: message.queue,
					queueLength: queueLength,
					discountLock: discountLock
				})
			);
		break;
		// If the money tray of the coinbox is disposed by a button press
		case 'empty coinbox':
			console.log(`${message.id} cleared their money tray!`);
			foodTrucks[message.id].queue = 0;

			// [dest: Client] Adds a crowd-value to specific coinbox
			wsServer.broadcast(
				JSON.stringify({
					id: message.id,
					type: 'empty coinbox'
				})
			);
		break;
		// If a foodtruck becomes too crowded
		case 'discount':
			console.log(`${message.crowdedFoodTruck} is too crowded! So ${message.discountFoodTruck} has a discount!`);

			// Applies lock on discount to prevent multiple notifications
			discountLock = true;

			// Disables lock after 15 minutes
			setTimeout(() => {
				discountLock = false;
			}, 10000);
		break;
		default:
			return false;
	}
}

// Run the application
server.listen(process.env.PORT || 3000, () => {
	console.log('Lift-off!');
});
