var https     = require('https');
var encryptor = require('encryptor')(process.env.ENCRYPTION_SECRET);

module.exports = function(req, res) {
  var userSession = JSON.parse(encryptor.decrypt(req.session.userSession));
  var token       = userSession.accessToken;

  var proxyReq = https.request({
    auth    : ':' + token,
    hostname: 'api.heroku.com',
    method  : req.method,
    path    : req.path.slice(4),
    port    : 443
  });

  proxyReq.headers = req.headers;

  proxyReq.on('response', function(proxyRes) {
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);
};
