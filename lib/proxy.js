var https     = require('https');

module.exports = function(req, res) {
  var headers = {};
  var whitelist = ['accept', 'range'];

  whitelist.forEach(function(header) {
    if (req.headers.hasOwnProperty(header)) {
      headers[header] = req.headers[header]
    }
  });

  var proxyReq = https.request({
    auth    : ':' + req['heroku-bouncer'].token,
    headers : headers,
    hostname: 'api.heroku.com',
    method  : req.method,
    path    : req.path.slice(4),
    port    : 443
  });

  proxyReq.on('response', function(proxyRes) {
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);
};
