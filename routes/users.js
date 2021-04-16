const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');

router.get('/', requiresAuth(), function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
