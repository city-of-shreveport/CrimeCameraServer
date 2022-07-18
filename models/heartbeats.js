const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const schema = mongoose.Schema({
  node: { type: String, default: '' },
  health: {
    ramdiskHealthy: { type: Boolean, default: false },
    configHealthy: { type: Boolean, default: false },
    firewallHealthy: { type: Boolean, default: false },
    drivesHealthy: { type: Boolean, default: false },
    videosAreRecording: { type: Boolean, default: false }
  },
  // Default
  createdAt: { type: Date, default: Date.now, expires: 3600 },
  updatedAt: Date,
});

module.exports = mongoose.model('Heartbeats', schema);
