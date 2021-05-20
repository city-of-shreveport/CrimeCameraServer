const Express = require('express');
const Nodes = require('../models/nodes');
const PerfMons = require('../models/perfMons');
const Router = Express.Router();
const { requiresAuth } = require('express-openid-connect');

require('dotenv').config();

Router.get('/get-config', async (req, res) => {
  if (isAuthorized(req.query.token)) {
    const node = await Nodes.findOne({ name: req.query.node });

    if (node) {
      res.json(node);
    } else {
      newNode = await new Nodes({
        name: req.query.node,
      }).save();

      new PerfMons({ node: newNode }).save();
      const node = new Nodes({ name: req.query.node });
      await node.save();
      res.json(node);
    }
  } else {
    res.json(unauthrizedMessage());
  }
});

function isAuthorized(token) {
  if (token == process.env.API_KEY) {
    return true;
  } else {
    return false;
  }
}

function unauthrizedMessage() {
  return { message: 'You are not authorized to access this resource.' };
}

module.exports = Router;
