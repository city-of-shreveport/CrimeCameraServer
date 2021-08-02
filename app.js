//test edit for git use
// require basic
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var createError = require('http-errors');
var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path');

// require routers
var nodesRouter = require('./routes/nodes');
var perfmonsRouter = require('./routes/perfMons');
var serversRouter = require('./routes/servers');
var streamsRouter = require('./routes/streams');
var videosRouter = require('./routes/videos');
var cameraConfigRouter = require('./routes/cameraConfig');
// disable cors
const cors = require('cors');
app.use(cors());

// establish database connection
mongoose.connect(
  'mongodb://rtcc-mongo.shreveport-it.org/RTCC',
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
app.use('/api/nodes', nodesRouter);
app.use('/api/perfmons', perfmonsRouter);
app.use('/api/servers', serversRouter);
app.use('/api/streams', streamsRouter);
app.use('/api/videos', videosRouter);
app.use('/api/cameraConfig', cameraConfigRouter);
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

module.exports = app;
