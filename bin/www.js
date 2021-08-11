/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('CrimeCameraServer:server');
var http = require('http');
var nodeMediaServer = require('node-media-server');
var fetch = require('node-fetch');
var streamMons = require('../models/streamMons.js');
var { formatArguments, tryValue, cleanupVideos, mountNodes } = require('../helperFunctions');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

setInterval(() => {
  cleanupVideos();
}, 900000);

cleanupVideos();

setInterval(() => {
  mountNodes();
}, 900000);

mountNodes();

let tasks = [];

function retreiveNodesList() {
  fetch('http://localhost:3000/api/nodes')
    .then((response) => response.json())
    .then((json) => {
      json.map((node) => {
        tasks.push({
          app: node.name,
          mode: 'pull',
          edge: 'rtmp://' + node.config.ip,
        });
      });
    });
}

const config = {
  rtmp: {
    port: 1936,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: '*',
  },

  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: tasks,
  },
};

var nms = new nodeMediaServer(config);
setTimeout(() => {
  retreiveNodesList();
  setTimeout(() => {
    nms.run();
  }, 6000);
}, 4000);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
