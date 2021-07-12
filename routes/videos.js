var express = require('express');
var fs = require('fs');
var router = express.Router();
var videos = require('../models/videos');

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

router.get('/stream/:node/:camera/:file', async (req, res) => {
  var range = req.headers.range;
  var node = req.params.node;
  var camera = req.params.camera;
  var file = req.params.file;
  var videoPath = `/home/pi/CrimeCameraServer/public/nodes/${node}/${camera}/${file}`;
  var videoSize = fs.statSync(videoPath).size;
  var chunkSize = 10 ** 6;
  var start = Number(range.replace(/\D/g, ''));
  var end = Math.min(start + chunkSize, videoSize - 1);
  var contentLength = end - start + 1;
  var videoStream = fs.createReadStream(videoPath, { start, end });

  var headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };

  res.writeHead(206, headers);
  videoStream.pipe(res);
});

module.exports = router;
