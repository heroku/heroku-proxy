'use strict';

var https     = require('https');
var encryptor = require('./encryptor');

exports.api = function(req, res) {
  var headers = {
    "Accept": "application/vnd.heroku+json; version=3"
  };

  var userSession = JSON.parse(encryptor.decrypt(req.session.userSession));
  var token       = userSession.accessToken;

  var apiReq = https.request({
    auth    : ':' + token,
    headers : headers,
    hostname: 'api.heroku.com',
    method  : req.method.toUpperCase(),
    path    : req.path.slice(4),
    port    : 443
  }, pipeResponse);

  apiReq.on('error', function(err) {
    throw err;
  });

  apiReq.end();

  function pipeResponse(apiRes) {
    apiRes.pipe(res);
  }
};
