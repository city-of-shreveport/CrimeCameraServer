var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};
socketApi.io = io;
var moment = require('moment');
var cameraNodes = io.of('/cameras');
const vids = require('./models/videos');
const cams = require('./models/cameras');
const perfmons = require('./models/perfmons');
const mongoose = require('mongoose');
const { Console } = require('console');

var spawn = require('child_process').spawn,
  streamingChildProc = null,
  streamingChildProc2 = null,
  streamingChildProc3 = null;

var videoswithData = [];

function checkLastCheckIn() {
  var time = moment.duration('00:15:00');
  var date = moment();
  var newDateTime = date.subtract(time);
  var olderThanDate = moment(newDateTime).toISOString();

  cams.find(
    {
      lastCheckIn: {
        $lte: olderThanDate,
      },
    },
    function (err, docs) {
      if (err) {
      } else {
      }
    }
  );

  cams.find(
    {
      lastCheckIn: {
        $gte: olderThanDate,
      },
    },
    function (err, docs) {
      if (err) {
      } else {
      }
    }
  );
}

cameraNodes.on('connection', (socket) => {
  socket.on('Cameraaction', function (action) {
    socket.broadcast.emit('Cameraaction', action);
    console.log('CameraAction');
  });

  socket.on('videoFilesCam1', function (data1) {
    var fileNmaeURL;
    var fileLocationDB = '/home/pi/CrimeCamera/public/videos/cam1/' + data1;

    vids.exists(
      {
        fileLocation: fileLocationDB,
      },
      function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          if (doc == false) {
            socket.emit('getVideoInfoCam1', data1);
          }
        }
      }
    );
  });

  socket.on('videoFilesCam2', function (data2) {
    var fileNmaeURL;
    var fileLocationDB = '/home/pi/CrimeCamera/public/videos/cam2/' + data2;

    try {
      vids.exists(
        {
          fileLocation: fileLocationDB,
        },
        function (err, doc) {
          if (err) {
          } else {
            if (doc == false) {
              socket.emit('getVideoInfoCam2', data2);
            }
          }
        }
      );
    } catch (error) {}
  });

  socket.on('videoFilesCam3', function (data3) {
    var fileNmaeURL;
    var fileLocationDB = '/home/pi/CrimeCamera/public/videos/cam3/' + data3;

    try {
      vids.exists(
        {
          fileLocation: fileLocationDB,
        },
        function (err, doc) {
          if (err) {
          } else {
            if (doc == false) {
              socket.emit('getVideoInfoCam3', data3);
            }
          }
        }
      );
    } catch (error) {}
  });

  socket.on('perfmonStats', function (data) {
    const perf = new perfmons(data);
    perf.save();
  });

  socket.on('systemOnline', function (data) {
    var dateNOW = moment().toISOString();

    cams.exists(
      {
        nodeName: data.name,
      },
      function (err, doc) {
        if (err) {
        } else {
          if (doc == false) {
            const cam = new cams({
              nodeName: data.name,
              id: data.id,
              location: {
                lat: data.location.lat,
                lng: data.location.lng,
              },
              ip: data.ip,
              numOfCams: data.numOfCams,
              systemType: data.typs,
              lastCheckIn: dateNOW,
              sysInfo: data.sysInfo,
            });
            cam.save();
          }

          if (doc == true) {
            cams.findOneAndUpdate(
              {
                nodeName: data.name,
              },
              {
                lastCheckIn: dateNOW,
              },
              null,
              function (err, docs) {
                if (err) {
                } else {
                }
              }
            );
          }
        }
      }
    );

    socket.emit('getVideos');
  });

  function stopStreaming() {
    streamingChildProc.kill('SIGINT');
    streamingChildProc2.kill('SIGINT');
    streamingChildProc3.kill('SIGINT');
  }

  socket.on('stopStreaming', function (d) {
    stopStreaming();
  });

  function formatArguments(template) {
    return template
      .replace(/\s+/g, ' ')
      .replace(/\s/g, '\n')
      .split('\n')
      .filter((arg) => (arg != '' ? true : false));
  }

  function startStreaming() {
    //GET IP FOR ACTIVE CAMERA  activeCamera

    streamingChildProc = spawn(
      'ffmpeg',
      formatArguments(`
        -hide_banner
        -loglevel error
        -fflags nobuffer
        -rtsp_transport tcp
        -i rtsp://admin:UUnv9njxg123@activeCamera:554/cam/realmonitor?channel=1&subtype=1
        -vsync 0
        -copyts
        -vcodec copy
        -movflags frag_keyframe+empty_moov
        -an
        -hls_flags delete_segments+append_list
        -f segment
        -segment_list_flags live
        -segment_time 1
        -segment_list_size 10
        -segment_format mpegts
        -segment_list /home/admin/crimeCameraBackend/public/liveStream/cam1/index.m3u8
        -segment_list_type m3u8
        -segment_list_entry_prefix /liveStream/cam1/
        -segment_wrap 10 /home/admin/crimeCameraBackend/public/liveStream/cam1/%d.ts
      `)
    );

    streamingChildProc2 = spawn(
      'ffmpeg',
      formatArguments(`
        -hide_banner
        -loglevel error
        -fflags nobuffer
        -rtsp_transport tcp
        -i rtsp://admin:UUnv9njxg123@${activeCamera}:555/cam/realmonitor?channel=1&subtype=1
        -vsync 0
        -copyts
        -vcodec copy
        -movflags frag_keyframe+empty_moov
        -an
        -hls_flags delete_segments+append_list
        -f segment
        -segment_list_flags live
        -segment_time 1
        -segment_list_size 10
        -segment_format mpegts
        -segment_list /home/admin/crimeCameraBackend/public/liveStream/cam2/index.m3u8
        -segment_list_type m3u8
        -segment_list_entry_prefix /liveStream/cam2/
        -segment_wrap 10 /home/admin/crimeCameraBackend/public/liveStream/cam2/%d.ts
      `)
    );

    streamingChildProc3 = spawn(
      'ffmpeg',
      formatArguments(`
        -hide_banner
        -loglevel error
        -fflags nobuffer
        -rtsp_transport tcp 
        -i rtsp://admin:UUnv9njxg123@${activeCamera}:556/cam/realmonitor?channel=1&subtype=1
        -vsync 0
        -copyts
        -vcodec copy
        -movflags frag_keyframe+empty_moov
        -an
        -hls_flags delete_segments+append_list
        -f segment
        -segment_list_flags live
        -segment_time 1
        -segment_list_size 10
        -segment_format mpegts
        -segment_list /home/admin/crimeCameraBackend/public/liveStream/cam3/index.m3u8
        -segment_list_type m3u8
        -segment_list_entry_prefix /liveStream/cam3/
        -segment_wrap 10 /home/admin/crimeCameraBackend/public/liveStream/cam3/%d.ts
      `)
    );

    streamingChildProc.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    streamingChildProc.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    streamingChildProc2.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    streamingChildProc2.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    streamingChildProc3.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    streamingChildProc3.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
  }
  var activeCamera;

  socket.on('startStreaming', function (data) {
    activeCamera = data;
    startStreaming();
  });

  socket.on('videoInfo', function (data) {
    try {
      var camera = data.cam;
      var node = data.nodeinfo.name;
      var nodeID = data.nodeinfo.id;
      var date = data.metadata.format.filename;
      var sperateddate = date.split('/');
      var fileString = sperateddate[7];
      var splitFileString = fileString.split('_');
      var fileData = splitFileString[0];
      var fileTimewithExtention = splitFileString[1];
      var fileTimesplit = fileTimewithExtention.split('.');
      var fileTime = fileTimesplit[0];
      var fileTimeCelaned = fileTime.split('-');
      var dateTime = fileData + ' ' + fileTimeCelaned[0] + ':' + fileTimeCelaned[1] + ':00';
      var dateTimeString = moment(dateTime).toISOString();
      const vid = new vids({
        camera: data.cam,
        node: data.nodeinfo.name,
        nodeID: data.nodeinfo.id,
        fileLocation: data.metadata.format.filename,
        location: {
          lat: data.nodeinfo.location.lat,
          lng: data.nodeinfo.location.lng,
        },
        start_pts: data.metadata.format.start_pts,
        start_time: data.metadata.format.start_time,
        duration: data.metadata.format.duration,
        bit_rate: data.metadata.format.bit_rate,
        height: data.metadata.streams[0].height,
        width: data.metadata.streams[0].width,
        size: data.metadata.format.size,
        DateTime: dateTimeString,
      });
      vid.save();
    } catch (error) {}
  });
});

socketApi.sendNotification = function () {
  io.sockets.emit('hello', {
    msg: 'Hello World!',
  });
};

function intervalFunc() {
  checkLastCheckIn();
}

setInterval(intervalFunc, 15000);
module.exports = socketApi;
