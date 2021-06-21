const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const schema = mongoose.Schema({
  node: { type: String, default: '' },

  os: {
    arch: { type: String, default: '' },
    platform: { type: String, default: '' },
    release: { type: String, default: '' },
  },
  cpu: {
    num: { type: Number, default: '' },
    load: { type: Number, default: '' },
    model: { type: String, default: '' },
    speed: { type: Number, default: '' },
  },
  mem: {
    totle: { type: Number, default: '' },
    free: { type: Number, default: '' },
  },
  net: {
    inbytes:{ type: Number, default: '' },
    outbytes:{ type: Number, default: '' },
  },
  nodejs: {
    uptime: { type: Number, default: '' },
    version: { type: String, default: '' },
    mem: {
      rss: { type: Number, default: '' },
      heapTotal: { type: Number, default: '' },
      heapUsed: { type: Number, default: '' },
      external: { type: Number, default: '' },
    }
  },
  clients: {
    accepted: { type: Number, default: '' },
    active: { type: Number, default: '' },
    idle: { type: Number, default: '' },
    rtmp: { type: Number, default: '' },
    http: { type: Number, default: '' },
    ws: { type: Number, default: '' },
  },

  // Default properties.
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('streamMons', schema);
