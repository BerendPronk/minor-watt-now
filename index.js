const express = require('express');
const path = require('path');
const httpServer = require('http').Server;
const WebSocket = require('ws');

const app = express();
const server = httpServer(app);
const wsServer = new WebSocket.Server({ server });

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
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
