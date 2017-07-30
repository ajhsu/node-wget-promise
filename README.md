# node-wget-promise

node-wget-promise simplifies retrieving files from any URL, with Promise support.

[![npm](https://img.shields.io/npm/v/node-wget-promise.svg)](https://www.npmjs.com/package/node-wget-promise)
[![Build Status](https://travis-ci.org/ajhsu/node-wget-promise.svg?branch=master)](https://travis-ci.org/ajhsu/node-wget-promise)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> This package is forked and enhanced from [wget-improved](https://github.com/bearjaws/node-wget)

## Install

```
npm install node-wget-promise --save
```

## wget(src, output, options)

```js
var wget = require('node-wget-promise');
var src = 'http://nodejs.org/images/logo.svg';
var options = {
  // see options below
};
wget(src, options)
  .then(result => console.log(result))
  .catch(err => console.log(err));
```

## options

```js

options = {}
// Set to true to have any gzip stream automatically decompressed before saving
options.gunzip = false;
options.proxy = {};
options.proxy.protocol = 'http';
options.proxy.host = 'someproxy.org';
options.proxy.port = 1337;
options.proxy.proxyAuth = '{basic auth}';
options.proxy.headers = {'User-Agent': 'Node'};
```

## Todo

- Enable gzip when using request method
