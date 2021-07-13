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
  // var cameras = ['camera1', 'camera2', 'camera3'];
  // for (var c = 0; c < cameras.length; c++) {
  //   var camera = cameras[c];
  //   var fileList = await execCommand(`ls /home/pi/videos/${camera}`);
  //   var videoFiles = fileList.split('\n').filter((file) => file !== '');
  //   videoFiles.forEach(
  //     await async function (videoFile) {
  //       try {
  //         ffmpeg.ffprobe(`/home/pi/videos/${camera}/${videoFile}`, function (error, metadata) {
  //           if (videoFiles != undefined && metadata != undefined) {
  //             var year = parseInt(metadata.format.filename.split('/')[5].split('-')[0]);
  //             var monthIndex = parseInt(metadata.format.filename.split('/')[5].split('-')[1]) - 1;
  //             var day = parseInt(metadata.format.filename.split('/')[5].split('-')[2]);
  //             var hours = parseInt(metadata.format.filename.split('/')[5].split('-')[3]);
  //             var minutes = parseInt(metadata.format.filename.split('/')[5].split('-')[4]);
  //             var dateTime = new Date(year, monthIndex, day, hours, minutes);
  //             videos.exists(
  //               {
  //                 node: config.hostName,
  //                 fileLocation: `${camera}/${videoFile}`,
  //               },
  //               function (err, doc) {
  //                 if (!doc) {
  //                   new videos({
  //                     node: config.hostName,
  //                     fileLocation: `${camera}/${videoFile}`,
  //                     location: {
  //                       lat: config.locationLat,
  //                       lng: config.locationLong,
  //                     },
  //                     startPts: metadata.streams[0].start_pts,
  //                     startTime: metadata.streams[0].start_time,
  //                     duration: metadata.format.duration,
  //                     bitRate: metadata.format.bit_rate,
  //                     height: metadata.streams[0].height,
  //                     width: metadata.streams[0].width,
  //                     size: metadata.format.size,
  //                     camera: camera,
  //                     dateTime: dateTime,
  //                     hash: execSync(`sha1sum ${metadata.format.filename}`).toString().split(' ')[0],
  //                   }).save();
  //                 }
  //               }
  //             );
  //           }
  //         });
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   );
  // }
};

module.exports = { formatArguments, tryValue, updateVideos };
