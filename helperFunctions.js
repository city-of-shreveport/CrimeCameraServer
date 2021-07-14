var videos = require('./models/videos');

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

module.exports = { formatArguments, tryValue, cleanupVideos };
