'use strict';

var express = require('express');
var http    = require('http');
var proxy   = require('../../index');
var app     = express();
var server  = http.createServer(app);

app.all('*', function(req, res) {
  for (var header in req.headers) {
    res.setHeader(header, req.headers[header]);
  }

  res.statusCode = req.query.statusCode || 200;
  res.end('ok');
});

module.exports = server;
