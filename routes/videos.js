var express = require('express');
var router = express.Router();
var videos = require('../models/videos');

router.post('/', async (req, res) => {
  req.body.map((video) => {
    videos.exists(
      {
        node: video.node,
        fileLocation: video.fileLocation,
      },
      function (err, doc) {
        if (!doc) {
          new videos(video).save();
        }
      }
    );
  });

  res.send('ok');
});

router.post('/recordings/', async (req, res) => {
  var response = {};

  for (var i = 0; i < req.body.nodes.length; i++) {
    await videos.find(
      {
        node: req.body.nodes[i],
        dateTime: req.body.dateTime,
      },
      function (err, docs) {
        if (err) {
          console.log(err);
          res.send('error');
        } else {
          response[req.body.nodes[i]] = docs;
        }
      }
    );
  }

  res.json(response);
});

module.exports = router;
