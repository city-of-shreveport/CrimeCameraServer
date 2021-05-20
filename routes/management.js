const Express = require('express');
const Moment = require('moment');
const Nodes = require('../models/nodes');
const PerfMons = require('../models/perfMons');
const Router = Express.Router();
const { tryFunction } = require('../helperFunctions');
const { requiresAuth } = require('express-openid-connect');

Router.get('/', requiresAuth(), async (req, res) => {
  const Nodes = await Nodes.find({});
  var nodeData = [];

  for (var node of Nodes) {
    latestPerfMon = await PerfMons.findOne({
      node: node._id,
    }).sort({ updatedAt: -1 });

    if (latestPerfMon == null) {
      const newPerfMon = await new PerfMons({ node: node._id }).save();
      node.latestPerfMon = newPerfMon;
    } else {
      node.latestPerfMon = latestPerfMon;
    }

    nodeData.push(node);
  }

  res.render('management/index', {
    title: 'Management',
    nodeData: nodeData,
  });
});

Router.get('/:nodeName', requiresAuth(), async (req, res) => {
  let node = await Nodes.findOne({ name: req.params.nodeName });

  let nodePerfMons = await PerfMons.find({
    node: node._id,
  })
    .sort({ updatedAt: -1 })
    .limit(30);

  nodePerfMons = nodePerfMons.reverse();

  PerfMonDates = nodePerfMons.map((PerfMon) => {
    return Moment(PerfMon.updatedAt).tz('America/Chicago').format('h:mm:ss a');
  });

  avgLoad = nodePerfMons.map((PerfMon) => {
    return {
      x: tryValue(function () {
        return PerfMon.updatedAt;
      }),
      y: tryValue(function () {
        return PerfMon.currentLoad.avgLoad;
      }),
    };
  });

  currentLoad = nodePerfMons.map((PerfMon) => {
    return {
      x: tryValue(function () {
        return PerfMon.updatedAt;
      }),
      y: tryValue(function () {
        return PerfMon.currentLoad.currentLoad;
      }),
    };
  });

  currentLoadUser = nodePerfMons.map((PerfMon) => {
    return {
      x: tryValue(function () {
        return PerfMon.updatedAt;
      }),
      y: tryValue(function () {
        PerfMon.currentLoad.currentLoadUser;
      }),
    };
  });

  cpuTemperature = nodePerfMons.map((PerfMon) => {
    return {
      x: tryValue(function () {
        return PerfMon.updatedAt;
      }),
      y: tryValue(function () {
        return PerfMon.cpuTemperature.main;
      }),
    };
  });

  memUsage = nodePerfMons.map((PerfMon) => {
    return {
      x: tryValue(function () {
        return PerfMon.updatedAt;
      }),
      y: tryValue(function () {
        return (PerfMon.mem.used / PerfMon.mem.total / 8) * 100;
      }),
    };
  });

  diskUsage = nodePerfMons.map((PerfMon) => {
    return {
      x: tryValue(function () {
        return PerfMon.updatedAt;
      }),
      y: tryValue(function () {
        return (PerfMon.fsSize[2].get('used') / PerfMon.fsSize[2].get('size') / 8) * 100;
      }),
    };
  });

  res.render('management/nodes', {
    title: 'Node Information',
    node: node,
    PerfMonDates: PerfMonDates,
    avgLoad: avgLoad,
    currentLoad: currentLoad,
    currentLoadUser: currentLoadUser,
    cpuTemperature: cpuTemperature,
    memUsage: memUsage,
    diskUsage: diskUsage,
  });
});

Router.get('/:nodeName/config', requiresAuth(), async (req, res) => {
  try {
    const node = await Nodes.findOne({ name: req.params.nodeName });

    res.render('management/nodeConfig', {
      title: 'Node Config',
      name: node.name,
      config: node.config,
    });
  } catch {
    const node = await new Nodes({
      name: req.params.nodeName,
    }).save();

    res.render('management/nodeConfig', {
      title: 'Node Config',
      name: node.name,
      config: node.config,
    });
  }
});

Router.get('/:nodeName/config/update', requiresAuth(), async (req, res) => {
  await Nodes.findOneAndUpdate(
    {
      name: req.params.nodeName,
    },
    {
      config: JSON.parse(req.query.config),
    }
  );

  res.redirect('/management');
});

module.exports = Router;
