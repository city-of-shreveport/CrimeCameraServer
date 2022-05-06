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
      `sshfs -o 'StrictHostKeyChecking=no' pi@${nodesToMount[i].config.ip}:/home/pi/videos /home/pi/mounts/${nodesToMount[i].config.hostName}`
    );
  }
};


//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
    return Value * Math.PI / 180;
}


const checkNodesBuddy = async () => {
  console.log('Checking if Nodes have a buddy...');
  var nowDate = new Date();
  var checkInDate = nowDate.setMinutes(nowDate.getMinutes() - 15);
  var nodesToCheck = await nodes.find({ lastCheckIn: { $gt: checkInDate } });
  var closestDist = 5000;
  var currentNodeLat;
  var currentNodeLong;
  for (var i = 0; i < nodesToCheck.length; i++) {
    //Does node have a buddy its backing up to?
    if(nodesToCheck.currentBuddy==null){
        //get Location
        currentNodeLat = nodesToCheck.config.locationLat;
        currentNodeLong = nodesToCheck.config.locationLong;
        //Check distence from each node
        for (var d = 0; d < nodesToCheckDist.length; d++) {
          let distenceAway = calcCrow(currentNodeLat,currentNodeLong,nodesToCheckDist.config.locationLat,nodesToCheckDist.config.locationLong).toFixed(1)
          if(distenceAway>closestDist){
            closestDist = distenceAway;
            if(nodesToCheck.config.buddyDrives.buddy1.hostName==null){
                //UPDATE NODE WITH THIS NODES NAME AS BUDDY1
                //Update Current Node with nodesToCheck.NodeName
              nodes.findOneAndUpdate({ name: nodesToCheck.name}, { $set: {currentBuddy: nodesToCheckDist.name}}).exec(function (err, node) {
                  if (err) {
                    
                  } else {
                    
                  }
                });
                nodes.findOneAndUpdate({ name: nodesToCheckDist.name}, { $set: {
                  config:{
                  buddyDrives:{
                    buddy2:{
                      hostName: nodesToCheckDist.name}
                    }
                  }
                }
                }).exec(function (err, node) {
                  if (err) {
                    
                  } else {
                    
                  }
                });
               
            }
            
            else if(nodesToCheck.config.buddyDrives.buddy2.hostName==null){
                //UPDATE NODE WITH THIS NODES NAME AS BUDDY2
                //Update Current Node with nodesToCheck.NodeName
                 nodes.findOneAndUpdate({ name: nodesToCheck.name}, { $set: {currentBuddy: nodesToCheckDist.name}}).exec(function (err, node) {
                  if (err) {
                    
                  } else {
                    
                  }
                });
                nodes.findOneAndUpdate({ name: nodesToCheckDist.name}, { $set: {
                  config:{
                    buddyDrives:{
                      buddy2:{
                        hostName: nodesToCheckDist.name}
                      }
                    }
                  }
                }).exec(function (err, node) {
                  if (err) {
                    
                  } else {
                    
                  }
                });
                
            }
            else{
              //Find Next Node to check
            }

            }

          }
        }
        
      }

  
};

module.exports = { execCommand, formatArguments, tryValue, cleanupVideos, mountNodes, checkNodesBuddy };
