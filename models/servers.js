const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const schema = mongoose.Schema({
  name: { type: String, default: '********' },
  service: {type: String, default: '********'},
  zeroTierNetworkID: { type: String, default: '' },
  zeroTierIP: { type: String, default: '' },
// Default properties.
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('Servers', schema);