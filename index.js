'use strict';

var express = require('express');
var router  = new express.Router();

module.exports = function(options) {
  options || (options = {});
  setOptions(options);

  router.all('/' + options.prefix + '/*', function(req, res) {
    var token;

    if (req['heroku-bouncer'] && req['heroku-bouncer'].token) {
      token = req['heroku-bouncer'].token;
    } else {
      token = '';
    }

    delete req.headers.host;

    var proxyReq = require(options.protocol).request({
      auth    : ':' + token,
      headers : req.headers,
      hostname: options.hostname,
      method  : req.method,
      path    : req.originalUrl.slice(4),
      port    : options.port
    });

    req.pipe(proxyReq);

    proxyReq.on('response', function(proxyRes) {
      res.statusCode = proxyRes.statusCode;

      for (var header in proxyRes.headers) {
        res.setHeader(header, proxyRes.headers[header]);
      }

      proxyRes.pipe(res);
    });
  });

  return router.middleware;
};

function setOptions(options) {
  if (!options.hasOwnProperty('hostname')) {
    options.hostname = 'api.heroku.com';
  }

  if (!options.hasOwnProperty('port')) {
    options.port = 443;
  }

  if (!options.hasOwnProperty('prefix')) {
    options.prefix = 'api';
  }

  if (!options.hasOwnProperty('protocol')) {
    options.protocol = 'https';
  }
}
