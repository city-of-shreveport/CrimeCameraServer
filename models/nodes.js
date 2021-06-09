const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const schema = mongoose.Schema({
  name: { type: String, default: '' },
  ip: { type: String, default: 'CONFIGURE' },
  lastCheckIn: { type: Date, default: new Date() },
  sysInfo: {
    memLayout: [
      {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    ],
    diskLayout: [
      {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    ],
    cpu: { type: Map, of: mongoose.Schema.Types.Mixed },
    osInfo: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  config: {
    hostName: { type: String, default: '' },
    locationLat: { type: Number, default: 0 },
    locationLong: { type: Number, default: 0 },
    zeroTierNetworkID: { type: String, default: '' },
    zeroTierIP: { type: String, default: '' },
    videoDriveDevicePath: { type: String, default: '' },
    videoDriveMountPath: { type: String, default: '' },
    videoDriveEncryptionKey: { type: String, default: '' },
    buddyDriveDevicePath: { type: String, default: '' },
    buddyDriveMountPath: { type: String, default: '' },
    buddyDriveEncryptionKey: { type: String, default: '' },
    serverURL: { type: String, default: '' },
    buddyDrives: {
      buddy1: {
        hostName: { type: String, default: '' },
        sshfsMountPath: { type: String, default: '' },
      },
      buddy2: { hostName: { type: String, default: '' }, sshfsMountPath: { type: String, default: '' } },
    },
    cameras: {
      camera1: {
        ip: { type: String, default: 'CONFIGURE' },
        type: { type: String, default: 'Standard' },
        direction: { type: Number, default: 0 },
        username: { type: String, default: 'admin' },
        password: { type: String, default: 'admin' },
        folderName: { type: String, default: '' },
        onlineStatus: { type: Boolean, default: false },
      },
      camera2: {
        ip: { type: String, default: 'CONFIGURE' },
        type: { type: String, default: 'Standard' },
        direction: { type: Number, default: 0 },
        username: { type: String, default: 'admin' },
        password: { type: String, default: 'admin' },
        folderName: { type: String, default: '' },
        onlineStatus: { type: Boolean, default: false },
      },
      camera3: {
        ip: { type: String, default: 'CONFIGURE' },
        type: { type: String, default: 'Standard' },
        direction: { type: Number, default: 0 },
        username: { type: String, default: 'admin' },
        password: { type: String, default: 'admin' },
        folderName: { type: String, default: '' },
        onlineStatus: { type: Boolean, default: false },
      },
    },
  },

  // Default properties.
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('Nodes', schema);
