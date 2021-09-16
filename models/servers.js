const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const schema = mongoose.Schema({
  name: { type: String, default: '' },
  type: { type: String, default: '' },
  ip: { type: String, default: '' },

  // Default
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('servers', schema);
