const mongoose = require('mongoose');

const schema = mongoose.Schema({
  cameraConfiguration: [{
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  }],
});

module.exports = mongoose.model('CameraConfigurationsTEST', schema);
