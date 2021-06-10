var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var { formatArguments } = require('../helperFunctions');
var streamingCameras = {};

router.get('/start/:nodeName/:nodeIP', async (req, res) => {
  var nodeName = req.params.nodeName;
  var nodeIP = req.params.nodeIP;

  streamingCameras[nodeName] = {};
  streamingCameras[nodeName]['camera1'] = null;
  streamingCameras[nodeName]['camera2'] = null;
  streamingCameras[nodeName]['camera3'] = null;

  streamingCameras[nodeName].camera1 = spawn(
    'ffmpeg',
    formatArguments(`
      -re
      -rtsp_transport tcp
      -i rtsp://admin:UUnv9njxg123@${nodeIP}:554/cam/realmonitor?channel=1&subtype=1
      -codec copy 
      -f flv 
      rtmp://10.10.200.10/streams/${nodeName}-camera1
    `)
  );

  streamingCameras[nodeName].camera1.stdout.on('data', (data) => {});
  streamingCameras[nodeName].camera1.stderr.on('data', (data) => {});

  streamingCameras[nodeName].camera2 = spawn(
    'ffmpeg',
    formatArguments(`
      -re
      -rtsp_transport tcp
      -i rtsp://admin:UUnv9njxg123@${nodeIP}:555/cam/realmonitor?channel=1&subtype=1
      -codec copy 
      -f flv 
      rtmp://10.10.200.10/streams/${nodeName}-camera2
    `)
  );

  streamingCameras[nodeName].camera2.stdout.on('data', (data) => {});
  streamingCameras[nodeName].camera2.stderr.on('data', (data) => {});

  streamingCameras[nodeName].camera3 = spawn(
    'ffmpeg',
    formatArguments(`
      -re
      -rtsp_transport tcp
      -i rtsp://admin:UUnv9njxg123@${nodeIP}:556/cam/realmonitor?channel=1&subtype=1
      -codec copy 
      -f flv 
      rtmp://10.10.200.10/streams/${nodeName}-camera3
    `)
  );

  streamingCameras[nodeName].camera3.stdout.on('data', (data) => {});
  streamingCameras[nodeName].camera3.stderr.on('data', (data) => {});

  res.send('ok');
});

router.get('/stop/:nodeName', async (req, res) => {
  var nodeName = req.params.nodeName;
  streamingCameras[nodeName]['camera1'].stdin.write('q');
  streamingCameras[nodeName]['camera2'].stdin.write('q');
  streamingCameras[nodeName]['camera3'].stdin.write('q');
  res.send('ok');
});

module.exports = router;
