const express = require('express');
const app = express();
const OSC = require('node-osc');
const port = 5500;
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.json());
app.use(express.static('public'));
app.use('/', express.static(__dirname + '/public'));

// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`);
// });

http.listen(port, () => console.log(`Listening on port ${port}`));

// ------------------- OSC --------------------------

// Create a new OSC client to send messages
// Specify the server's IP address and the port number
const oscClient = new OSC.Client('127.0.0.1', 7000);

// OSC server (to receive messages)
const oscServer = new OSC.Server(7001, '127.0.0.1'); 


// Endpoint to receive phidgetNumber from the client
app.post('/send-phidget-number', (req, res) => {
  const { hubPort, phidgetNumber } = req.body;
  if (phidgetNumber === undefined) {
      return res.status(400).send('Phidget number is required');
  }

  // Send phidgetNumber via OSC
  // console.log("==========", hubPort, phidgetNumber);
  const message = new OSC.Message('/phidgetNumber', phidgetNumber, '/hubPort', hubPort);
  oscClient.send(message, (error) => {
      if (error) {
          console.error('Error sending OSC message:', error);
          return res.status(500).send('Failed to send OSC message');
      }
      res.send('OSC message sent successfully');
  });
});

io.on('connection', (socket) => {
  console.log("io connected");
});

// Handling incoming OSC messages
oscServer.on('message', function (msg, rinfo) {
  console.log(`Message received: ${msg}`);
  io.emit('end_game');
});