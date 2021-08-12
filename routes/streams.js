var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var { formatArguments } = require('../helperFunctions');
var streamingCameras = {};
var streamMons = require('../models/streamMons.js');
const fetch = require('node-fetch');

router.get('/streamingserverstats', async (req, res) => {
  var q = streamMons
    .find({ name: 'rtcc-server' })
    .sort([['createdAt', -1]])
    .limit(20);
  q.exec(function (err, posts) {
    const sortByDate = (arr) => {
      const sorter = (a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      };
      posts.sort(sorter);
    };
    sortByDate(posts);
    res.send(posts);
  });
});

router.get('/streamstatistics/:ip', async (req, res) => {
  fetch('http://' + req.params.ip + ':8000/api/streams')
    .then((response) => response.json())
    .then((json) => {
      res.send(json);
    });
});
module.exports = router;
