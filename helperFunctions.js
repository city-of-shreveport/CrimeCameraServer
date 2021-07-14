var ffmpeg = require('fluent-ffmpeg');
var videos = require('./models/videos');
var { execSync } = require('child_process');
var { readdirSync } = require('fs');

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

const updateVideos = async (config) => {
  readdirSync('/home/pi/mounts', { withFileTypes: true })
    .filter((node) => node.isDirectory())
    .map((node) => {
      readdirSync(`/home/pi/mounts/${node.name}`, { withFileTypes: true })
        .filter((camera) => camera.isDirectory())
        .map((camera) => {
          readdirSync(`/home/pi/mounts/${node.name}/${camera.name}`, { withFileTypes: true })
            .filter((video) => video.isFile())
            .map((video) => {
              try {
                ffmpeg.ffprobe(`/home/pi/mounts/${node.name}/${camera.name}/${video.name}`, function (error, metadata) {
                  if (metadata != undefined) {
                    var year = parseInt(video.name.split('-')[0]);
                    var monthIndex = parseInt(video.name.split('-')[1]) - 1;
                    var day = parseInt(video.name.split('-')[2]);
                    var hours = parseInt(video.name.split('-')[3]);
                    var minutes = parseInt(video.name.split('-')[4]);
                    var dateTime = new Date(year, monthIndex, day, hours, minutes);

                    videos.exists(
                      {
                        node: node.name,
                        camera: camera.name,
                        fileLocation: video.name,
                      },
                      function (err, doc) {
                        if (!doc) {
                          console.log(`saving video /home/pi/mounts/${node.name}/${camera.name}/${video.name}...`);

                          new videos({
                            node: node.name,
                            camera: camera.name,
                            fileLocation: video.name,
                            dateTime: dateTime,
                          }).save();
                        }
                      }
                    );
                  }
                });
              } catch (error) {
                console.log(error);
              }
            });
        });
    });
};

module.exports = { formatArguments, tryValue, updateVideos };
