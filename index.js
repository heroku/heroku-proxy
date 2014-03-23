'use strict';

var bouncer      = require('heroku-bouncer');
var clusterflock = require('clusterflock');
var express      = require('express');
var path         = require('path');
var proxy        = require('./lib/proxy');

module.exports = function(app, options) {
  options || (options = {});
  options.startServer || (options.startServer = true);

  if (typeof app === 'object') {
    options = app;
    app     = null;
  }

  if (!app) app = express();

  bouncer(app);

  app.use(express.favicon());
  app.use(express.csrf());
  app.use(express.static(path.join(process.cwd(), 'public')));
  app.all('/api/*', proxy);

  if (options.startServer) {
    clusterflock(app);
  }
};
