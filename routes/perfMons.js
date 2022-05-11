var express = require('express');
var router = express.Router();
var perfMons = require('../models/perfMons');
const { spawn } = require('child_process');
var nodes = require('../models/nodes');
var { formatArguments } = require('../helperFunctions');
const fetch = require('node-fetch');
const { SlowBuffer } = require('buffer');
router.get('/', async (req, res) => {
  perfMons.find({}, function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      var response = [];
    }
    res.send(docs);
  });
});

router.post('/', async (req, res) => {
  let nodePerfmon = req.body;
  let nmapScan = null;
  nodePerfmon.cameraStatus = {};
  nodes.findOne({ name: req.body.node }, function (err, doc) {
    if (doc) {
      nmapScan = spawn('nmap', ['-p', '554-556', doc.config.ip]);

      nmapScan.stdout.on('data', (data) => {
        var dataStringSplit = data.toString().split('\n');
        for (i = 0; i < dataStringSplit.length; i++) {
          if (dataStringSplit[i].includes('554') && dataStringSplit[i].includes('open')) {
            nodePerfmon.cameraStatus.camera1 = true;
          }
          if (dataStringSplit[i].includes('555') && dataStringSplit[i].includes('open')) {
            nodePerfmon.cameraStatus.camera2 = true;
          }
          if (dataStringSplit[i].includes('556') && dataStringSplit[i].includes('open')) {
            nodePerfmon.cameraStatus.camera3 = true;
          }
          if (dataStringSplit[i].includes('554') && dataStringSplit[i].includes('filtered')) {
            nodePerfmon.cameraStatus.camera1 = false;
          }
          if (dataStringSplit[i].includes('555') && dataStringSplit[i].includes('filtered')) {
            nodePerfmon.cameraStatus.camera2 = false;
          }
          if (dataStringSplit[i].includes('556') && dataStringSplit[i].includes('filtered')) {
            nodePerfmon.cameraStatus.camera3 = false;
          }
        }

        new perfMons(nodePerfmon).save();
        res.end();
      });
    } else {
      new perfMons(nodePerfmon).save();
      res.end();
    }
  });
});

router.get('/:nodeName', async (req, res) => {
  perfMons
    .find({ node: req.params.nodeName })
    .sort([['createdAt', -1]])
    .limit(20)
    .exec(function (err, docs) {
      if (err) {
      } else {
        res.send(docs);
      }
    });
});
router.get('/latest/:nodeName', async (req, res) => {
  perfMons
    .find({ node: req.params.nodeName })
    .sort([['createdAt', -1]])
    .limit(1)
    .exec(function (err, docs) {
      if (err) {
      } else {
        res.send(docs);
        console.log(docs)
      }
    });
});
module.exports = router;
