import http from 'http';
import https from 'https';
import tunnel from 'tunnel';
import url from 'url';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';

/**
 * Downloads a file using http get and request
 * @param {string} src - The http URL to download from
 * @param {string} output - The filepath to save to
 * @param {object} options - Options object
 * @returns {Promise}
 */
function download(src, output, options) {
  return new Promise((y, n) => {
    if (typeof output === 'undefined') {
      output = path.basename(url.parse(src).pathname);
    }

    if (options) {
      options = parseOptions('download', options);
    } else {
      options = {
        gunzip: false
      };
    }

    var srcUrl = url.parse(src);
    srcUrl.protocol = cleanProtocol(srcUrl.protocol);

    var req = request(
      {
        protocol: srcUrl.protocol,
        host: srcUrl.hostname,
        port: srcUrl.port,
        path: srcUrl.pathname + (srcUrl.search || ''),
        proxy: options ? options.proxy : undefined,
        auth: options.auth ? options.auth : undefined,
        method: 'GET'
      },
      function(res) {
        if (res.statusCode === 200) {
          var gunzip = zlib.createGunzip();
          var fileSize = parseInt(res.headers['content-length']);
          var downloadedSize = 0;
          var encoding = '';

          // Create write stream
          var writeStream = fs.createWriteStream(output, {
            flags: 'w+',
            encoding: 'binary'
          });

          res.on('error', function(err) {
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

          //emit a start event so the user knows the file-size he's gonna receive
          console.log('start', fileSize);

          // Data handlers
          res.on('data', function(chunk) {
            downloadedSize += chunk.length;
            console.log('progress', downloadedSize / fileSize);
          });
          gunzip.on('data', function(chunk) {
            writeStream.write(chunk);
          });

          writeStream.on('finish', function() {
            writeStream.end();
            console.log('end', 'Finished writing to disk');
            req.end('finished');
            y({ fileSize });
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
}

function request(options, callback) {
  var newOptions = {},
    newProxy = {},
    key;
  options = parseOptions('request', options);
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
}

function parseOptions(type, options) {
  var proxy;
  if (type === 'download') {
    if (options.proxy) {
      if (typeof options.proxy === 'string') {
        proxy = url.parse(options.proxy);
        options.proxy = {};
        options.proxy.protocol = cleanProtocol(proxy.protocol);
        options.proxy.host = proxy.hostname;
        options.proxy.port = proxy.port;
        options.proxy.proxyAuth = proxy.auth;
        options.proxy.headers = { 'User-Agent': 'Node' };
      }
    }
    return options;
  }
  if (type === 'request') {
    if (!options.protocol) {
      options.protocol = 'http';
    }
    options.protocol = cleanProtocol(options.protocol);

    if (options.proxy) {
      if (typeof options.proxy === 'string') {
        proxy = url.parse(options.proxy);
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
}

function cleanProtocol(str) {
  return str.trim().toLowerCase().replace(/:$/, '');
}

export default download;
