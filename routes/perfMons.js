var express = require('express');
var router = express.Router();
var perfMons = require('../models/perfMons');
const { spawn } = require('child_process');
var nodes = require('../models/nodes')
var { formatArguments } = require('../helperFunctions');
const fetch = require('node-fetch');
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
  let nodePerfmon = req.body
  nodePerfmon.cameraStatus = {}
  nodes.findOne({ name: req.body.node }, function (err, doc) {
   const nmapScan = spawn(
    'nmap',  ['-p', '554-556', doc.config.ip]
    );
    nmapScan.stdout.on('data', (data) => {
      var dataStringSplit = data.toString().split("\n")
      for(i=0;i<dataStringSplit.length;i++){
        if(dataStringSplit[i].includes('554') && dataStringSplit[i].includes('open')){
          nodePerfmon.cameraStatus.camera1 = true
        }
        if(dataStringSplit[i].includes('555') && dataStringSplit[i].includes('open')){
            nodePerfmon.cameraStatus.camera2 = true
        }
        if(dataStringSplit[i].includes('556') && dataStringSplit[i].includes('open')){
            nodePerfmon.cameraStatus.camera3 = true
        }  
      }
      new perfMons(nodePerfmon).save();
      res.end();
    });

  })
});

router.get('/:nodeName', async (req, res) => {
  perfMons
    .find({ node: req.params.nodeName })
    .sort([['createdAt', 'desc']])
    .limit(60)
    .exec(function (err, docs) {
      if (err) {
      } else {
        res.send(docs);
      }
    });
});

router.get('/streamstatistics/:ip', async (req, res) => {
  fetch('http://10.10.10.10:8000/api/streams')
    .then(res => res.json())
    .then(json => res.send(json));

});
router.get('/restreamerserverstatistics/:ip', async (req, res) => {
  fetch('http://10.10.10.10:8000/api/server')
    .then(res => res.json())
    .then(json => res.send(json));

});
module.exports = router;
