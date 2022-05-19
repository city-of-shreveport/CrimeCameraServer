var express = require('express');
var router = express.Router();
var servers = require('../models/servers');

router.get('/', async (req, res) => {
  servers.find({}, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      console.log(docs)
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
   newServer.save();
  res.send(newServer);
});



router.get('/:serverName', async (req, res) => {
  servers.findOne({ name: req.params.serverName }, function (err, doc) {
    if (err) {
      res.send(err);
      console.log(err);
    } else {
      res.send(doc);
      res.end();
    }
  });
});


router.post('/updateServer/:serverName', async (req, res) => {
  console.log(req.body)
  console.log("made ithere");
  servers.findOneAndUpdate({ name: req.params.serverName }, { $set: req.body }).exec(function (err, node) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(node);
    }
  });
});
module.exports = router;
