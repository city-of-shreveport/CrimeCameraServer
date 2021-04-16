const Express = require('express');
const Router = Express.Router();
const { requiresAuth } = require('express-openid-connect');
const CameraConfigurations = require('../models/cameraconfigurations');
const Cameras = require('../models/cameras');

require('dotenv').config();

Router.get('/get-config', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    cameraConfig = await CameraConfigurations.findOne({ cameraName: req.query.camera });

    res.json(JSON.parse(cameraConfig.cameraConfiguration));
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

module.exports = Router;
