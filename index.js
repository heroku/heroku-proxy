'use strict';

var clusterflock  = require('clusterflock');
var express       = require('express');
var harp          = require('harp');
var path          = require('path');
var bouncer       = require('./lib/bouncer');
var cookieSession = require('./lib/cookie-session');
var api           = require('./lib/api');
var publicDir     = path.join(process.cwd(), 'public');
var app           = express();

app.use(express.cookieParser(process.env.COOKIE_SECRET));
app.use(cookieSession);
bouncer(app);
app.use(express.favicon());
app.use(express.csrf());
app.use(express.static(publicDir));
app.use(harp.mount(publicDir));

app.get('/api/*', api.api);
app.post('/api/*', api.api);
app.put('/api/*', api.api);
app.delete('/api/*', api.api);

clusterflock(app);
