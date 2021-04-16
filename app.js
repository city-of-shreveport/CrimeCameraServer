// basic requires
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const cameras = require('./routes/cameras');
const perfmons = require('./routes/perfmons');
const managementRouter = require('./routes/management');
const apiRouter = require('./routes/api');
const app = express();

// require .env variables
require('dotenv').config();

// establish connection to database
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cameras', function (err) {
  if (err) throw err;
  console.log('Successfully connected');
});

// configure auth0
const { auth } = require('express-openid-connect');

const auth_config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.AUTH0_BASEURL,
  issuerBaseURL: process.env.AUTH0_ISSUERBASEURL,
  clientID: process.env.AUTH0_CLIENTID,
  secret: process.env.AUTH0_SECRET,
};

// auth router attaches /login, /logout, and /callback routes to the baseurl
app.use(auth(auth_config));

// req.isAuthenticated is provided from the auth router
app.get('/authenticated', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cameras', cameras);
app.use('/perfmons', perfmons);
app.use('/management', managementRouter);
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
var request = require('request');
var user;
function getStreams() {
  console.log('yup');
  request.get(
    'http://192.168.196.75:8080/' + user.auth_token + '/videos/eGjcwkXXPo/DBxQdxYYak80',

    function (error, response, d) {
      if (!error && response.statusCode == 200) {
        var jsonObj = JSON.parse(d);
        console.log(jsonObj.videos);

        for (i = 0; i < jsonObj.videos.length; i++) {
          console.log(jsonObj.videos[i].filename);
        }
      }
      if (error) {
        console.log(error);
      }
    }
  );
}

module.exports = app;
