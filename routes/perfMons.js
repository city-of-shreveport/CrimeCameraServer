var express = require('express');
var router = express.Router();
var perfMons = require('../models/perfMons');
const { spawn } = require('child_process');
var nodes = require('../models/nodes')
var { formatArguments } = require('../helperFunctions');
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
  let cameraStatus = {


  }
  let nodePerfmon = req.body
  nodes.findOne({ name: req.body.node }, function (err, doc) {

   const nmapScan = spawn(
    'nmap',  ['-p', '554-556', doc.config.ip]
   
  );

  nmapScan.stdout.on('data', (data) => {

    var dataStringSplit = data.toString().split("\n")

    for(i=0;i<dataStringSplit.length;i++){

      if(dataStringSplit[i].includes('554') && dataStringSplit[i].includes('open')){
        cameraStatus.camera1 = true

        
      }
      if(dataStringSplit[i].includes('555') && dataStringSplit[i].includes('open')){
          cameraStatus.camera2 = true
      

      }
      if(dataStringSplit[i].includes('556') && dataStringSplit[i].includes('open')){
          cameraStatus.camera3 = true


      }
  console.log('cameraStatus')
  console.log(cameraStatus)
  new perfMons(nodePerfmon).save();
nodePerfmon.cameraStatus = cameraStatus
nodes
    .findOneAndUpdate({ name: req.params.nodeName }, { $set: { cameraStatus: cameraStatus} })
    .exec(function (err, node) {
      if (err) {
        
      } else {
        
      }
    });
  
  }

res.end();
});


      
 

})
});

router.get('/:nodeName', async (req, res) => {
  perfMons
    .find({ node: req.params.nodeName })
    .sort([['dateTime', -1]])
    .limit(60)
    .exec(function (err, docs) {
      if (err) {
      } else {
        res.send(docs);
      }
    });
});

module.exports = router;
