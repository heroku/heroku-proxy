var https     = require('https');

module.exports = function(req, res) {
  var proxyReq = https.request({
    auth    : ':' + req['heroku-bouncer'].token,
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
