var express = require('express');
var router = express.Router();
var servers = require('../models/servers');

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
    service: req.body.service,
    zeroTierIP: req.body.zeroTierIP,
    zeroTierNetworkID: req.body.zeroTierNetworkID,
    lastCheckIn: new Date(),
  });
  console.log(newServer);
  await newServer.save();
  res.send(newServer);
});

module.exports = router;
