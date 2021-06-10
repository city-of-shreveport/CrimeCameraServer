// require basic
var express = require('express');
var router = express.Router();

// require models
var videos = require('../models/videos');

router.get('/', async (req, res) => {
  videos.find({}, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });
});

router.get('/:nodeName', async (req, res) => {
  videos.find({ node: req.params.nodeName }, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });
});

router.get('/:date/:nodeName', async (req, res) => {
  var date = req.params.date;

  var documents = {
    camera1: [],
    camera2: [],
    camera3: [],
  };

  videos
    .find({
      node: nodeName,
      dateTime: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lte: new Date(date + 'T23:59:00.000Z'),
      },
    })
    .sort([['dateTime', 1]])
    .exec(function (err, docs) {
      if (err) {
        response.send(err);
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
        res.send(err);
      } else {
        res.send(docs);
      }
    }
  );
});

router.get('/dates/:nodeName', async (req, res) => {
  videos.find({ node: req.params.nodeName }, { DateTime: true, _id: false }, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
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

module.exports = router;
