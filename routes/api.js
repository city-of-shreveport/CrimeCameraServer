// require basic
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const dedent = require('dedent-js');
const spawn = require('child_process').spawn;
const { formatArguments, isAuthorized, unauthrizedMessage } = require('../helperFunctions');

// require models
const nodes = require('../models/nodes');
const perfMons = require('../models/perfMons');
const videos = require('../models/videos');

router.post('/newNode', async (req, res) => {
  if (isAuthorized(req.query.token)) {
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
    console.log(req.body);
    await newNode.save();
    res.send(newNode);
  } else {
    res.json(unauthrizedMessage());
  }
});

router.post('/upDateNode/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    nodes
      .findOneAndUpdate({ name: req.params.nodeName }, { $set: { lastCheckIn: new Date(), sysInfo: req.body } })
      .exec(function (err, node) {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        } else {
          res.status(200).send(node);
        }
      });
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/nodes', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    nodes.find({}, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        var response = [];
      }
      res.send(docs);
    });
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/nodes/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.send(doc);
      }
    });
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/perfmons/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    perfMons
      .find({ node: nodes.findOne({ name: req.params.node })._id })
      .sort([['dateTime', 1]])
      .exec(function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          res.send(docs);
        }
      });
  } else {
    res.json(unauthrizedMessage());
  }
});

router.post('/perfmons/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    const PerfMon = new perfMons(req.params);
    PerfMon.node = nodes.findOne({ name: req.params.nodeName })._id;
    await PerfMon.save();
    res.send(PerfMon);
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/videos/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    videos.find({ node: req.params.nodeName }, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        res.send(docs);
      }
    });
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/videos/:date/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
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
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/videos/:startDate/:endDate/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
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
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/videos/dates/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    videos.find({ node: req.params.nodeName }, { DateTime: true, _id: false }, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        for (i = 0; i < docs.length; i++) {}
        res.send(docs);
      }
    });
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/videos/oldest/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    videos
      .findOne({ node: req.params.nodeName })
      .sort({ date: -1 })
      .exec(function (err, docs) {
        res.send(docs);
      });
  } else {
    res.json(unauthrizedMessage());
  }
});

router.post('/videos/create', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    const video = await new videos({
      node: nodes.findOne({ name: req.body.nodeName })._id,
      fileLocation: req.body.filename,
      location: { lat: req.body.location.lat, lng: req.body.location.lng },
      startPts: req.body.start_pts,
      startTime: req.body.start_time,
      duration: req.body.duration,
      bitRate: req.body.bit_rate,
      height: req.body.height,
      width: req.body.width,
      size: req.body.size,
      dateTime: body.dateTime,
    }).save();

    res.send(video);
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/streams/start/:nodeName/:cameraIP', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    var nodeName = req.params.nodeName;
    var cameraIP = req.params.cameraIP;

    streamingCamerasOBJ[nodeName] = {};
    streamingCamerasOBJ[nodeName]['camera1'] = null;
    streamingCamerasOBJ[nodeName]['camera2'] = null;
    streamingCamerasOBJ[nodeName]['camera3'] = null;

    streamingCamerasOBJ[nodeName].camera1 = spawn(
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
      rtmp://10.10.10.53/${nodeName}/camera1?sign=9999999999${md5('/' + nodeName + '/camera1-9999999999-UUnv9njxg')}
    `
    );

    streamingCamerasOBJ[nodeName].camera2 = spawn(
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
      rtmp://10.10.10.53/${nodeName}/camera2?sign=9999999999${md5('/' + nodeName + '/camera2-9999999999-UUnv9njxg')}
    `
    );

    streamingCamerasOBJ[nodeName].camera3 = spawn(
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
      rtmp://10.10.10.53/${nodeName}/camera3?sign=9999999999${md5('/' + nodeName + '/camera3-9999999999-UUnv9njxg')}
    `
    );

    res.send('ok');
  } else {
    res.json(unauthrizedMessage());
  }
});

router.get('/streams/stop/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    streamingCamerasOBJ[req.params.nodeName]['camera1'].stdin.write('q');
    streamingCamerasOBJ[req.params.nodeName]['camera2'].stdin.write('q');
    streamingCamerasOBJ[req.params.nodeName]['camera3'].stdin.write('q');
    res.send('ok');
  } else {
    res.json(unauthrizedMessage());
  }
});

module.exports = router;
