'use strict';

/**
 * HerokuProxy proxies requests to the Heroku API. It is meant to be used in
 * conjunction with
 * [heroku-bouncer](https://github.com/jclem/node-heroku-bouncer), which will
 * add the necessary authentication information to the incoming request.
 *
 * @class HerokuProxy
 */

var express = require('express');
var logfmt  = require('logfmt');
var router  = new express.Router();

/**
 * @method createProxy
 * @param {Object} options options for configuring the proxy middleware
 * @param {String} [options.prefix] a prefix to look for API requests under,
 *   such as `'api'` when an apps request might go to `'/api/apps'`
 * @param {String} [options.hostname='api.heroku.com'] the hostname for the
 *   Heroku API
 * @param {Array} [options.whitelistHeader=[]] an array of headers, in addition
 *   to the default whitelisted ones, to pass through to the API for each
 *   request
 * @param {Object} [options.headerTransforms={}] an object of request headers as
 *   keys and as values the headers they should be transformed into before being
 *   proxied (e.g. `{ 'x-range': 'range' }`
 * @param {Number} [options.port=443] the port on the API to send requests to
 * @param {String} [options.protocol='https'] the protocol to use for the
 *   proxied requests
 * @param {Boolean} [options.log] if `true`, request details such as elapsed
 *   time and path requested will be logged
 * @return {Function} a piece of middleware which will look for API requests
 *   and proxy them
 */
module.exports = function createProxy(options) {
  options = options || {};
  setOptions(options);

  router.all('/' + options.prefix + '/*', function(req, res) {
    var headers = getHeaders(req, options);
    var hostname, token;

    if (req['heroku-bouncer'] && req['heroku-bouncer'].token) {
      token = req['heroku-bouncer'].token;
    } else {
      token = '';
    }

    if (req.get('x-proxy-host')) {
      if (options.proxyHosts.indexOf(req.get('x-proxy-host')) >= 0) {
        hostname = req.get('x-proxy-host');
      } else {
        res.statusCode = 403;

        return res.json({
          id     : 'forbidden',
          message: 'Access to this host not allowed'
        });
      }
    } else {
      hostname = options.hostname;
    }

    var proxyReq = require(options.protocol).request({
      auth    : ':' + token,
      headers : headers,
      hostname: hostname,
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
    'x-request-id',
    'heroku-deploy-type',
    'heroku-deploy-source'
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

  if (!options.hasOwnProperty('proxyHosts')) {
    options.proxyHosts = [];
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
