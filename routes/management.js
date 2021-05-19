const Express = require('express');
const Router = Express.Router();
const { requiresAuth } = require('express-openid-connect');
const Moment = require('moment');
const CameraConfigurations = require('../models/cameraconfigurations');
const Cameras = require('../models/cameras');
const Perfmons = require('../models/perfmons');

Router.get('/', requiresAuth(), async (req, res) => {
  let cameras = await Cameras.find({});
  var cameraData = [];

  for (var camera of cameras) {
    lastPerfmon = await Perfmons.findOne({
      camera: camera.nodeName,
    }).sort({ upDated: -1 });

    if (lastPerfmon == null) {
      newPerfmon = new Perfmons(defaultPerfmon(camera));
      newPerfmon.save();
      camera.lastPerfmon = newPerfmon;
    } else {
      camera.lastPerfmon = lastPerfmon;
    }

    cameraData.push(camera);
  }

  res.render('management', {
    title: 'Management',
    cameraData: cameraData,
  });
});

Router.get('/:nodeName', requiresAuth(), async (req, res) => {
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
    return {
      x: tryValue(function () {
        return perfmon.upDated;
      }),
      y: tryValue(function () {
        return perfmon.currentLoad.avgLoad;
      }),
    };
  });

  currentLoad = cameraPerfmons.map((perfmon) => {
    return {
      x: tryValue(function () {
        return perfmon.upDated;
      }),
      y: tryValue(function () {
        return perfmon.currentLoad.currentLoad;
      }),
    };
  });

  currentLoadUser = cameraPerfmons.map((perfmon) => {
    return {
      x: tryValue(function () {
        return perfmon.upDated;
      }),
      y: tryValue(function () {
        perfmon.currentLoad.currentLoadUser;
      }),
    };
  });

  cpuTemperature = cameraPerfmons.map((perfmon) => {
    return {
      x: tryValue(function () {
        return perfmon.upDated;
      }),
      y: tryValue(function () {
        return perfmon.cpuTemperature.main;
      }),
    };
  });

  memUsage = cameraPerfmons.map((perfmon) => {
    return {
      x: tryValue(function () {
        return perfmon.upDated;
      }),
      y: tryValue(function () {
        return (perfmon.mem.used / perfmon.mem.total / 8) * 100;
      }),
    };
  });

  diskUsage = cameraPerfmons.map((perfmon) => {
    return {
      x: tryValue(function () {
        return perfmon.upDated;
      }),
      y: tryValue(function () {
        return (perfmon.fsSize[2].get('used') / perfmon.fsSize[2].get('size') / 8) * 100;
      }),
    };
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

Router.get('/:nodeName/config', requiresAuth(), async (req, res) => {
  let camera = await Cameras.findOne({ nodeName: req.params.nodeName });
  var cameraConfig;

  try {
    models = await CameraConfigurations.findOne({ cameraName: req.params.nodeName });
    cameraConfig = models.cameraConfiguration;
  } catch {
    new CameraConfigurations({
      cameraName: camera.nodeName,
      cameraConfiguration: '{}',
    }).save();

    cameraConfig = '{}';
  }

  res.render('management-camera-config', {
    title: 'Camera Config',
    cameraName: camera.nodeName,
    cameraConfig: cameraConfig,
  });
});

Router.get('/:nodeName/config/update', requiresAuth(), async (req, res) => {
  await CameraConfigurations.findOneAndUpdate(
    {
      cameraName: req.params.nodeName,
    },
    {
      cameraConfiguration: JSON.parse(req.query.config),
    }
  );

  res.redirect('/management');
});

function tryValue(tryFunction) {
  try {
    return tryFunction();
  } catch {
    return null;
  }
}

function defaultPerfmon(cameraName) {
  return {
    fsSize: [
      {
        fs: '',
        type: '',
        size: 0.0,
        used: 0.0,
        available: 0.0,
        mount: '',
      },
    ],
    camera: cameraName,
    currentLoad: {
      avgLoad: 0,
      currentLoad: 0.0,
      currentLoadUser: 0.0,
    },
    mem: {
      total: 0.0,
      free: 0.0,
      used: 0.0,
      available: 0.0,
    },
    cpuTemperature: {
      main: 0.0,
    },
    upDated: Date.now(),
  };
}

module.exports = Router;
