var nodes = require('./models/nodes');
var videos = require('./models/videos');
var { exec } = require('child_process');

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      resolve(stdout ? stdout : stderr);
    });
  });
};

const formatArguments = (template) => {
  return template
    .replace(/\s+/g, ' ')
    .replace(/\s/g, '\n')
    .split('\n')
    .filter((arg) => (arg != '' ? true : false));
};

const tryValue = (tryFunction) => {
  try {
    return tryFunction();
  } catch {
    return null;
  }
};

const cleanupVideos = async () => {
  console.log('Cleaning videos...');
  var nowDate = new Date();
  var deleteDate = nowDate.setDate(nowDate.getDate() - 28);
  var cleanupDate = nowDate.setDate(nowDate.getDate() - 14);

  videos.deleteMany({
    dateTime: { $lt: deleteDate },
  });

  videos.updateMany({
    dateTime: { $lt: cleanupDate },
    deletedAt: nowDate,
  });
};

const mountNodes = async () => {
  console.log('Mounting nodes...');
  var nowDate = new Date();
  var checkInDate = nowDate.setMinutes(nowDate.getMinutes() - 15);
  var nodesToMount = await nodes.find({ lastCheckIn: { $gt: checkInDate } });

  for (var i = 0; i < nodesToMount.length; i++) {
    await execCommand(`mkdir -p /home/pi/mounts/${nodesToMount[i].config.hostName}`);
    await execCommand(
      `sshfs -o 'StrictHostKeyChecking no' pi@${nodesToMount[i].config.ip}:/home/pi/videos /home/pi/mounts/${nodesToMount[i].config.hostName}`
    );
  }
};

module.exports = { execCommand, formatArguments, tryValue, cleanupVideos, mountNodes };
