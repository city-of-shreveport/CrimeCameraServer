var express = require('express');
var router = express.Router();
const Cameras = require('../models/cameras');
const Perfmons = require('../models/perfmons');
var express = require('express');
var router = express.Router();
const moment = require('moment');
const { spawn } = require('child_process');
const Mp4Frag = require('mp4frag');
const mp4frag = new Mp4Frag({ hlsPlaylistSize: 3, hlsPlaylistBase: 'camleft' });
const mp4frag2 = new Mp4Frag({ hlsPlaylistSize: 3, hlsPlaylistBase: 'cammid' });
const mp4frag3 = new Mp4Frag({ hlsPlaylistSize: 3, hlsPlaylistBase: 'camright' });

function formatArguments(template) {
  return template
    .replace(/\s+/g, ' ')
    .replace(/\s/g, '\n')
    .split('\n')
    .filter((arg) => (arg != '' ? true : false));
}

const ffmpeg = spawn(
  'ffmpeg',
  formatArguments(`
    -hide_banner
    -loglevel error
    -probesize 64
    -analyzeduration 100000
    -reorder_queue_size 5
    -rtsp_transport tcp
    -i rtsp://admin:UUnv9njxg123@192.168.196.164:555/cam/realmonitor?channel=1&subtype=0
    -an
    -c:v copy
    -f mp4
    -movflags +frag_keyframe+empty_moov+default_base_moof
    -reset_timestamps 1 pipe:1
  `),
  { stdio: ['ignore', 'pipe', 'inherit'] }
);

ffmpeg.stdio[1].pipe(mp4frag);

const ffmpeg2 = spawn(
  'ffmpeg',
  formatArguments(`
    -hide_banner
    -loglevel error
    -probesize 64
    -analyzeduration 100000
    -reorder_queue_size 5
    -rtsp_transport tcp
    -i rtsp://admin:UUnv9njxg123@192.168.196.164:554/cam/realmonitor?channel=1&subtype=0
    -an
    -c:v copy
    -f mp4
    -movflags +frag_keyframe+empty_moov+default_base_moof
    -reset_timestamps 1 pipe:1
  `),
  { stdio: ['ignore', 'pipe', 'inherit'] }
);

ffmpeg2.stdio[1].pipe(mp4frag2);

const ffmpeg3 = spawn(
  'ffmpeg',
  formatArguments(`
    -hide_banner
    -loglevel error
    -probesize 64
    -analyzeduration 100000
    -reorder_queue_size 5
    -rtsp_transport tcp
    -i rtsp://admin:UUnv9njxg123@192.168.196.164:556/cam/realmonitor?channel=1&subtype=0
    -an
    -c:v copy
    -f mp4
    -movflags +frag_keyframe+empty_moov+default_base_moof
    -reset_timestamps 1 pipe:1
  `),
  { stdio: ['ignore', 'pipe', 'inherit'] }
);

ffmpeg3.stdio[1].pipe(mp4frag3);

router.get('/', function (req, res) {
  res.render('index', {
    title: 'Home',
  });
});

router.get('/management', async (req, res) => {
  let cameras = await Cameras.find({});
  var cameraData = [];

  for (var camera of cameras) {
    lastPerfmon = await Perfmons.find({
      camera: camera.nodeName,
    })
      .sort({ upDated: -1 })
      .limit(1);

    camera.lastPerfmon = lastPerfmon[0];
    cameraData.push(camera);
  }

  res.render('management', {
    title: 'Management',
    cameraData: cameraData,
  });
});

router.get('/management/:nodeName', async (req, res) => {
  let camera = await Cameras.find({ nodeName: req.params.nodeName });
  let cameraPerfmons = await Perfmons.find({
    camera: req.params.nodeName,
  })
    .sort({ upDated: -1 })
    .limit(30);

  perfmonDates = cameraPerfmons.map((perfmon) => {
    return moment(perfmon.upDated).format('h:mm:ss a');
  });

  avgLoad = cameraPerfmons.map((perfmon) => {
    return { x: perfmon.upDated, y: perfmon.currentLoad.avgLoad };
  });

  currentLoad = cameraPerfmons.map((perfmon) => {
    return { x: perfmon.upDated, y: perfmon.currentLoad.currentLoad };
  });

  currentLoadUser = cameraPerfmons.map((perfmon) => {
    return { x: perfmon.upDated, y: perfmon.currentLoad.currentLoadUser };
  });

  res.render('management-camera', {
    title: 'Camera Information',
    camera: camera[0],
    perfmonDates: perfmonDates,
    avgLoad: avgLoad,
    currentLoad: currentLoad,
    currentLoadUser: currentLoadUser,
  });
});

router.get('/camleft.m3u8', (req, res) => {
  if (mp4frag.m3u8) {
    res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' });
    res.end(mp4frag.m3u8);
  } else {
    res.sendStatus(503);
  }
});

router.get('/init-camleft.mp4', (req, res) => {
  if (mp4frag.initialization) {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.end(mp4frag.initialization);
  } else {
    res.sendStatus(503);
  }
});

router.get('/camleft:id.m4s', (req, res) => {
  const segment = mp4frag.getSegment(req.params.id);
  if (segment) {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.end(segment);
  } else {
    res.sendStatus(503);
  }
});

router.get('/cammid.m3u8', (req, res) => {
  if (mp4frag2.m3u8) {
    res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' });
    res.end(mp4frag2.m3u8);
  } else {
    res.sendStatus(503);
  }
});

router.get('/init-cammid.mp4', (req, res) => {
  if (mp4frag2.initialization) {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.end(mp4frag2.initialization);
  } else {
    res.sendStatus(503);
  }
});

router.get('/cammid:id.m4s', (req, res) => {
  const segment = mp4frag2.getSegment(req.params.id);
  if (segment) {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.end(segment);
  } else {
    res.sendStatus(503);
  }
});

router.get('/camright.m3u8', (req, res) => {
  if (mp4frag3.m3u8) {
    res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' });
    res.end(mp4frag3.m3u8);
  } else {
    res.sendStatus(503);
  }
});

router.get('/init-camright.mp4', (req, res) => {
  if (mp4frag3.initialization) {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.end(mp4frag3.initialization);
  } else {
    res.sendStatus(503);
  }
});

router.get('/camright:id.m4s', (req, res) => {
  const segment = mp4frag3.getSegment(req.params.id);
  if (segment) {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.end(segment);
  } else {
    res.sendStatus(503);
  }
});

module.exports = router;
