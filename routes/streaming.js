const Express = require('express');
const Router = Express.Router();
const { requiresAuth } = require('express-openid-connect');

var streamingCamerasOBJ = {};
  function formatArguments(template) {
    return template
      .replace(/\s+/g, ' ')
      .replace(/\s/g, '\n')
      .split('\n')
      .filter((arg) => (arg != '' ? true : false));
  }
 var spawn = require('child_process').spawn;
Router.get('/stopStreaming/:camera', async (req, res) => {
  var node = req.params.camera;
 
    streamingCamerasOBJ[node]['cam1'].stdin.write('q');
    streamingCamerasOBJ[node]['cam2'].stdin.write('q');
    streamingCamerasOBJ[node]['cam3'].stdin.write('q');
    streamingCamerasOBJ[node]['cam4'].stdin.write('q');
    // console.log(cameraName);
    //streamingSocket.emit('stopStreaming', d);
       res.send('ok');
});
Router.get('/startStreaming/:cameraName/:cameraIP', async (req, res) => {
var cameraName = req.params.cameraName;
var cameraIP = req.params.cameraIP;
    streamingCamerasOBJ[cameraName] = {};
    streamingCamerasOBJ[cameraName]['cam1'] = null;
    streamingCamerasOBJ[cameraName]['cam2'] = null;
    streamingCamerasOBJ[cameraName]['cam3'] = null;
    streamingCamerasOBJ[cameraName]['cam4'] = null;
    streamingCamerasOBJ[cameraName].cam1 = spawn(
      'ffmpeg',
      formatArguments(`
        -rtsp_transport 
        tcp 
        -i 
        rtsp://admin:UUnv9njxg123@${cameraIP}:554/cam/realmonitor?channel=1&subtype=1
        -vcodec 
        copy 
        -f 
        flv 
        rtmp://192.168.196.150/${cameraName}/camera1
      `)
    );

    streamingCamerasOBJ[cameraName].cam2 = spawn(
      'ffmpeg',
      formatArguments(`
       -rtsp_transport 
       tcp 
       -i 
       rtsp://admin:UUnv9njxg123@${cameraIP}:555/cam/realmonitor?channel=1&subtype=1
       -vcodec 
       copy 
       -f 
       flv 
       rtmp://192.168.196.150/${cameraName}/camera2
      `)
    );

    streamingCamerasOBJ[cameraName].cam3 = spawn(
      'ffmpeg',
      formatArguments(`
        -rtsp_transport 
        tcp 
        -i 
        rtsp://admin:UUnv9njxg123@${cameraIP}:556/cam/realmonitor?channel=1&subtype=1 
        -vcodec 
        copy 
        -f 
        flv 
        rtmp://192.168.196.150/${cameraName}/camera3
      `)
    );
        streamingCamerasOBJ[cameraName].cam4 = spawn(
      'ffmpeg',
      formatArguments(`
        -rtsp_transport 
        tcp 
        -i 
        rtsp://admin:UUnv9njxg123@${cameraIP}:557/cam/realmonitor?channel=1&subtype=1 
        -vcodec 
        copy 
        -f 
        flv 
        rtmp://192.168.196.150/${cameraName}/camera4
      `)
    );

      res.send('ok');
});


module.exports = Router;
