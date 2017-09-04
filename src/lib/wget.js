import http from 'http';
import https from 'https';
import url from 'url';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';

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

    const sourceUrl = url.parse(source);

    let request = null;
    if (sourceUrl.protocol === 'https:') {
      request = https.request;
    } else if (sourceUrl.protocol === 'http:') {
      request = http.request;
    } else {
      throw new Error('protocol should be http or https');
    }

    const req = request(
      {
        method: 'GET',
        protocol: sourceUrl.protocol,
        host: sourceUrl.hostname,
        port: sourceUrl.port,
        path: sourceUrl.pathname + (sourceUrl.search || '')
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
