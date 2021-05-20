const Express = require('express');
const PerfMons = require('../models/perfMons');
const Router = Express.Router();
const { requiresAuth } = require('express-openid-connect');

Router.get('/getPerfDataNode/:nodeName', requiresAuth(), async (req, res) => {
  PerfMons.find({ node: Nodes.findOne({ name: req.params.node })._id })
    .sort([['dateTime', 1]])
    .exec(function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        res.send(docs);
      }
    });
});

Router.post('/addData/:nodeName', requiresAuth(), async (req, res) => {
  const PerfMon = new PerfMons(req.params);
  PerfMon.node = Nodes.findOne({ name: req.params.nodeName })._id;
  await PerfMon.save();
  res.send(PerfMon);
});

module.exports = Router;
