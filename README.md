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
require('heroku-proxy');
```

Now, running `foreman run nodemon index.js` will serve content inside the `public`
directory and process it with harp.js. Any calls to `/api/*` will be proxied
through the Heroku API.
