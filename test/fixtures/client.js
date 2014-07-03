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
    proxyHosts: [
      '127.0.0.1'
    ],
    port: serverPort,
    protocol: 'http',
    whitelistHeaders: ['bar'],
    headerTransforms: {
      'x-range': 'range',
      'x-bar'  : 'bar'
    }
  }));

  return server;
};
