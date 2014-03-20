# heroku-proxy

heroku-proxy provides an easy way to prototype web apps using the Heroku API and
Heroku OAuth.

## Setup

### Create a new project and install it:

```sh
$ git init my-new-app
$ cd my-new-app
$ mkdir public
$ npm init
$ npm install heroku-proxy --save
```

### Run the bootstrap:

```sh
$ ./node_modules/.bin/heroku-proxy
```

### Require it in your `index.js`:

```javascript
var proxy = require('heroku-proxy');
proxy();
```

Now, running `foreman run nodemon index.js` will serve content inside the `public`
directory and process it with harp.js. Any calls to `/api/*` will be proxied
through the Heroku API.

## Options

By default, heroku-proxy will use harp middleware and start the server for you.
You can prevent that with the `harp` and `startServer` options:

```javascript
var proxy = require('heroku-proxy');

proxy({
  harp: false,
  startServer: false
});
```

If you'd like to pass in your own express app, you can do that, as well:

```javascript
var express = require('express');
var proxy   = require('heroku-proxy');
var app     = express();

proxy(app, {
  harp: false
});
```
