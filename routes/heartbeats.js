var express = require('express');
var router = express.Router();
var heartbeats = require('../models/heartbeats');

router.post('/', async (req, res) => {
  var newHeartbeat = new heartbeats(req.body);

  await newHeartbeat.save()
  res.send(newHeartbeat);
});

module.exports = router;
