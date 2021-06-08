// require basic
const dedent = require('dedent-js');
const express = require('express');
const md5 = require('md5');
const moment = require('moment-timezone');
const router = express.Router();
const spawn = require('child_process').spawn;
const { formatArguments } = require('../helperFunctions');

// require models
const nodes = require('../models/nodes');
const perfMons = require('../models/perfMons');
const servers = require('../models/servers');
const videos = require('../models/videos');

router.get('/nodes', async (req, res) => {
  nodes.find({}, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      var response = [];
    }
    res.send(docs);
  });
});

router.post('/nodes', async (req, res) => {
  console.log(req.body);
  const newNode = new nodes({
    name: req.body.name,
    ip: req.body.zeroTierIP,
    config: {
      hostName: req.body.hostName,
      locationLat: req.body.locationLat,
      locationLong: req.body.locationLong,
      zeroTierNetworkID: req.body.zeroTierNetworkID,
      zeroTierIP: req.body.zeroTierIP,
      videoDriveDevicePath: req.body.videoDriveDevicePath,
      videoDriveMountPath: req.body.videoDriveMountPath,
      videoDriveEncryptionKey: req.body.videoDriveEncryptionKey,
      buddyDriveDevicePath: req.body.buddyDriveDevicePath,
      buddyDriveMountPath: req.body.buddyDriveMountPath,
      buddyDriveEncryptionKey: req.body.buddyDriveEncryptionKey,
      serverURL: req.body.serverURL,
      buddyDrives: [
        {
          sshfsMountPath: req.body.BuddyDrive1MountPath,
          hostName: req.body.BuddyDrive1HostName,
        },
        {
          hostName: req.body.BuddyDrive2HostName,
          sshfsMountPath: req.body.BuddyDrive2MountPath,
        },
      ],
      cameras: [
        {
          ip: req.body.camera1IP,
          type: req.body.camera1Type,
          direction: req.body.camera1Direction,
          username: req.body.camera1Username,
          password: req.body.camera1Password,
          folderName: req.body.camera1FolderName,
        },
        {
          ip: req.body.camera2IP,
          type: req.body.camera2Type,
          direction: req.body.camera2Direction,
          username: req.body.camera2Username,
          password: req.body.camera2Password,
          folderName: req.body.camera2FolderName,
        },
        {
          ip: req.body.camera3IP,
          type: req.body.camera3Type,
          direction: req.body.camera3Direction,
          username: req.body.camera3Username,
          password: req.body.camera3Password,
          folderName: req.body.camera3FolderName,
        },
      ],
    },
  });

  await newNode.save();
  res.send(newNode);
});

router.get('/nodes/:nodeName', async (req, res) => {
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.send(doc);
    }
  });
});
router.post('/nodes/:nodeName', async (req, res) => {
  console.log(req.body);
  nodes.findOneAndUpdate({ name: req.params.nodeName }, { $set: req.body }).exec(function (err, node) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200).send(node);
    }
  });
});
router.post('/nodes/sysInfo/:nodeName', async (req, res) => {
  nodes
    .findOneAndUpdate({ name: req.params.nodeName }, { $set: { lastCheckIn: new Date(), sysInfo: req.body } })
    .exec(function (err, node) {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(200).send('Node updated!');
      }
    });
});

router.get('/perfmons/:nodeName', async (req, res) => {
  perfMons
    .find({ node: req.params.nodeName })
    .sort([['dateTime', 1]])
    .limit(60)
    .exec(function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        res.send(docs);
      }
    });
});

router.post('/perfmons', async (req, res) => {
  new perfMons(req.body).save();
  res.send('PerfMon created!');
});
router.get('/servers', async (req, res) => {
  servers.find({}, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      var response = [];
    }
    res.send(docs);
  });
});
router.post('/servers', async (req, res) => {
  console.log(req.body);
  const newServer = new servers({
    name: req.body.name,
    service: req.body.service,
    zeroTierIP: req.body.zeroTierIP,
    zeroTierNetworkID: req.body.zeroTierNetworkID,
    lastCheckIn: new Date(),
  });

  await newServer.save();
  res.send(newServer);
});
router.post('/videos', async (req, res) => {
  for (var i = 0; i < req.body.length; i++) {
    new videos({
      node: req.body[i].node,
      fileLocation: req.body[i].fileLocation,
      location: {
        lat: req.body[i].location.lat,
        lng: req.body[i].location.lng,
      },
      startPts: req.body[i].start_pts,
      startTime: req.body[i].start_time,
      duration: req.body[i].duration,
      bitRate: req.body[i].bit_rate,
      height: req.body[i].height,
      width: req.body[i].width,
      size: req.body[i].size,
      dateTime: req.body[i].dateTime,
      hash: req.body[i].dateTime,
      camera: req.body[i].camera,
      hash: req.body[i].hash,
    }).save();
  }

  res.send('Videos created!');
});

router.get('/videos/:nodeName', async (req, res) => {
  videos.find({ node: req.params.nodeName }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      res.send(docs);
    }
  });
});

router.get('/videos/:date/:nodeName', async (req, res) => {
  const date = req.params.date;

  var documents = {
    camera1: [],
    camera2: [],
    camera3: [],
  };

  videos
    .find({
      node: nodes.findOne({ name: req.params.nodeName })._id,
      dateTime: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lte: new Date(date + 'T23:59:00.000Z'),
      },
    })
    .sort([['dateTime', 1]])
    .exec(function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        for (var i = 0; i < docs.length; i++) {
          switch (docs[i].camera) {
            case 'camera1':
              documents.camera1.push(docs[i]);
              break;
            case 'camera2':
              documents.camera2.push(docs[i]);
              break;
            case 'camera3':
              documents.camera3.push(docs[i]);
              break;
          }
        }
        res.send(documents);
      }
    });
});

router.get('/videos/:startDate/:endDate/:nodeName', async (req, res) => {
  const startDate = req.params.startDate;
  const splitFileString = startDate.split('_');
  const fileData = splitFileString[0];
  const fileTimewithExtention = splitFileString[1];
  const fileTimesplit = fileTimewithExtention.split('.');
  const fileTime = fileTimesplit[0];
  const fileTimeCelaned = fileTime.split('-');
  const dateTime = fileData + ' ' + fileTimeCelaned[0] + ':' + fileTimeCelaned[1] + ':00';
  const dateTimeString = moment(dateTime).toISOString();
  const endDate = req.params.endDate;
  const splitFileString2 = endDate.split('_');
  const fileData2 = splitFileString2[0];
  const fileTimewithExtention2 = splitFileString2[1];
  const fileTimesplit2 = fileTimewithExtention2.split('.');
  const fileTime2 = fileTimesplit2[0];
  const fileTimeCelaned2 = fileTime2.split('-');
  const dateTime2 = fileData2 + ' ' + fileTimeCelaned2[0] + ':' + fileTimeCelaned2[1] + ':00';
  const dateTimeString2 = moment(dateTime2);
  const time = moment.duration('00:04:00');
  const dateTimeString2Cleaned = dateTimeString2.subtract(time).toISOString();

  videos.find(
    {
      node: nodes.findOne({ name: req.params.nodeName })._id,
      dateTime: {
        $gte: dateTimeString,
        $lte: dateTimeString2Cleaned,
      },
    },
    function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        res.send(docs);
      }
    }
  );
});

router.get('/videos/dates/:nodeName', async (req, res) => {
  videos.find({ node: req.params.nodeName }, { DateTime: true, _id: false }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      for (i = 0; i < docs.length; i++) {}
      res.send(docs);
    }
  });
});

router.get('/videos/oldest/:nodeName', async (req, res) => {
  videos
    .findOne({ node: req.params.nodeName })
    .sort({ date: -1 })
    .exec(function (err, docs) {
      res.send(docs);
    });
});

var streamingCameras = {};

router.get('/streams/start/:nodeName/:nodeIP', async (req, res) => {
  console.log(req.params.nodeName);
  var nodeName = req.params.nodeName;
  var nodeIP = req.params.nodeIP;

  streamingCameras[nodeName] = {};
  streamingCameras[nodeName]['camera1'] = null;
  streamingCameras[nodeName]['camera2'] = null;
  streamingCameras[nodeName]['camera3'] = null;

  streamingCameras[nodeName].camera1 = spawn(
    'ffmpeg',
    formatArguments(`
      -loglevel panic
      -rtsp_transport tcp
      -i rtsp://admin:UUnv9njxg123@${nodeIP}:554/cam/realmonitor?channel=1&subtype=1
      -r 15 
      -f flv 
      rtmp://10.10.200.10/${nodeName}camera1
    `)
  );

  streamingCameras[nodeName].camera1.stdout.on('data', (data) => {});

  streamingCameras[nodeName].camera1.stderr.on('data', (data) => {});

  streamingCameras[nodeName].camera2 = spawn(
    'ffmpeg',
    formatArguments(`
      -loglevel panic
      -rtsp_transport tcp
      -i rtsp://admin:UUnv9njxg123@${nodeIP}:555/cam/realmonitor?channel=1&subtype=1
      -r 15 
      -f flv 
      rtmp://10.10.200.10/${nodeName}camera2
    `)
  );

  streamingCameras[nodeName].camera2.stdout.on('data', (data) => {});

  streamingCameras[nodeName].camera2.stderr.on('data', (data) => {});

  streamingCameras[nodeName].camera3 = spawn(
    'ffmpeg',
    formatArguments(`
      -rtsp_transport tcp
      -i rtsp://admin:UUnv9njxg123@${nodeIP}:556/cam/realmonitor?channel=1&subtype=1
      -r 15 
      -f flv 
      rtmp://10.10.200.10/${nodeName}camera3
    `)
  );

  streamingCameras[nodeName].camera3.stdout.on('data', (data) => {});

  streamingCameras[nodeName].camera3.stderr.on('data', (data) => {});

  res.send('ok');
});

router.get('/streams/stop/:nodeName', async (req, res) => {
  var nodeName = req.params.nodeName;

  streamingCameras[nodeName]['camera1'].stdin.write('q');
  streamingCameras[nodeName]['camera2'].stdin.write('q');
  streamingCameras[nodeName]['camera3'].stdin.write('q');
});

module.exports = router;
