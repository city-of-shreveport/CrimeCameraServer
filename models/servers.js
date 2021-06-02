const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const schema = mongoose.Schema({
  name: { type: String, default: 'HOSTNAME' },
  service: {type: String, default: 'Server'},
  ip: { type: String, default: 'CONFIGURE' },
  lastCheckIn: { type: Date, default: new Date() },
  // Default properties.
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('Servers', schema);