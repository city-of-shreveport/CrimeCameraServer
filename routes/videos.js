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

  res.send('Videos created!');
});

router.get('/:nodeName', async (req, res) => {
  videos.find({ node: req.params.nodeName }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      res.send(docs);
    }
  });
});

router.get('/:date/:nodeName', async (req, res) => {
  const date = req.params.date;

  var documents = {
    camera1: [],
    camera2: [],
    camera3: [],
  };

  videos
    .find({
      node: nodes.findOne({ name: req.params.nodeName })._id,
      dateTime: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lte: new Date(date + 'T23:59:00.000Z'),
      },
    })
    .sort([['dateTime', 1]])
    .exec(function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        for (var i = 0; i < docs.length; i++) {
          switch (docs[i].camera) {
            case 'camera1':
              documents.camera1.push(docs[i]);
              break;
            case 'camera2':
              documents.camera2.push(docs[i]);
              break;
            case 'camera3':
              documents.camera3.push(docs[i]);
              break;
          }
        }
        res.send(documents);
      }
    });
});

router.get('/:nodeName/:startDate/:endDate', async (req, res) => {
  videos.find(
    {
      node: req.params.nodeName,
      dateTime: {
        $gte: req.params.startDate,
        $lte: req.params.endDate,
      },
    },
    function (err, docs) {
      if (err) {
        console.log(err);
        res.send('error');
      } else {
        res.send(docs);
      }
    }
  );
});

router.get('/dates/:nodeName', async (req, res) => {
  videos.find({ node: req.params.nodeName }, { DateTime: true, _id: false }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      for (i = 0; i < docs.length; i++) {}
      res.send(docs);
    }
  });
});

router.get('/oldest/:nodeName', async (req, res) => {
  videos
    .findOne({ node: req.params.nodeName })
    .sort({ date: -1 })
    .exec(function (err, docs) {
      res.send(docs);
    });
});

router.get('/test', function (req, res) {
  const path = 'public/test.mp4';
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

module.exports = router;
