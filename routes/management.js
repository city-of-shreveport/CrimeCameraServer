const Express = require('express');
const Router = Express.Router();
const Moment = require('moment');
const Cameras = require('../models/cameras');
const Perfmons = require('../models/perfmons');

Router.get('/', async (req, res) => {
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

Router.get('/:nodeName', async (req, res) => {
  let camera = await Cameras.find({ nodeName: req.params.nodeName });
  let cameraPerfmons = await Perfmons.find({
    camera: req.params.nodeName,
  })
    .sort({ upDated: -1 })
    .limit(30);

  cameraPerfmons = cameraPerfmons.reverse();

  perfmonDates = cameraPerfmons.map((perfmon) => {
    return Moment(perfmon.upDated).tz('America/Chicago').format('h:mm:ss a');
  });

  avgLoad = cameraPerfmons.map((perfmon) => {
    return { x: perfmon.upDated, y: perfmon.currentLoad.avgLoad };
  });

  currentLoad = cameraPerfmons.map((perfmon) => {
    return { x: perfmon.upDated, y: perfmon.currentLoad.currentLoad };
  });

  currentLoadUser = cameraPerfmons.map((perfmon) => {
    return { x: perfmon.upDated, y: perfmon.currentLoad.currentLoadUser };
  });

  cpuTemperature = cameraPerfmons.map((perfmon) => {
    return { x: perfmon.upDated, y: perfmon.cpuTemperature.main };
  });

  memUsage = cameraPerfmons.map((perfmon) => {
    return { x: perfmon.upDated, y: (perfmon.mem.used / perfmon.mem.total / 8) * 100 };
  });

  diskUsage = cameraPerfmons.map((perfmon) => {
    return { x: perfmon.upDated, y: (perfmon.fsSize[2].get('used') / perfmon.fsSize[2].get('size') / 8) * 100 };
  });

  res.render('management-camera', {
    title: 'Camera Information',
    camera: camera[0],
    perfmonDates: perfmonDates,
    avgLoad: avgLoad,
    currentLoad: currentLoad,
    currentLoadUser: currentLoadUser,
    cpuTemperature: cpuTemperature,
    memUsage: memUsage,
    diskUsage: diskUsage,
  });
});

module.exports = Router;
