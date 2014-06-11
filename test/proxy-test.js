'use strict';

var request = require('request');
require('should');

describe('proxy', function() {
  var server = require('./fixtures/server');
  server.listen(0);
  var serverPort = server.address().port;

  var client = require('./fixtures/client')(serverPort);
  client.listen(0);
  var clientPort = client.address().port;

  server.clientPort = clientPort;

  // NOTE: server.js copies headers from its incoming request back to the
  // original response, which is why we're testing response headers.

  it('proxies whitelisted headers to and from the API', function(done) {
    request({
      url: 'http://localhost:' + clientPort + '/api/apps',
      headers: { foo: 'bar', accept: 'accept' }
    }, function(err, res) {
      if (err) throw err;
      res.headers.hasOwnProperty('foo').should.eql(false);
      res.headers.accept.should.eql('accept');
      done();
    });
  });

  it('sets cache-control to no-cache', function(done) {
    request({
      url: 'http://localhost:' + clientPort + '/api/apps',
      headers: { foo: 'bar', accept: 'accept' }
    }, function(err, res) {
      if (err) throw err;
      res.headers['cache-control'].should.eql('no-cache');
      done();
    });
  });

  it('proxies status codes', function(done) {
    request({
      url: 'http://localhost:' + clientPort + '/api/apps?statusCode=202'
    }, function(err, res) {
      if (err) throw err;
      res.statusCode.should.eql(202);
      done();
    });
  });

  it('proxies request bodies', function(done) {
    request({
      url: 'http://localhost:' + clientPort + '/api/apps'
    }, function(err, res) {
      if (err) throw err;
      res.body.should.eql('ok');
      done();
    });
  });

  it('allows additional headers to be configured', function(done) {
    request({
      url: 'http://localhost:' + clientPort + '/api/apps',
      headers: { 'Bar': 'bar' }
    }, function(err, res) {
      if (err) throw err;
      res.headers.bar.should.eql('bar');
      done();
    });
  });

  it('transforms configured transformed headers', function(done) {
    request({
      url: 'http://localhost:' + clientPort + '/api/apps',
      headers: { 'X-Range': 'foofyfoofoo', 'X-Bar': 'barbybarbar' }
    }, function(err, res) {
      if (err) throw err;
      res.headers.range.should.eql('foofyfoofoo');
      res.headers.bar.should.eql('barbybarbar');
      done();
    });
  });

  it('proxies the heroku-bouncer token in an Authorization header', function(done) {
    request({
      url: 'http://localhost:' + clientPort + '/api/apps?token=my-token'
    }, function(err, res) {
      if (err) throw err;
      var expectedHeader = 'Basic ' + (new Buffer(':my-token').toString('base64'));
      res.headers.authorization.should.eql(expectedHeader);
      done();
    });
  });
});
