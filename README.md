# heroku-proxy

heroku-proxy provides a proxy to the Heroku API for express apps. It is
intended for use with [node-heroku-bouncer][node-heroku-bouncer].

## Install

```sh
$ npm install heroku-proxy --save
```

## Use

heroku-proxy assumes that it has the node-heroku-bouncer middleware in front of
it. See the [node-heroku-bouncer README][node-heroku-bouncer-readme] for
configuration instructions.

```javascript
var express     = require('express');
var herokuProxy = require('heroku-proxy');
var app         = express();

// ...set up heroku-bouncer

app.use(herokuProxy());
```

By default, heroku-proxy will proxy all requests to `/api/*` of any method to
`api.heroku.com` via `https`. You can override the default options by passing
an object into the function returned by the `heroku-proxy` module:

```javascript
app.use(herokuProxy({
  hostname: 'localhost',
  port    : 5001,
  prefix  : 'heroku-api',
  protocol: 'http'
}));
```

Now, a request to `/heroku-api/apps` will be proxied to
`http://localhost:5001/apps`.

## Options

| Option   | Effect | Default |
| -------- | ------ | ------- |
| log      | Log request details | `false` |
| hostname | The hostname to proxy requests to | `api.heroku.com` |
| port     | The port on API host | `443` |
| prefix   | A prefix path where your Express app will be listening for API requests | `api` |
| protocol | The protocol to use | `https` |
| whitelistHeaders | Additional headers to whitelist to pass through to the API | `[]` |
| headerTransforms | An object of keys (from) and values (to) to transform request headers before being sent to the API | `{}` |
## Test

```sh
$ npm test
```

[node-heroku-bouncer]:        https://github.com/jclem/node-heroku-bouncer
[node-heroku-bouncer-readme]: https://github.com/jclem/node-heroku-bouncer/blob/master/README.md
