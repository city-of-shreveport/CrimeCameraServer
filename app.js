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
var heartbeatsRouter = require('./routes/heartbeats');
var { adminJs, adminRouter } = require('./routes/admin');

// require environment
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 100;

// disable cors
const cors = require('cors');
app.use(cors());

// establish database connection
mongoose.connect(
  process.env.MONGO_CONNECTION_STRING,
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
app.use('/api/heartbeats', heartbeatsRouter);
app.use(adminJs.options.rootPath, adminRouter);

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
