var express = require('express');
var router = express.Router();
const cameras = require('../models/cameras');

router.get('/', function (req, res) {
  res.render('index', {
    title: 'Home',
  });
});

router.get('/management', async (req, res) => {
  cameraData = await cameras.find({ nodeName: 'CrimeCamera003' }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      return docs;
    }
  });

  res.render('management', {
    title: 'Management',
    cameraData: cameraData,
  });
});

module.exports = router;
