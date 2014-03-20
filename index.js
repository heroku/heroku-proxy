'use strict';

var clusterflock  = require('clusterflock');
var express       = require('express');
var harp          = require('harp');
var path          = require('path');
var bouncer       = require('./lib/bouncer');
var cookieSession = require('./lib/cookie-session');
var api           = require('./lib/api');

module.exports = function(app, options) {
  var defaultOptions = {
    harp       : true,
    startServer: true,
    publicDir  : path.join(process.cwd(), 'public')
  };

  if (typeof app === 'object') {
    options = app;
    app     = null;
  }

  for (var key in defaultOptions) {
    if (!options.hasOwnProperty(key)) {
      options[key] = defaultOptions[key];
    }
  }

  if (!app) {
    app = express();
  }

  app.use(express.cookieParser(process.env.COOKIE_SECRET));
  app.use(cookieSession);
  bouncer(app);
  app.use(express.favicon());
  app.use(express.csrf());
  app.use(express.static(options.publicDir));

  if (options.harp) {
    app.use(harp.mount(options.publicDir));
  }

  app.get('/api/*', api.api);
  app.post('/api/*', api.api);
  app.put('/api/*', api.api);
  app.delete('/api/*', api.api);

  if (options.startServer) {
    clusterflock(app);
  }
};
