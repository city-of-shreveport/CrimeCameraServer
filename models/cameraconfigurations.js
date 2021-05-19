const mongoose = require('mongoose');

const schema = mongoose.Schema({
  cameraName: String,
  cameraConfiguration: {
        hostName :String,
        locationLat: Number, 
        locationLong :Number,           
        zeroTierNetworkID: String,
        zeroTierIP :String,
        videoDriveDevicePath:String,
        videoDriveMountPath:String,
        videoDriveEncryptionKey:String,
        buddyDriveDevicePath: String,
        buddyDriveMountPath:String,
        buddyDriveEncryptionKey: String,
        serverURL : String,
        buddyDrives : [{
          hostname: String,
          sshfsMountPath: String
        }],
        cameras: [{ 
          iPAddress: String,
          type: String,
          direction:Number,
          username: String,
          password: String,
          cameraFolderName: String
        }]
    },
});

module.exports = mongoose.model('CameraConfigurations', schema);
