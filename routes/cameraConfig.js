var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var { formatArguments } = require('../helperFunctions');
let user = 'admin';
let authpass = 'admin';
let digester = require('request-digest')(user, authpass);
let digesterHTTP = require('http-digest-client')(user, authpass);
var nodes = require('../models/nodes');


router.get('/snapshot/:nodeName/:camera', async (req, res) => {
    var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var cameraPortNumber = 80
  var cameraIP
      nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
      
    } else {
      cameraIP = doc.config.ip
    
var requestedData
   switch(camera) {
  case 'camera2':
    cameraPortNumber = 82
    break;
  case 'camera3':
    cameraPortNumber = 83
    break;
  default:
   cameraPortNumber = 81
}
  digesterHTTP.request({
        host: cameraIP,
        path: `/cgi-bin/snapshot.cgi?channel=1`,
        port: cameraPortNumber,
        method: 'GET',
        headers: {
            "Realm": "Login to AMR0138597CD51AC7",
            "keepAliveSocket": true
        }
    }, function(data) {
        //receiving the data stream from the NVR to be saved to file
        data.on('data', function(data) {
            requestedData = data
            res.write(requestedData)
            
        });
        data.on('error', function(err) {
            console.log('oh noes');
        });
        //whent he server send the end header, we then start downloading the next video channel 
        data.on('end', function() {
            res.end()
        })

       
    })

}})




})


router.get('/settings/:nodeName/:camera', async (req, res) => {
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var cameraPortNumber = 81
  var cameraIP
var requestedData
nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
      
    } else {
      cameraIP = doc.config.ip
      console.log(doc.config.ip)
      var settings = {}

   switch(camera) {
  case 'camera2':
    cameraPortNumber = 82
    break;
  case 'camera3':
    cameraPortNumber = 83
    break;
  default:
   cameraPortNumber = 81
}
digester.requestAsync({
  host: 'http://' + cameraIP,
  path: '/cgi-bin/configManager.cgi?action=getConfig&name=Encode',
  port: cameraPortNumber,
  method: 'GET',
  excludePort: false,
  headers: {
    "Realm": "Login to AMR0138597CD51AC7",
            "keepAliveSocket": true
  }
})
.then(function (response) {
  console.log(response.body);
  res.write(response.body)
  res.end()
})
.catch(function (error) {

  console.log(error.body);
});

}})
   
 
});

router.get('/stop/:nodeName', async (req, res) => {
  var nodeName = req.params.nodeName;

});

module.exports = router;
