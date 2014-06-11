'use strict';

var express = require('express');
var logfmt  = require('logfmt');
var router  = new express.Router();

module.exports = function(options) {
  options = options || {};
  setOptions(options);

  router.all('/' + options.prefix + '/*', function(req, res) {
    var headers = getHeaders(req, options);
    var token;

    if (req['heroku-bouncer'] && req['heroku-bouncer'].token) {
      token = req['heroku-bouncer'].token;
    } else {
      token = '';
    }

    var proxyReq = require(options.protocol).request({
      auth    : ':' + token,
      headers : headers,
      hostname: options.hostname,
      method  : req.method,
      path    : req.originalUrl.slice(4),
      port    : options.port
    });

    var timer = logfmt.time().namespace({
      ns  : 'heroku-proxy',
      time: new Date().toISOString()
    });

    req.pipe(proxyReq);

    proxyReq.on('response', function(proxyRes) {
      res.statusCode = proxyRes.statusCode;
      res.setHeader('cache-control', 'no-cache');

      for (var header in proxyRes.headers) {
        if (proxyRes.headers.hasOwnProperty(header)) {
          res.setHeader(header, proxyRes.headers[header]);
        }
      }

      proxyRes.pipe(res).on('finish', function() {
        if (options.log) {
          timer.log({
            hostname  : options.hostname,
            path      : req.originalUrl.slice(4),
            method    : req.method,
            request_id: req.get('x-request-id')
          });
        }
      });
    });
  });

  return router.middleware;
};

function getHeaders(req, options) {
  var headersWhitelist = [
    'accept',
    'content-length',
    'content-type',
    'if-none-match',
    'range',
    'x-heroku-legacy-ids',
    'x-request-id'
  ].concat(options.whitelistHeaders);

  return Object.keys(req.headers).reduce(function(headers, header) {
    var value = req.headers[header];
    header = options.headerTransforms[header] || header;

    if (headersWhitelist.indexOf(header) > -1) {
      headers[header] = value;
    }

    return headers;
  }, {});
}

function setOptions(options) {
  if (!options.hasOwnProperty('hostname')) {
    options.hostname = 'api.heroku.com';
  }

  if (!options.hasOwnProperty('whitelistHeaders')) {
    options.whitelistHeaders = [];
  }

  if (!options.hasOwnProperty('headerTransforms')) {
    options.headerTransforms = {};
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
