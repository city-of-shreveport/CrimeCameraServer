const Express = require('express');
const PerfMons = require('../models/perfMons');
const Router = Express.Router();
const { isAuthorized, unauthrizedMessage } = require('../helperFunctions');

Router.get('/getPerfDataNode/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    PerfMons.find({ node: Nodes.findOne({ name: req.params.node })._id })
      .sort([['dateTime', 1]])
      .exec(function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          res.send(docs);
        }
      });
  } else {
    res.json(unauthrizedMessage());
  }
});

Router.post('/addData/:nodeName', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    const PerfMon = new PerfMons(req.params);
    PerfMon.node = Nodes.findOne({ name: req.params.nodeName })._id;
    await PerfMon.save();
    res.send(PerfMon);
  } else {
    res.json(unauthrizedMessage());
  }
});

module.exports = Router;
