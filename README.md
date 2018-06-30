# node-wget-promise

`node-wget-promise` simplifies retrieving files from any URL, with Promise support.

[![npm](https://img.shields.io/npm/v/node-wget-promise.svg)](https://www.npmjs.com/package/node-wget-promise)
[![Build Status](https://travis-ci.org/ajhsu/node-wget-promise.svg?branch=master)](https://travis-ci.org/ajhsu/node-wget-promise)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> This package is forked and enhanced from [wget-improved](https://github.com/bearjaws/node-wget)

## Installation

```
npm install node-wget-promise --save
```

## Usage

### The simpliest example

```js
const wget = require('node-wget-promise');

wget('http://nodejs.org/images/logo.svg');
```

### The basic example with callbacks

```js
const wget = require('node-wget-promise');

wget([url], {
    onStart: [Callback],
    onProgress: [Callback],
    output: [outputFilePath]
  })
  .then(metadata => [fileMetadata])
  .catch(err => [Error]);
```

### Work with async-await syntax

```js
const wget = require('node-wget-promise');

(async () => {
  await wget([url]);
  console.log('Done');
})();
```