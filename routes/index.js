const Express = require('express');
const Router = Express.Router();
const { requiresAuth } = require('express-openid-connect');

Router.get('/', requiresAuth(), function (req, res) {
  res.render('index', {
    title: 'Home',
  });
});

module.exports = Router;
