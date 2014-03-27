'use strict';

var express = require('express');
var http    = require('http');
var proxy   = require('../../index');
var app     = express();
var server  = http.createServer(app);

module.exports = function(serverPort) {
  // Simulate heroku-bouncer
  app.use(function(req, res, next) {
    req['heroku-bouncer'] = {
      token: req.query.token
    };

    next();
  });

  app.use(proxy({
    hostname: 'localhost',
    port: serverPort,
    protocol: 'http'
  }));

  return server;
};
