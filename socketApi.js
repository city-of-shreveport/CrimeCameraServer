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
const { JSDOM } = require('jsdom');
const { data } = require('jquery');
const { window } = new JSDOM('');
const $ = require('jquery')(window);
const { exec, execSync } = require('child_process');
const fs = require('fs');
const streamingServer = require('socket.io-client');
const fetch = require('node-fetch');

var streamingSocket = streamingServer('http://192.168.196.150:3000/liveStream', {
  autoConnect: true,
});

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
  });

  socket.on('perfmonStats', function (data) {
    const perf = new perfmons(data);
    perf.save();
  });

  socket.on('systemOnline', (data) => {
    var dateNOW = moment().toISOString();
    const folderName = `public/videos/${data.name}`;

    try {
      if (!fs.existsSync(folderName)) {
        const mkDriCommand = execSync(`sudo mkdir public/videos/${data.name} ; echo $?`);
      }
    } catch (err) {
      console.log(err);
    }

    const stdout2 = execSync(`sudo mountpoint public/videos/${data.name} ; echo $?`);
    var responce = stdout2.toString();
    var reponcecleaned = responce.split('\n');
    console.log(reponcecleaned[1]);
    if (reponcecleaned[1] == '1') {
      exec(
        ` sshfs -o password_stdin pi@${data.ip}:/home/pi/videos public/videos/${data.name} <<< "raspberry"`,
        { shell: '/bin/bash' },
        function (error, stdout, stderr) {
          console.log(stderr);
        }
      );
    }

    var portStats = execSync(`nmap ${data.ip} -p 554,555,556`, function (error, stdout, stderr) {}).toString();
    var cleanedOut = portStats.split('\n');
    var cameraData = {};

    for (i = 0; i < cleanedOut.length; i++) {
      let check = cleanedOut[i].startsWith('554/tcp');
      let check2 = cleanedOut[i].startsWith('555/tcp');
      let check3 = cleanedOut[i].startsWith('556/tcp');
      if (check) {
        var portCleaned = cleanedOut[i].split(' ');
        if (portCleaned[1] === 'open') {
          cameraData.cam1 = true;
        }
        if (portCleaned[1] != 'open') {
          cameraData.cam1 = false;
        }
      }
      if (check2) {
        var portCleaned = cleanedOut[i].split(' ');
        if (portCleaned[1] === 'open') {
          cameraData.cam2 = true;
        }
        if (portCleaned[1] != 'open') {
          cameraData.cam2 = false;
        }
      }
      if (check3) {
        var portCleaned = cleanedOut[i].split(' ');
        if (portCleaned[1] === 'open') {
          cameraData.cam3 = true;
        }
        if (portCleaned[1] != 'open') {
          cameraData.cam3 = false;
        }
      }
    }

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
              camsOnlineStatus: cameraData,
            });
            cam.save();
          }

          if (doc == true) {
            cams.findOneAndUpdate(
              {
                nodeName: data.name,
              },
              {
                camsOnlineStatus: cameraData,
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

  function executeCommand(command) {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return;
      }
      if (stderr) {
        return;
      }
      if (stdout) {
        return;
      }
    });
  }

  function formatArguments(template) {
    return template
      .replace(/\s+/g, ' ')
      .replace(/\s/g, '\n')
      .split('\n')
      .filter((arg) => (arg != '' ? true : false));
  }

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

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

function checkVidInDB(camera, fileLocation, node, data) {
  vids.exists(
    {
      camera: camera,
      node: node,
      fileLocation: fileLocation,
    },
    function (err, doc) {
      if (err) {
      } else {
        if (!doc) {
          const vid = new vids({
            camera: data.camera,
            node: data.node,
            nodeID: data.nodeID,
            fileLocation: data.fileLocation,
            location: {
              lat: data.location.lat,
              lng: data.location.lng,
            },
            start_pts: data.start_pts,
            start_time: data.start_time,
            duration: data.duration,
            bit_rate: data.bit_rate,
            height: data.height,
            width: data.width,
            size: data.size,
            DateTime: data.DateTime,
          });
          vid.save();
        }
      }
    }
  );
}

const updateDBwithVid = async (returnedDocs) => {
  checkVidInDB(returnedDocs.camera, returnedDocs.fileLocation, returnedDocs.node, returnedDocs);
  await sleep(100);
};

function getVideoUpdateFromCam() {
  var returnedDocs;
  //call here to get all cameras and then loop through and run below code.
  cams.find({}, function (err, docs) {
    if (err) {
    } else {
      console.log(docs);

      for (i = 0; i < docs.length; i++) {
        fetch(`http://${docs[i].ip}:3000/allVideos`)
          .then((response) => response.json())
          .then((data) => {
            for (i = 0; i < data.length; i++) {
              updateDBwithVid(data[i]);
            }
            returnedDocs = data;
          });
      }
    }
  });
}

getVideoUpdateFromCam();
setInterval(getVideoUpdateFromCam, 1800000);
module.exports = socketApi;
