const express = require('express');
const path = require('path');
const httpServer = require('http').Server;

const app = express();
const server = httpServer(app);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 3000, () => {
	console.log('Lift-off!');
});
