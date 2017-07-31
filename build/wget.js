'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _tunnel = require('tunnel');

var _tunnel2 = _interopRequireDefault(_tunnel);

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
function download(source, options) {
  return new Promise(function (y, n) {
    options = options || {};
    if (typeof options.gunzip === 'undefined') {
      options.gunzip = false;
    }
    if (typeof options.output === 'undefined') {
      options.output = _path2['default'].basename(_url2['default'].parse(source).pathname);
    }
    if (options.proxy) {
      if (typeof options.proxy === 'string') {
        var proxy = _url2['default'].parse(options.proxy);
        options.proxy = {};
        options.proxy.protocol = cleanProtocol(proxy.protocol);
        options.proxy.host = proxy.hostname;
        options.proxy.port = proxy.port;
        options.proxy.proxyAuth = proxy.auth;
        options.proxy.headers = { 'User-Agent': 'Node' };
      }
    }

    var sourceUrl = _url2['default'].parse(source);
    sourceUrl.protocol = cleanProtocol(sourceUrl.protocol);

    var req = request({
      protocol: sourceUrl.protocol,
      host: sourceUrl.hostname,
      port: sourceUrl.port,
      path: sourceUrl.pathname + (sourceUrl.search || ''),
      proxy: options ? options.proxy : undefined,
      auth: options.auth ? options.auth : undefined,
      method: 'GET'
    }, function (res) {
      if (res.statusCode === 200) {
        var gunzip = _zlib2['default'].createGunzip();
        var fileSize = parseInt(res.headers['content-length']);
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
            var progress = downloadedSize / fileSize;
            options.onProgress(progress);
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
}

function request(options, callback) {
  var newOptions = {},
      newProxy = {},
      key;
  options = parseRequestOptions(options);
  if (options.protocol === 'http') {
    if (options.proxy) {
      for (key in options.proxy) {
        if (key !== 'protocol') {
          newProxy[key] = options.proxy[key];
        }
      }
      if (options.proxy.protocol === 'http') {
        options.agent = _tunnel2['default'].httpOverHttp({ proxy: newProxy });
      } else if (options.proxy.protocol === 'https') {
        options.agent = _tunnel2['default'].httpOverHttps({ proxy: newProxy });
      } else {
        throw options.proxy.protocol + ' proxy is not supported!';
      }
    }
    for (key in options) {
      if (key !== 'protocol' && key !== 'proxy') {
        newOptions[key] = options[key];
      }
    }
    return _http2['default'].request(newOptions, callback);
  }
  if (options.protocol === 'https') {
    if (options.proxy) {
      for (key in options.proxy) {
        if (key !== 'protocol') {
          newProxy[key] = options.proxy[key];
        }
      }
      if (options.proxy.protocol === 'http') {
        options.agent = _tunnel2['default'].httpsOverHttp({ proxy: newProxy });
      } else if (options.proxy.protocol === 'https') {
        options.agent = _tunnel2['default'].httpsOverHttps({ proxy: newProxy });
      } else {
        throw options.proxy.protocol + ' proxy is not supported!';
      }
    }
    for (key in options) {
      if (key !== 'protocol' && key !== 'proxy') {
        newOptions[key] = options[key];
      }
    }
    return _https2['default'].request(newOptions, callback);
  }
  throw 'only allow http or https request!';
}

function parseRequestOptions(options) {
  if (!options.protocol) {
    options.protocol = 'http';
  }
  options.protocol = cleanProtocol(options.protocol);

  if (options.proxy) {
    if (typeof options.proxy === 'string') {
      var proxy = _url2['default'].parse(options.proxy);
      options.proxy = {};
      options.proxy.protocol = cleanProtocol(proxy.protocol);
      options.proxy.host = proxy.hostname;
      options.proxy.port = proxy.port;
      options.proxy.proxyAuth = proxy.auth;
      options.proxy.headers = { 'User-Agent': 'Node' };
    }
  }

  options.gunzip = options.gunzip || false;
  return options;
}

function cleanProtocol(str) {
  return str.trim().toLowerCase().replace(/:$/, '');
}

exports['default'] = download;
module.exports = exports['default'];