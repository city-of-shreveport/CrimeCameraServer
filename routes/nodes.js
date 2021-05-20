const Express = require('express');
const Moment = require('moment-timezone');
const Nodes = require('../models/nodes');
const PerfMons = require('../models/perfMons');
const Router = Express.Router();
const Videos = require('../models/videos');
const { isAuthorized, unauthrizedMessage } = require('../helperFunctions');

Router.get('/getConfig', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    const node = await Nodes.findOne({ name: req.query.node });

    if (node) {
      res.json(node);
    } else {
      newNode = await new Nodes({
        name: req.query.node,
      }).save();

      new PerfMons({ node: newNode }).save();
      const node = new Nodes({ name: req.query.node });
      await node.save();
      res.json(node);
    }
  } else {
    res.json(unauthrizedMessage());
  }
});

Router.get('/oldestVideo/:nodeName', requiresAuth(), async (req, res) => {
  Videos.findOne({ node: req.params.nodeName })
    .sort({ date: -1 })
    .exec(function (err, docs) {
      res.send(docs);
    });
});

Router.get('/videoDatesbyNode/:nodeName', requiresAuth(), async (req, res) => {
  Videos.find({ node: req.params.nodeName }, { DateTime: true, _id: false }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      for (i = 0; i < docs.length; i++) {}
      res.send(docs);
    }
  });
});

Router.get('/videosByNode/:nodeName', requiresAuth(), async (req, res) => {
  Videos.find({ node: req.params.nodeName }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      res.send(docs);
    }
  });
});

Router.get('/getNodeInfo/:nodeName', requiresAuth(), async (req, res) => {
  Nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.send(doc);
    }
  });
});

Router.get('/videosByDay/:date/:nodeName', requiresAuth(), async (req, res) => {
  const date = req.params.date;

  var documents = {
    cam1: [],
    cam2: [],
    cam3: [],
  };

  Videos.find({
    node: Nodes.findOne({ name: req.params.nodeName })._id,
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
            case 'cam1':
              documents.cam1.push(docs[i]);
              break;
            case 'cam2':
              documents.cam2.push(docs[i]);
              break;
            case 'cam3':
              documents.cam3.push(docs[i]);
              break;
          }
        }
        res.send(documents);
      }
    });
});

Router.get('/videos/:startDate/:endDate/:nodeName', requiresAuth(), async (req, res) => {
  const startDate = req.params.startDate;
  const splitFileString = startDate.split('_');
  const fileData = splitFileString[0];
  const fileTimewithExtention = splitFileString[1];
  const fileTimesplit = fileTimewithExtention.split('.');
  const fileTime = fileTimesplit[0];
  const fileTimeCelaned = fileTime.split('-');
  const dateTime = fileData + ' ' + fileTimeCelaned[0] + ':' + fileTimeCelaned[1] + ':00';
  const dateTimeString = Moment(dateTime).toISOString();
  const endDate = req.params.endDate;
  const splitFileString2 = endDate.split('_');
  const fileData2 = splitFileString2[0];
  const fileTimewithExtention2 = splitFileString2[1];
  const fileTimesplit2 = fileTimewithExtention2.split('.');
  const fileTime2 = fileTimesplit2[0];
  const fileTimeCelaned2 = fileTime2.split('-');
  const dateTime2 = fileData2 + ' ' + fileTimeCelaned2[0] + ':' + fileTimeCelaned2[1] + ':00';
  const dateTimeString2 = Moment(dateTime2);
  const time = Moment.duration('00:04:00');
  const dateTimeString2Cleaned = dateTimeString2.subtract(time).toISOString();

  Videos.find(
    {
      node: Nodes.findOne({ name: req.params.nodeName })._id,
      dateTime: {
        $gte: dateTimeString,
        $lte: dateTimeString2Cleaned,
      },
    },
    function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        res.send(docs);
      }
    }
  );
});

Router.get('/currentCameraList', requiresAuth(), async (req, res) => {
  Nodes.find({}, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      var response = [];
      for (i = 0; i < docs.length; i++) {
        const hours = Moment().diff(Moment(docs[i].lastCheckIn), 'hours', true);
        hours = hours.toFixed(2);

        if (hours < 0.3) {
          response.push(docs[i]);
        }
      }
      res.send(response);
    }
  });
});

Router.get('/nodeList', requiresAuth(), async (req, res) => {
  Nodes.find({}, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      res.send(docs);
    }
  });
});

Router.post('/addVideos', requiresAuth(), async (req, res) => {
  const video = await new Videos({
    node: Nodes.findOne({ name: req.body.nodeName })._id,
    fileLocation: req.body.filename,
    location: { lat: req.body.location.lat, lng: req.body.location.lng },
    startPts: req.body.start_pts,
    startTime: req.body.start_time,
    duration: req.body.duration,
    bitRate: req.body.bit_rate,
    height: req.body.height,
    width: req.body.width,
    size: req.body.size,
    dateTime: body.dateTime,
  }).save();

  res.send(video);
});

module.exports = Router;
