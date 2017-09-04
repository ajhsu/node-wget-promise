'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chai = require('chai');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

describe('Download Tests', function () {
  this.timeout(15 * 1000);

  it('Should download the file with HTTP protocol', function (done) {
    var Bytes = 1024;
    var fileName = 'logo.svg';
    (0, _index2['default'])('http://www.president.gov.tw/images/logo.svg', {
      onStart: function onStart(headers) {
        (0, _chai.expect)(headers['content-type']).to.be.eqls('image/svg+xml');
      },
      onProgress: function onProgress(progress) {
        console.log('downloaded', progress, '%');
      },
      output: fileName
    }).then(function (result) {
      (0, _chai.expect)(result.headers['content-type']).to.be.eqls('image/svg+xml');
      (0, _chai.expect)(result.fileSize).to.be.a('number');
      (0, _chai.expect)(result.fileSize).to.be.above(0 * Bytes);
      (0, _chai.expect)(result.fileSize).to.be.below(100 * Bytes);
      // Check if file existed
      (0, _chai.expect)(_fs2['default'].existsSync(fileName)).to.be['true'];
      // Delete download file
      _fs2['default'].unlinkSync(fileName);
      done();
    })['catch'](function (err) {
      console.log(err);
      (0, _chai.expect)(err).to.be['null'];
    });
  });

  it('Should download the file with HTTPS protocol', function (done) {
    var Bytes = 1024;
    var fileName = 'nodejs-logo.png';
    (0, _index2['default'])('https://raw.githubusercontent.com/ajhsu/node-wget-promise/master/assets/nodejs-logo.png', {
      onStart: function onStart(headers) {
        (0, _chai.expect)(headers['content-type']).to.be.eqls('image/png');
      },
      onProgress: function onProgress(progress) {
        console.log('downloaded', progress, '%');
      },
      output: fileName
    }).then(function (result) {
      (0, _chai.expect)(result.headers['content-type']).to.be.eqls('image/png');
      (0, _chai.expect)(result.fileSize).to.be.a('number');
      (0, _chai.expect)(result.fileSize).to.be.above(0 * Bytes);
      (0, _chai.expect)(result.fileSize).to.be.below(50 * Bytes);
      // Check if file existed
      (0, _chai.expect)(_fs2['default'].existsSync(fileName)).to.be['true'];
      // Delete download file
      _fs2['default'].unlinkSync(fileName);
      done();
    })['catch'](function (err) {
      console.log(err);
      (0, _chai.expect)(err).to.be['null'];
    });
  });

  it('Should download file even options is not given', function (done) {
    var fileName = 'nodejs-logo.png';
    (0, _index2['default'])('https://raw.githubusercontent.com/ajhsu/node-wget-promise/master/assets/nodejs-logo.png').then(function (result) {
      // Check if file existed
      (0, _chai.expect)(_fs2['default'].existsSync(fileName)).to.be['true'];
      // Delete download file
      _fs2['default'].unlinkSync(fileName);
      done();
    })['catch'](function (err) {
      console.log(err);
      (0, _chai.expect)(err).to.be['null'];
    });
  });

  it('Should download file with gzip response header', function (done) {
    var fileName = 'index.html';
    (0, _index2['default'])('https://www.apple.com/index.html').then(function (result) {
      // Check if file existed
      (0, _chai.expect)(_fs2['default'].existsSync(fileName)).to.be['true'];
      // Delete download file
      _fs2['default'].unlinkSync(fileName);
      done();
    })['catch'](function (err) {
      console.log(err);
      (0, _chai.expect)(err).to.be['null'];
    });
  });

  it('Should download with unknown file name', function (done) {
    var fileName = 'unknown';
    (0, _index2['default'])('https://www.apple.com/').then(function (result) {
      // Check if file existed
      (0, _chai.expect)(_fs2['default'].existsSync(fileName)).to.be['true'];
      // Delete download file
      _fs2['default'].unlinkSync(fileName);
      done();
    })['catch'](function (err) {
      console.log(err);
      (0, _chai.expect)(err).to.be['null'];
    });
  });
});