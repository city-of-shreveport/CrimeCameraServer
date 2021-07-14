var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var { formatArguments } = require('../helperFunctions');
let user = 'admin';
let authpass = 'UUnv9njxg123';
let digester = require('request-digest')(user, authpass);
let digesterHTTP = require('http-digest-client')(user, authpass);
var nodes = require('../models/nodes');

router.get('/snapshot/:nodeName/:camera', async (req, res) => {
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var cameraPortNumber = 80;
  var cameraIP;
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
    } else {
      cameraIP = doc.config.ip;
      var requestedData;
      switch (camera) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }
      digesterHTTP.request(
        {
          host: cameraIP,
          path: `/cgi-bin/snapshot.cgi?channel=1`,
          port: cameraPortNumber,
          method: 'GET',
          headers: {
            Realm: 'Login to AMR0138597CD51AC7',
            keepAliveSocket: true,
          },
        },
        function (data) {
          data.on('data', function (data) {
            requestedData = data;
            res.write(requestedData);
          });
          data.on('error', function (err) {
            console.log('oh noes');
          });
          //whent he server send the end header, we then start downloading the next video channel
          data.on('end', function () {
            res.end();
          });
        }
      );
    }
  });
});

router.get('/videoColorConfig/:nodeName/:camera', async (req, res) => {
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var cameraPortNumber = 81;
  var cameraIP;
  var requestedData;
  var obj = {
    Camera: camera,
    Brightness: '',
    ChromaSuppress: '',
    Contrast: '',
    Gamma: '',
    Hue: '',
    Saturation: '',
    Style: '',
    TimeSection: '',
  };
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
    } else {
      cameraIP = doc.config.ip;

      var settings = {};
      switch (camera) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }
      digester
        .requestAsync({
          host: 'http://' + cameraIP,
          path: '/cgi-bin/configManager.cgi?action=getConfig&name=VideoColor',
          port: cameraPortNumber,
          method: 'GET',
          excludePort: false,
          headers: {
            Realm: 'Login to AMR0138597CD51AC7',
            keepAliveSocket: true,
          },
        })
        .then(function (response) {
          var stringResponse = response.body.split('\r\n');
          for (i = 0; i < stringResponse.length; i++) {
            var stringAfterSplit = stringResponse[i].toString().split('.');

            if (stringAfterSplit[1] == 'VideoColor[0][0]') {
              var stringAfterThirdSplit = stringAfterSplit[2].toString().split('=');

              obj[stringAfterThirdSplit[0]] = stringAfterThirdSplit[1];
            }
          }
        })
        .then(function () {
          res.send(obj);
          res.end();
        });
    }
  });
});

router.get('/setvideoColorConfig/:nodeName/:camera/:setting/:value', async (req, res) => {
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var cameraPortNumber = 81;
  var setting = req.params.setting;
  var value = req.params.value;
  var cameraIP;
  var requestedData;
  var url;
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
    } else {
      cameraIP = doc.config.ip;
      console.log(doc.config.ip);
      var settings = {};
      switch (setting) {
        case 'Brightness':
          url = '/cgi-bin/configManager.cgi?action=setConfig&VideoColor[0][0].Brightness=' + value;
          break;
        case 'Contrast':
          url = '/cgi-bin/configManager.cgi?action=setConfig&VideoColor[0][0].Contrast=' + value;
          break;
        case 'Hue':
          url = '/cgi-bin/configManager.cgi?action=setConfig&VideoColor[0][0].Hue=' + value;
          break;
        case 'Saturation':
          url = '/cgi-bin/configManager.cgi?action=setConfig&VideoColor[0][0].Saturation=' + value;
          break;
      }
      switch (camera) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }

      digester
        .requestAsync({
          host: 'http://' + cameraIP,
          path: url,
          port: cameraPortNumber,
          method: 'GET',
          excludePort: false,
          headers: {
            Realm: 'Login to AMR0138597CD51AC7',
            keepAliveSocket: true,
          },
        })
        .then(function (response) {
          console.log(response.body);
          res.write(response.body);
          res.end();
        })
        .catch(function (error) {
          console.log(error);
          res.end();
        });
    }
  });
});

router.get('/settime/:nodeName/:camera/:time', async (req, res) => {
  //Time format 2016-01-01%2021:02:32 2016-01-01 21:02:32 YYYY-MM-DD HH:MM:SS
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var time = req.params.time;
  var cameraPortNumber = 81;
  var cameraIP;
  var requestedData;
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
    } else {
      cameraIP = doc.config.ip;
      console.log(doc.config.ip);
      var settings = {};

      switch (camera) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }
      digester
        .requestAsync({
          host: 'http://' + cameraIP,
          path: '/cgi-bin/global.cgi?action=setCurrentTime&time=' + time,
          port: cameraPortNumber,
          method: 'GET',
          excludePort: false,
          headers: {
            Realm: 'Login to AMR0138597CD51AC7',
            keepAliveSocket: true,
          },
        })
        .then(function (response) {
          console.log('respoionce');
          console.log(response.body);
          res.write(response.body);
          res.end();
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });
});
router.get('/time/:nodeName/:camera', async (req, res) => {
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var cameraPortNumber = 81;
  var cameraIP;
  var requestedData;
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
    } else {
      cameraIP = doc.config.ip;
      console.log(doc.config.ip);
      var settings = {};

      switch (camera) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }
      digester
        .requestAsync({
          host: 'http://' + cameraIP,
          path: '/cgi-bin/global.cgi?action=getCurrentTime',
          port: cameraPortNumber,
          method: 'GET',
          excludePort: false,
          headers: {
            Realm: 'Login to AMR0138597CD51AC7',
            keepAliveSocket: true,
          },
        })
        .then(function (response) {
          var resultSplit = response.body.toString().split('\r');
          var resultSplitClean = resultSplit[0].toString().split('=');
          var obj = { time: resultSplitClean[1] };

          res.send(obj);
          res.end();
        })
        .catch(function (error) {
          console.log(error);
          res.end();
        });
    }
  });
});

router.get('/networkSettings/:nodeName/:camera', async (req, res) => {
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var cameraPortNumber = 81;
  var cameraIP;
  var requestedData;
  var obj = {
    DefaultInterface: '',
    Domain: '',
    Hostname: '',
    DefaultGateway: '',
    DhcpEnable: '',
    DnsServer1: '',
    DnsServer2: '',
    EnableDhcpReservedIP: '',
    IPAddress: '',
    MTU: '',
    PhysicalAddress: '',
    SubnetMask: '',
  };
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
    } else {
      cameraIP = doc.config.ip;
      console.log(doc.config.ip);
      var settings = {};

      switch (camera) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }
      digester
        .requestAsync({
          host: 'http://' + cameraIP,
          path: '/cgi-bin/configManager.cgi?action=getConfig&name=Network',
          port: cameraPortNumber,
          method: 'GET',
          excludePort: false,
          headers: {
            Realm: 'Login to AMR0138597CD51AC7',
            keepAliveSocket: true,
          },
        })
        .then(function (response) {
          /*


         */

          var stringResponse = response.body.split('\r\n');
          for (i = 0; i < stringResponse.length; i++) {
            var stringAfterSplit = stringResponse[i].toString().split('=');

            var stringAfterSecondSplit = stringAfterSplit[0].toString().split('.');
            if (stringAfterSecondSplit[2] === 'eth0') {
              if (stringAfterSecondSplit[3] === 'DnsServers[0]') {
                obj['DnsServer1'] = stringAfterSplit[1];
              } else if (stringAfterSecondSplit[3] === 'DnsServers[1]') {
                obj['DnsServer2'] = stringAfterSplit[1];
              } else {
                obj[stringAfterSecondSplit[3]] = stringAfterSplit[1];
              }
            } else {
              obj[stringAfterSecondSplit[2]] = stringAfterSplit[1];
            }
          }
        })
        .then(function () {
          res.send(obj);
          res.end();
        });
    }
  });
});
router.get('/setnetworkSettings/:nodeName/:camera/:settings', async (req, res) => {
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var settings = req.params.settings;
  var cameraPortNumber = 81;
  var cameraIP;
  var requestedData;
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
    } else {
      cameraIP = doc.config.ip;
      console.log(doc.config.ip);
      var settings = {};
      var url = 'cgi-bin/configManager.cgi?action=setConfig&NetWork.';
      switch (setting) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }

      switch (camera) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }
      digester
        .requestAsync({
          host: 'http://' + cameraIP,
          path: '/cgi-bin/configManager.cgi?action=getConfig&name=Network',
          port: cameraPortNumber,
          method: 'GET',
          excludePort: false,
          headers: {
            Realm: 'Login to AMR0138597CD51AC7',
            keepAliveSocket: true,
          },
        })
        .then(function (response) {
          console.log('respoionce');
          console.log(response.body);
          res.write(response.body);
          res.end();
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });
});
router.get('/encodeConfigCapability/:nodeName/:camera', async (req, res) => {
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var cameraPortNumber = 81;
  var cameraIP;
  var requestedData;
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
    } else {
      cameraIP = doc.config.ip;
      console.log(doc.config.ip);
      var settings = {};
      switch (camera) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }
      digester
        .requestAsync({
          host: 'http://' + cameraIP,
          path: '/cgi-bin/encode.cgi?action=getConfigCaps&channel=1',
          port: cameraPortNumber,
          method: 'GET',
          excludePort: false,
          headers: {
            Realm: 'Login to AMR0138597CD51AC7',
            keepAliveSocket: true,
          },
        })
        .then(function (response) {
          console.log(response.body);
          res.write(response.body);
          res.end();
        })
        .catch(function (error) {
          console.log(error.body);
          res.end();
        });
    }
  });
});

router.get('/settings/:nodeName/:camera', async (req, res) => {
  var nodeName = req.params.nodeName;
  var camera = req.params.camera;
  var cameraPortNumber = 81;
  var cameraIP;
  var requestedData;
  var obj = {
    resolution: '',
    BitRate: '',
    BitRateControl: '',
    Compression: '',
    CustomResolutionName: '',
    FPS: '',
    GOP: '',
    Height: '',
    Pack: '',
    Profile: '',
    Quality: '',
    QualityRange: '',
    SVCTLayer: '',
    Width: '',
  };
  nodes.findOne({ name: req.params.nodeName }, function (err, doc) {
    if (err) {
    } else {
      cameraIP = doc.config.ip;
      console.log(doc.config.ip);
      var settings = {};

      switch (camera) {
        case 'camera2':
          cameraPortNumber = 82;
          break;
        case 'camera3':
          cameraPortNumber = 83;
          break;
        default:
          cameraPortNumber = 81;
      }
      digester
        .requestAsync({
          host: 'http://' + cameraIP,
          path: '/cgi-bin/configManager.cgi?action=getConfig&name=Encode',
          port: cameraPortNumber,
          method: 'GET',
          excludePort: false,
          headers: {
            Realm: 'Login to AMR0138597CD51AC7',
            keepAliveSocket: true,
          },
        })
        .then(function (response) {
          var stringResponse = response.body.split('\r\n');
          for (i = 0; i < stringResponse.length; i++) {
            var stringAfterSplit = stringResponse[i].toString().split('=');

            var stringAfterThirdSplit = stringAfterSplit[0].toString().split('.');
            console.log(stringAfterThirdSplit[3]);
            if (stringAfterThirdSplit[3] === 'Video') {
              obj[stringAfterThirdSplit[4]] = stringAfterSplit[1];
            }
          }
        })
        .then(function () {
          console.log(obj);
          res.send(obj);
          res.end();
        });
    }
  });
});
var cameraStatus = {
  camera1: false,
  camera2: false,
  camera3: false,
};
function camLoginConfigured(nodeIP, port, camera) {
  return new Promise((resolve) => {
    digester
      .requestAsync({
        host: 'http://' + nodeIP,
        path: '/cgi-bin/configManager.cgi?action=getConfig&name=Encode',
        port: port,
        method: 'GET',
        excludePort: false,
        headers: {
          Realm: 'Login to AMR0138597CD51AC7',
          keepAliveSocket: true,
        },
      })
      .then(function (response) {
        cameraStatus[camera] = true;
        result = true;
        console.log(result);
        resolve(result);
      })
      .catch(function (error) {
        cameraStatus[camera] = false;
        result = false;
        console.log(result);
        resolve(result);
      });
  });
}

router.get('/checkCameraLogin/:nodeName/', async (req, res) => {
  var nodeName = req.params.nodeName;
  var nodeIP = '';

  async function asyncCall(doc, port, camera) {
    nodeIP = doc.config.ip;
    const result = await camLoginConfigured(nodeIP, port, camera);
    return result;
  }
  nodes.findOne({ name: nodeName }, function (err, doc) {
    if (err) {
    } else {
      asyncCall(doc, 81, 'camera1')
        .then(result)(console.log(result))
        .then(asyncCall(doc, 83, 'camera3').then(res.send(cameraStatus)));
    }
  });
});

module.exports = router;
