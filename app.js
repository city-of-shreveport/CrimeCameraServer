// basic requires
const app = express();
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const Express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

// require routes
const NodesRouter = require('./routes/nodes');
const PerfMonsRouter = require('./routes/perfMons');
const StreamsRouter = require('./routes/streaming');

// require .env variables
require('dotenv').config();

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
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(Express.static(path.join(__dirname, 'public')));
app.use('/nodes', NodesRouter);
app.use('/perfmons', PerfMonsRouter);
app.use('/streams', StreamsRouter);

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

var request = require('request');
var user;

function getStreams() {
  // console.log('yup');
  request.get(
    'http://192.168.196.75:8080/' + user.auth_token + '/videos/eGjcwkXXPo/DBxQdxYYak80',

    function (error, response, d) {
      if (!error && response.statusCode == 200) {
        var jsonObj = JSON.parse(d);
        // console.log(jsonObj.videos);

        for (i = 0; i < jsonObj.videos.length; i++) {
          // console.log(jsonObj.videos[i].filename);
        }
      }
      if (error) {
        console.log(error);
      }
    }
  );
}

module.exports = app;
