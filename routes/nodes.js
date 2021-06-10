var express = require('express');
var router = express.Router();
var nodes = require('../models/nodes');

router.get('/', async (req, res) => {
  nodes.find({}, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      var response = [];
    }
    res.send(docs);
  });
});

router.post('/', async (req, res) => {
  var newNode = new nodes({
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
      cameras: {
        camera1: {
          ip: req.body.camera1IP,
          type: req.body.camera1Type,
          direction: req.body.camera1Direction,
          username: req.body.camera1Username,
          password: req.body.camera1Password,
          folderName: req.body.camera1FolderName,
        },
        camera2: {
          ip: req.body.camera2IP,
          type: req.body.camera2Type,
          direction: req.body.camera2Direction,
          username: req.body.camera2Username,
          password: req.body.camera2Password,
          folderName: req.body.camera2FolderName,
        },
        camera3: {
          ip: req.body.camera3IP,
          type: req.body.camera3Type,
          direction: req.body.camera3Direction,
          username: req.body.camera3Username,
          password: req.body.camera3Password,
          folderName: req.body.camera3FolderName,
        },
      },
    },
  });

  await newNode.save();
  res.send(newNode);
});

router.get('/:nodeName', async (req, res) => {
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });
});

router.post('/:nodeName', async (req, res) => {
  nodes.findOneAndUpdate({ name: req.params.nodeName }, { $set: req.body }).exec(function (err, node) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(node);
    }
  });
});

router.post('/sysInfo/:nodeName', async (req, res) => {
  nodes
    .findOneAndUpdate({ name: req.params.nodeName }, { $set: { lastCheckIn: new Date(), sysInfo: req.body } })
    .exec(function (err, node) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send('Node updated!');
      }
    });
});

module.exports = router;
