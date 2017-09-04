'use strict';

const fs = require('fs');
const wget = require('../build/wget');
const expect = require('chai').expect;

describe('Download Tests', function() {
  this.timeout(15 * 1000);

  it('Should download the Nodejs logo', function(done) {
    const Bytes = 1024;
    const fileName = 'nodejs-logo.png';
    wget('https://raw.githubusercontent.com/ajhsu/node-wget-promise/master/test/nodejs-logo.png', {
      onStart: headers => {
        expect(headers['content-type']).to.be.eqls('image/png');
      },
      onProgress: progress => {
        console.log('downloaded', progress, '%');
      },
      output: fileName
    })
      .then(result => {
        expect(result.headers['content-type']).to.be.eqls('image/png');
        expect(result.fileSize).to.be.a('number');
        expect(result.fileSize).to.be.above(0 * Bytes);
        expect(result.fileSize).to.be.below(50 * Bytes);
        // Check if file existed
        expect(fs.existsSync(fileName)).to.be.true;
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
      });
  });

  it('Should download file even options is not given', function(done) {
    const fileName = 'nodejs-logo.png';
    wget('https://raw.githubusercontent.com/ajhsu/node-wget-promise/master/test/nodejs-logo.png')
      .then(result => {
        // Check if file existed
        expect(fs.existsSync(fileName)).to.be.true;
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
      });
  });

  it('Should download file with gzip response header', function(done) {
    const fileName = 'index.html';
    wget('https://www.apple.com/index.html')
      .then(result => {
        // Check if file existed
        expect(fs.existsSync(fileName)).to.be.true;
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
      });
  });

  it('Should download with unknown file name', function(done) {
    const fileName = 'unknown';
    wget('https://www.apple.com/')
      .then(result => {
        // Check if file existed
        expect(fs.existsSync(fileName)).to.be.true;
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
      });
  });
});
