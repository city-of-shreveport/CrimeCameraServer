const mongoose = require('mongoose');

const schema = mongoose.Schema({
  cameraName: String,
  cameraConfiguration: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
});

module.exports = mongoose.model('CameraConfigurations', schema);
