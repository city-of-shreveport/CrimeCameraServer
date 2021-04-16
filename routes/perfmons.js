const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const perfmons = require('../models/perfmons');
const moment = require('moment-timezone');

router.get('/haha', requiresAuth(), async (req, res) => {
  console.log('HAHA:');
  res.end('HAHAHA');
});

router.get('/getPerfDataNode/:node', requiresAuth(), async (req, res) => {
  const nodeName = req.params.node;
  perfmons
    .find({ camera: nodeName })
    .sort([['DateTime', 1]])
    .exec(function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        res.send(docs);
      }
    });
});

router.post('/adddata/:node', requiresAuth(), async (req, res) => {
  const perf = new perfmons(req);
  perf.camera = req.body.node;
  await perf.save();
  res.send(perf);
});

module.exports = router;
