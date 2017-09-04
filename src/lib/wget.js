import http from 'http';
import https from 'https';
import tunnel from 'tunnel';
import url from 'url';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';

// Turn something like `http://abcde` into `http`
export const cleanProtocol = str => {
  return str
    .trim()
    .toLowerCase()
    .replace(/:$/, '');
};

export const parseRequestOptions = options => {
  if (!options.protocol) {
    options.protocol = 'http';
  }
  options.protocol = cleanProtocol(options.protocol);

  if (options.proxy) {
    if (typeof options.proxy === 'string') {
      let proxy = url.parse(options.proxy);
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
};

export const request = (options, callback) => {
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
        options.agent = tunnel.httpOverHttp({ proxy: newProxy });
      } else if (options.proxy.protocol === 'https') {
        options.agent = tunnel.httpOverHttps({ proxy: newProxy });
      } else {
        throw options.proxy.protocol + ' proxy is not supported!';
      }
    }
    for (key in options) {
      if (key !== 'protocol' && key !== 'proxy') {
        newOptions[key] = options[key];
      }
    }
    return http.request(newOptions, callback);
  }
  if (options.protocol === 'https') {
    if (options.proxy) {
      for (key in options.proxy) {
        if (key !== 'protocol') {
          newProxy[key] = options.proxy[key];
        }
      }
      if (options.proxy.protocol === 'http') {
        options.agent = tunnel.httpsOverHttp({ proxy: newProxy });
      } else if (options.proxy.protocol === 'https') {
        options.agent = tunnel.httpsOverHttps({ proxy: newProxy });
      } else {
        throw options.proxy.protocol + ' proxy is not supported!';
      }
    }
    for (key in options) {
      if (key !== 'protocol' && key !== 'proxy') {
        newOptions[key] = options[key];
      }
    }
    return https.request(newOptions, callback);
  }
  throw 'only allow http or https request!';
};

/**
 * Downloads a file using http get and request
 * @param {string} source - The http URL to download from
 * @param {object} options - Options object
 * @returns {Promise}
 */
export const download = (source, options = {}) => {
  return new Promise((y, n) => {
    if (typeof options.gunzip === 'undefined') {
      options.gunzip = false;
    }
    if (typeof options.output === 'undefined') {
      options.output = path.basename(url.parse(source).pathname) || 'unknown';
    }
    if (options.proxy) {
      if (typeof options.proxy === 'string') {
        let proxy = url.parse(options.proxy);
        options.proxy = {};
        options.proxy.protocol = cleanProtocol(proxy.protocol);
        options.proxy.host = proxy.hostname;
        options.proxy.port = proxy.port;
        options.proxy.proxyAuth = proxy.auth;
        options.proxy.headers = { 'User-Agent': 'Node' };
      }
    }

    var sourceUrl = url.parse(source);
    sourceUrl.protocol = cleanProtocol(sourceUrl.protocol);

    var req = request(
      {
        protocol: sourceUrl.protocol,
        host: sourceUrl.hostname,
        port: sourceUrl.port,
        path: sourceUrl.pathname + (sourceUrl.search || ''),
        proxy: options ? options.proxy : undefined,
        auth: options.auth ? options.auth : undefined,
        method: 'GET'
      },
      res => {
        if (res.statusCode === 200) {
          var gunzip = zlib.createGunzip();
          var fileSize = Number.isInteger(res.headers['content-length'] - 0)
            ? parseInt(res.headers['content-length'])
            : 0;
          var downloadedSize = 0;
          var encoding = '';

          // Create write stream
          var writeStream = fs.createWriteStream(options.output, {
            flags: 'w+',
            encoding: 'binary'
          });

          res.on('error', err => {
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
          res.on('data', chunk => {
            downloadedSize += chunk.length;
            if (options.onProgress) {
              options.onProgress({
                fileSize,
                downloadedSize,
                percentage: fileSize > 0 ? downloadedSize / fileSize : 0
              });
            }
          });
          gunzip.on('data', chunk => {
            writeStream.write(chunk);
          });

          writeStream.on('finish', () => {
            writeStream.end();
            req.end('finished');
            y({ headers: res.headers, fileSize });
          });
        } else if (
          res.statusCode !== 200 &&
          res.statusCode !== 301 &&
          res.statusCode !== 302
        ) {
          n('Server responded with unhandled status: ' + res.statusCode);
        }
      }
    );

    req.end('done');
    req.on('error', err => n(err));
  });
};
