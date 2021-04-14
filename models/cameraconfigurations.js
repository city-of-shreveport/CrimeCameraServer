const mongoose = require('mongoose');

const schema = mongoose.Schema({
  cameraName: String,
  cameraConfiguration: String,
});

module.exports = mongoose.model('CameraConfigurations', schema);
