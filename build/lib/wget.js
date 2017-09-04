'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

/**
 * Downloads a file using http get and request
 * @param {string} source - The http URL to download from
 * @param {object} options - Options object
 * @returns {Promise}
 */
var download = function download(source) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return new Promise(function (y, n) {
    if (typeof options.gunzip === 'undefined') {
      options.gunzip = false;
    }
    if (typeof options.output === 'undefined') {
      options.output = _path2['default'].basename(_url2['default'].parse(source).pathname) || 'unknown';
    }

    var sourceUrl = _url2['default'].parse(source);

    var request = null;
    if (sourceUrl.protocol === 'https:') {
      request = _https2['default'].request;
    } else if (sourceUrl.protocol === 'http:') {
      request = _http2['default'].request;
    } else {
      throw new Error('protocol should be http or https');
    }

    var req = request({
      method: 'GET',
      protocol: sourceUrl.protocol,
      host: sourceUrl.hostname,
      port: sourceUrl.port,
      path: sourceUrl.pathname + (sourceUrl.search || '')
    }, function (res) {
      if (res.statusCode === 200) {
        var gunzip = _zlib2['default'].createGunzip();
        var fileSize = Number.isInteger(res.headers['content-length'] - 0) ? parseInt(res.headers['content-length']) : 0;
        var downloadedSize = 0;
        var encoding = '';

        // Create write stream
        var writeStream = _fs2['default'].createWriteStream(options.output, {
          flags: 'w+',
          encoding: 'binary'
        });

        res.on('error', function (err) {
          writeStream.end();
          n(err);
        });

        if (typeof res.headers['content-encoding'] === 'string') {
          encoding = res.headers['content-encoding'];
        }

        // If the user has specified to unzip, and the file is gzip encoded, pipe to gunzip
        if (options.gunzip === true && encoding === 'gzip') {
          res.pipe(gunzip);
        } else {
          res.pipe(writeStream);
        }

        // onStartCallback
        if (options.onStart) {
          options.onStart(res.headers);
        }

        // Data handlers
        res.on('data', function (chunk) {
          downloadedSize += chunk.length;
          if (options.onProgress) {
            options.onProgress({
              fileSize: fileSize,
              downloadedSize: downloadedSize,
              percentage: fileSize > 0 ? downloadedSize / fileSize : 0
            });
          }
        });
        gunzip.on('data', function (chunk) {
          writeStream.write(chunk);
        });

        writeStream.on('finish', function () {
          writeStream.end();
          req.end('finished');
          y({ headers: res.headers, fileSize: fileSize });
        });
      } else if (res.statusCode !== 200 && res.statusCode !== 301 && res.statusCode !== 302) {
        n('Server responded with unhandled status: ' + res.statusCode);
      }
    });

    req.end('done');
    req.on('error', function (err) {
      return n(err);
    });
  });
};
exports.download = download;