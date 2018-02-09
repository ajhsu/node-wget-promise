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

## Example

### Basic

```js
var wget = require('node-wget-promise');
var src = 'http://nodejs.org/images/logo.svg';
var options = {
  onStart: [Callback],
  onProgress: [Callback],
  output: [outputFilePath]
};
wget(src, options)
  .then(metadata => [fileMetadata])
  .catch(err => [Error]);
```

### Simplfied

```js
var wget = require('node-wget-promise');
wget('http://nodejs.org/images/logo.svg');
```

### with Async-Await

```js
var wget = require('node-wget-promise');
(async () => {
  await wget('http://nodejs.org/images/logo.svg');
  console.log('Done');
})();
```