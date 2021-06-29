var express = require('express');
var router = express.Router();
var videos = require('../models/videos');

router.post('/', async (req, res) => {
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

  res.send('ok');
});

router.post('/recordings/', async (req, res) => {
  var unixTime = Date.parse(req.body.dateTime) / 1000;
  var response = {};

  for (var i = 0; i < req.body.nodes.length; i++) {
    nodeName = req.body.nodes[i];

    videos.find(
      {
        node: nodeName,
        dateTime: {
          $gte: unixTime - 60,
          $lte: unixTime + 60,
        },
      },
      function (err, docs) {
        if (err) {
          console.log(err);
          res.send('error');
        } else {
          response[nodeName] = docs;
        }
      }
    );
  }

  res.json(response);
});

module.exports = router;
