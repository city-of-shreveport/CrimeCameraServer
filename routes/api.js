const Express = require('express');
const Router = Express.Router();
const { requiresAuth } = require('express-openid-connect');
const CameraConfigurations = require('../models/cameraconfigurations');
const Cameras = require('../models/cameras');
const Perfmons = require('../models/perfmons');

require('dotenv').config();

Router.get('/get-config', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    cameraConfig = await CameraConfigurations.findOne({ cameraName: req.query.camera });

    if (cameraConfig) {
      res.json(cameraConfig);
    } else {
      await new Cameras({
        nodeName: req.query.camera,
        ip: 'CONFIGURE',
      }).save();

      new Perfmons(defaultPerfmon(req.query.camera)).save();

      let cameraConfig = new CameraConfigurations(defaultCameraConfiguration(req.query.camera));
      await cameraConfig.save();

      res.json(cameraConfig);
    }
  } else {
    res.json(unauthrizedMessage());
  }
});

function isAuthorized(token) {
  if (token == process.env.API_KEY) {
    return true;
  } else {
    return false;
  }
}

function unauthrizedMessage() {
  return { message: 'You are not authorized to access this resource.' };
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

function defaultCameraConfiguration(cameraName) {
  return {
    cameraName: cameraName,
    cameraConfiguration: {
      hostName: '',
      hostIP: '',
      locationLat: 0.0,
      locationLong: 0.0,
      zeroTierNetworkID: '',
      videoDrivePath: '',
      videoDriveMountPath: '',
      videoDriveEncryptionKey: '',
      serverURL: '',
      numberOfCameras: 0,
      neighborDrives: [''],
      cameras: [
        {
          iPAddress: '',
          type: '',
          direction: 0,
          username: '',
          password: '',
          cameraFolderName: '',
        },
      ],
    },
  };
}

module.exports = Router;
