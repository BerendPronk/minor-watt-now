const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const httpServer = require('http').Server;
const WebSocket = require('ws');

const app = express();
const server = httpServer(app);
const wsServer = new WebSocket.Server({ server });

const participants = require(__dirname + '/public/data/participants');
const foodTrucks = participants.data;

app
	.use('/public', express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }))
	.set('view engine', 'ejs')
	.set('views', path.join(__dirname, 'views'))
	.get('/', (req, res) => {
		res.render('index', {
			foodTrucks: JSON.stringify(foodTrucks)
		});
	})
	.post('/new-coinbox', (req, res) => {
		foodTrucks[req.body.id] = {
			name: req.body.name,
			product: req.body.product,
			avgPrice:  req.body.avgPrice,
			xPos: req.body.xPos,
			yPos: req.body.xPos,
			waiting: 0
		}

		res.render('index', {
			foodTrucks: JSON.stringify(foodTrucks)
		});
	});

wsServer.broadcast = data => {
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

wsServer.on('connection', socketConnection);

function socketConnection(socket) {
	socket.on('message', socketMessage);

	function socketMessage(message) {
		try {
			message = JSON.parse(message);
		} catch (err) {
			console.log(`No message found in ${message}`);
		}

		return processMessage(socket, message);
	}
}

function processMessage(socket, message) {
	switch (message.type) {
		case 'participate':
			console.log(`${message.id} is joining the festival!`);
			wsServer.broadcast(
				JSON.stringify({
					id: message.id,
					type: 'new coinbox'
				})
			);
		break;
		case 'customer':
			console.log(`${message.id} just received a customer!`);
			wsServer.broadcast(
				JSON.stringify({
					id: message.id,
					type: 'coinbox customer',
					coins: message.coins
				})
			);
		break;
		default:
			return false;
	}
}

server.listen(process.env.PORT || 3000, () => {
	console.log('Lift-off!');
});
