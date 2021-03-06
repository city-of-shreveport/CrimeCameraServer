var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var videos = require('../models/videos');

router.get('/', async (req, res) => {
  allVideos = await videos.find({ deletedAt: null }, { node: 1, camera: 1, fileLocation: 1, dateTime: 1 });
  res.send(allVideos);
});

router.post('/', async (req, res) => {
  //console.log(req.body)
 
    videos.exists(
      {
        node: req.body.node,
        camera: req.body.camera,
        fileLocation: req.body.fileLocation,
      },
      function (err, doc) {
        if (!doc) {
          new videos(req.body).save();
        }
      }
    );
  

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

router.get('/getlatestVideos/:node', async (req, res) => {
  var node = req.params.node;
  var camera = req.params.camera;


  var videoFilesAllCameras = {
    camera1:[],
    camera2:[],
    camera3:[]
  }
 
  videos
    .find({ node: node, camera: "camera1"})
    .sort([['dateTime', -1]])
    .limit(8)
    .exec(function (err, docs) {
      if (err) {
      } else {
        videoFilesAllCameras.camera1 = docs;
        videos
          .find({ node: node, camera: "camera2"})
          .sort([['dateTime', -1]])
          .limit(8)
          .exec(function (err, docs) {
            if (err) {
            } else {
              videoFilesAllCameras.camera2 = docs;
              videos
                .find({ node: node, camera: "camera3"})
                .sort([['dateTime', -1]])
                .limit(8)
                .exec(function (err, docs) {
                  if (err) {
                  } else {
                    videoFilesAllCameras.camera3 = docs;
                    res.send(videoFilesAllCameras);
                  }
                });
            }
          });

        
      }
    });
 
});



router.get('/stream/:node/:camera/:file/download', async (req, res) => {
  var node = req.params.node;
  var camera = req.params.camera;
  var file = req.params.file;
  var videoPath = `/home/pi/mounts/${node}/${camera}/${file}`;
  var options = {
    
};
 
res.download(videoPath);

});

module.exports = router;


