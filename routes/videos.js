var express = require('express');
var fs = require('fs');
var router = express.Router();
var videos = require('../models/videos');

router.get('/', async (req, res) => {
  allVideos = await videos.find({ deletedAt: null }, { node: 1, camera: 1, fileLocation: 1, dateTime: 1 });
  res.send(allVideos);
});

router.post('/', async (req, res) => {
  req.body.map((video) => {
    videos.exists(
      {
        node: video.node,
        camera: video.camera,
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

router.get('/stream/:node/:camera/:file', async (req, res) => {
  var range = req.headers.range;
  var node = req.params.node;
  var camera = req.params.camera;
  var file = req.params.file;
  var videoPath = `/home/pi/mounts/${node}/${camera}/${file}`;
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

router.get('/getlatestVideo/:node/:camera/:time', async (req, res) => {
  var node = req.params.node;
  var camera = req.params.camera;
  var time = req.params.time;
  videos
  .find({ node: node, camera: camera })
  .sort([['createdAt']])
  .exec(function (err, docs) {
    if (err) {
    } else {
      console.log(docs);
    }
  });

  if(time==='15'){
  videos
    .find({ node: node, camera: camera})
    .sort([['createdAt', -1]])
    .limit(1)
    .exec(function (err, docs) {
      if (err) {
      } else {
        res.send(docs);
      }
    });
  }
  if(time==='30'){
    videos
      .find({ node: node, camera: camera })
      .sort([['createdAt', -1]])
      .limit(2)
      .exec(function (err, docs) {
        if (err) {
        } else {
          res.send(docs);
        }
      });
    }
    if(time==='45'){
      videos
        .find({ node: node, camera: camera })
        .sort([['createdAt', -1]])
        .limit(3)
        .exec(function (err, docs) {
          if (err) {
          } else {
            res.send(docs);
          }
        });
      }
      if(time==='60'){
        videos
          .find({ node: node, camera: camera })
          .sort([['createdAt', -1]])
          .limit(4)
          .exec(function (err, docs) {
            if (err) {
            } else {
              res.send(docs);
            }
          });
        }
});



router.get('/stream/:node/:camera/:file/download', async (req, res) => {
  var node = req.params.node;
  var camera = req.params.camera;
  var file = req.params.file;
  var videoPath = `/home/pi/mounts/${node}/${camera}/${file}`;
  var options = {
    root: path.join(__dirname)
};

res.sendFile(videoPath, options, function (err) {
    if (err) {
        next(err);
    } else {
        console.log('Sent:', fileName);
        next();
    }
});
});

module.exports = router;


