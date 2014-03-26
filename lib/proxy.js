var https = require('https');

module.exports = function(req, res) {
  var headers = {};
  var headerWhitelist = ['accept', 'range'];

  headerWhitelist.forEach(function(header) {
    if (req.headers.hasOwnProperty(header)) {
      headers[header] = req.headers[header];
    }
  });

  var proxyReq = https.request({
    auth    : req['heroku-bouncer'] ? ':' + req['heroku-bouncer'].token : '',
    headers : headers,
    hostname: 'api.heroku.com',
    method  : req.method,
    path    : req.path.slice(4),
    port    : 443
  });

  proxyReq.on('response', function(proxyRes) {
    res.statusCode = proxyRes.statusCode;
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);
};
