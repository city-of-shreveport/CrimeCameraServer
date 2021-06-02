// require basic
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const si = require('systeminformation');
var os = require("os");
// require routers
const apiRouter = require('./routes/api');

// require .env variables
require('dotenv').config();

// disable cors
const cors = require('cors');
app.use(cors());

// establish database connection
mongoose.connect(
  'mongodb://localhost/CrimeCameraSystem',
  {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (err) {
    if (err) throw err;
  }
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
function sendPerfMon(){
var perfMon = {
  node: hostname,
  currentLoad: {
    cpus: [],
  },
  mem: {},
  cpuTemperature: {},
  fsSize: [],
};

await si.currentLoad(function (data) {
  perfMon.currentLoad.cpus = [];
  perfMon.currentLoad.avgLoad = data.avgLoad;
  perfMon.currentLoad.currentLoad = data.currentLoad;
  perfMon.currentLoad.currentLoadUser = data.currentLoadUser;

  for (var i = 0; i < data.cpus.length; i++) {
    perfMon.currentLoad.cpus.push(data.cpus[i].load);
  }
});

await si.mem(function (data) {
  perfMon['mem']['total'] = data.total;
  perfMon['mem']['free'] = data.free;
  perfMon['mem']['used'] = data.used;
  perfMon['mem']['available'] = data.available;
});

await si.cpuTemperature(function (data) {
  perfMon['cpuTemperature'].main = data.main;
});

await si.fsSize(function (data) {
  for (var i = 0; i < data.length; i++) {
    perfMon.fsSize.push({
      fs: data[i].fs,
      type: data[i].type,
      size: data[i].size,
      used: data[i].used,
      available: data[i].available,
      mount: data[i].mount,
    });
  }
});

axios.post(`${process.env.CAMERA_SERVER}/api/perfmons`, perfMon);
}

setInterval(() => {
  sendPerfMon()
}, 60000);
module.exports = app;
