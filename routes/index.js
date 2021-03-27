var express = require('express');
var router = express.Router();
const Cameras = require('../models/cameras');
const Perfmons = require('../models/perfmons');

router.get('/', function (req, res) {
  res.render('index', {
    title: 'Home',
  });
});

router.get('/management', async (req, res) => {
  let cameras = await Cameras.find({});
  var cameraData = [];

  for (var camera of cameras) {
    lastPerfmon = await Perfmons.find({
      camera: camera.nodeName,
    })
      .sort({ upDated: -1 })
      .limit(1);

    camera.lastPerfmon = lastPerfmon[0];
    cameraData.push(camera);
  }

  res.render('management', {
    title: 'Management',
    cameraData: cameraData,
  });
});

router.get('/management/:nodeName', async (req, res) => {
  let camera = await Cameras.find({ nodeName: req.params.nodeName });
  let cameraPerfmons = await Perfmons.find({
    camera: req.params.nodeName,
  })
    .sort({ upDated: -1 })
    .limit(30);

  res.render('management-camera', {
    title: 'Camera Information',
    camera: camera[0],
    cameraPerfmons: cameraPerfmons,
  });
});

module.exports = router;
