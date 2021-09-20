var express = require('express');
var router = express.Router();
var servers = require('../models/servers');
var { exec } = require('child_process');

router.get('/', async (req, res) => {
  servers.find({}, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });
});

router.post('/', async (req, res) => {
  var newServer = new servers({
    name: req.body.name,
    type: req.body.type,
    ip: req.body.ip,
  });

  await newServer.save();
  res.send(newServer);
});

router.post('/delete', async (req, res) => {
  await servers.findOneAndDelete({ _id: req.body._id }, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });
});

router.post('/reboot', async (req, res) => {
  var server = await servers.findOne({ _id: req.body._id }, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });

  exec(`ssh pi@${server.ip} 'sudo reboot now'`, (error, stdout, stderr) => {});
});

module.exports = router;
