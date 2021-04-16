const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');

router.get('/', requiresAuth(), function (req, res) {
  res.render('index', {
    title: 'Home',
  });
});

module.exports = router;
