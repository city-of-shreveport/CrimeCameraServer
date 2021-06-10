// require basic
var express = require('express');
var router = express.Router();

// require models
var perfMons = require('../models/perfMons');

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
  new perfMons(req.body).save();
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
