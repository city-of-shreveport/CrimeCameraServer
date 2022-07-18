const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
const AdminJSMongoose = require('@adminjs/mongoose')

AdminJS.registerAdapter(AdminJSMongoose)

var nodes = require('../models/nodes');
var heartbeats = require('../models/heartbeats');

const express = require('express')
const app = express()

const adminJs = new AdminJS({
  databases: [],
  rootPath: '/admin',
  resources: [
    { resource: nodes, options: { 
      listProperties: ['name', 'lastCheckIn', 'config.ip', 'config.locationLat', 
                       'config.locationLong'],

      editProperties: ['name', 'config.ip', 'config.locationLat', 'config.locationLong', 
                       'config.videoDriveDevicePath', 
                       'config.videoDriveMountPath',
                       'config.videoDriveEncryptionKey',
                       'config.buddyDriveDevicePath',
                       'config.buddyDriveMountPath',
                       'config.buddyDriveEncryptionKey'],
      
      showProperties: ['name', 'config.ip', 'lastCheckIn', 'config.locationLat', 'config.locationLong', 
                       'config.videoDriveDevicePath', 
                       'config.videoDriveMountPath',
                       'config.videoDriveEncryptionKey',
                       'config.buddyDriveDevicePath',
                       'config.buddyDriveMountPath',
                       'config.buddyDriveEncryptionKey'],
      sort: {
        sortBy: 'lastCheckIn', direction: 'desc'
      }
    } },
    { resource: heartbeats, options: {
      sort: {
        sortBy: 'createdAt', direction: 'desc'
      }
    }}
  ]
})

const adminRouter = AdminJSExpress.buildRouter(adminJs)

module.exports = { adminJs, adminRouter } 
