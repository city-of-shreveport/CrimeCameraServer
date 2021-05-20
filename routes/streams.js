const Express = require('express');
const Router = Express.Router();
const dedent = require('dedent-js');
const spawn = require('child_process').spawn;
const { formatArguments } = require('../helperFunctions');
const { isAuthorized, unauthrizedMessage } = require('../helperFunctions');

var streamingCamerasOBJ = {};

Router.get('/stopStreaming/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    streamingCamerasOBJ[req.params.nodeName]['cam1'].stdin.write('q');
    streamingCamerasOBJ[req.params.nodeName]['cam2'].stdin.write('q');
    streamingCamerasOBJ[req.params.nodeName]['cam3'].stdin.write('q');
    res.send('ok');
  } else {
    res.json(unauthrizedMessage());
  }
});

Router.get('/startStreaming/:nodeName/:cameraIP', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    var nodeName = req.params.nodeName;
    var cameraIP = req.params.cameraIP;

    streamingCamerasOBJ[nodeName] = {};
    streamingCamerasOBJ[nodeName]['cam1'] = null;
    streamingCamerasOBJ[nodeName]['cam2'] = null;
    streamingCamerasOBJ[nodeName]['cam3'] = null;

    streamingCamerasOBJ[nodeName].cam1 = spawn(
      'ffmpeg',
      dedent`
      -rtsp_transport 
      tcp 
      -i 
      rtsp://admin:UUnv9njxg@${cameraIP}:554/cam/realmonitor?channel=1&subtype=1
      -vcodec 
      copy 
      -f 
      flv 
      rtmp://10.10.10.53/${nodeName}/camera1
    `
    );

    streamingCamerasOBJ[nodeName].cam2 = spawn(
      'ffmpeg',
      dedent`
      -rtsp_transport 
      tcp 
      -i 
      rtsp://admin:UUnv9njxg@${cameraIP}:555/cam/realmonitor?channel=1&subtype=1
      -vcodec 
      copy 
      -f 
      flv 
      rtmp://10.10.10.53/${nodeName}/camera2
    `
    );

    streamingCamerasOBJ[nodeName].cam3 = spawn(
      'ffmpeg',
      dedent`
      -rtsp_transport 
      tcp 
      -i 
      rtsp://admin:UUnv9njxg@${cameraIP}:556/cam/realmonitor?channel=1&subtype=1 
      -vcodec 
      copy 
      -f 
      flv 
      rtmp://10.10.10.53/${nodeName}/camera3
    `
    );

    res.send('ok');
  } else {
    res.json(unauthrizedMessage());
  }
});

module.exports = Router;
