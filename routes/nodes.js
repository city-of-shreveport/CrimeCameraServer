var express = require('express');
var router = express.Router();
var nodes = require('../models/nodes');
var moment = require('moment')
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
    cameraStatus: {
      camera1: Boolean,
      camera2: Boolean,
      camera3: Boolean,
    },
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

router.get('/seed', async (req, res) => {
  console.timeLog(req)
  nodeNumbers = [
    '52',
    '41',
    ];

  for (var i = 0; i < nodeNumbers.length; i++) {
    new nodes({
      config: {
        hostName: `CrimeCamera0${nodeNumbers[i]}`,
        ip: `10.10.30.1${nodeNumbers[i]}`,
        locationLat: `32.4${Math.random().toPrecision(6).slice(2)}`,
        locationLong: `-93.7${Math.random().toPrecision(6).slice(2)}`,
        videoDriveDevicePath: '/dev/sdb1',
        videoDriveMountPath: '/home/pi/videos',
        videoDriveEncryptionKey: 'pAVQn3IHEFIOcQEqBs6yXy7NK10OWAG',
        buddyDriveDevicePath: '/dev/sda1',
        buddyDriveMountPath: '/home/pi/remote_backups',
        buddyDriveEncryptionKey: 'AnlmETjP8lRQ7Z7noJQEbi4yvOYMGNU',
      },
      name: `CrimeCamera0${nodeNumbers[i]}`,
    }).save();
  }

  res.send('ok');
});

router.get('/:nodeName', async (req, res) => {
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
      res.send(err);
      console.log("Error")
      console.log(err);
    } else {
      res.send(doc);
      res.end();
    }
  });
});

router.post('/updateNode/:nodeName', async (req, res) => {
  console.log(req.body)
  console.log("made ithere");
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

router.post('/configureBuddies/:nodeName', async (req, res) => {
  function findNext(){
    
    nodes.countDocuments().exec(function (err, count) {
      // Get a random entry
      var random = Math.floor(Math.random() * count)
      // Again query all users but only fetch one offset by our random #
      nodes.findOne().skip(random).exec(
        function (err, doc) {
          // Tada! random user
          var now = moment(new Date()); //todays date
          var end = moment(doc.lastCheckIn); // another date
          var duration = moment.duration(now.diff(end));
          var hours = duration.asHours();
          console.log(hours)
          if(hours<96){

          console.log(doc.config.buddyDrives.buddy1.hostName)
          if(doc.config.buddyDrives.buddy1.hostName==='' || doc.config.buddyDrives.buddy1.hostName===undefined || doc.config.buddyDrives.buddy1.hostName==='none'){
            let mountPoint = '/home/pi/remote_backups/'+ req.params.nodeName
            let data = {
                buddyDrives:{
                  buddy1:{
                    hostName: req.params.nodeName,
                    sshfsMountPath: mountPoint
                  }
              }
            }
            nodes
            .findOneAndUpdate({ name: doc.config.hostName }, { $set: {  'config.buddyDrives.buddy1.hostName': req.params.nodeName, 'config.buddyDrives.buddy1.sshfsMountPath':mountPoint} })
            .exec(function (err, node) {
              if (err) {
                console.log(err)
                res.status(500).send(err);
              } else {
                nodes
                  .findOneAndUpdate({ name: req.params.nodeName}, { $set: { 'config.currentBuddy': doc.config.hostName} })
                  .exec(function (err, node) {
                    if (err) {
                      console.log(err)
                      res.status(500).send(err);
                    } else {
                      console.log(node)
                      res.status(200).send('Node updated!');
                      res.end();
                    }
                  });
              }
            });

          }





            else if(doc.config.buddyDrives.buddy2.hostName==='' || doc.config.buddyDrives.buddy2.hostName===undefined || doc.config.buddyDrives.buddy2.hostName==='none'){
              let mountPoint = '/home/pi/remote_backups/'+ req.params.nodeName
              let data = {
                buddyDrives:{
                  buddy2:{
                    hostName: req.params.nodeName,
                    sshfsMountPath: mountPoint
                  }
                }
              }
              nodes
              .findOneAndUpdate({ name: doc.config.hostName }, { $set: {  'config.buddyDrives.buddy2.hostName': req.params.nodeName,'config.buddyDrives.buddy2.sshfsMountPath':mountPoint} })
              .exec(function (err, node) {
                if (err) {
                  res.status(500).send(err);
                } else {
                  nodes
                    .findOneAndUpdate({ name: req.params.nodeName}, { $set: { 'config.currentBuddy': doc.config.hostName} })
                    .exec(function (err, node) {
                      if (err) {
                        res.status(500).send(err);
                      } else {
                        res.status(200).send('Node updated!');
                        res.end();
                      }
                    });
                }
              });
            
            }
          else{
            findNext();
          }  
        }
        else{findNext();}        
      })
    })
  }
  findNext();
});



module.exports = router;
