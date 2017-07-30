'use strict';

const fs = require('fs');
const wget = require('../build/wget');
const expect = require('chai').expect;

describe('Download Tests', function() {
  this.timeout(30 * 1000);

  it('Should download the NPM logo', function(done) {
    let download = wget.download(
      'https://www.npmjs.com/static/images/npm-logo.svg',
      'npm-logo.svg'
    );

    download.on('error', function(err) {
      console.log(err);
      expect(err).to.be.null;
    });
    download.on('start', function(fileSize) {
      expect(fileSize).to.be.a('string');
      fileSize = Number(fileSize);
      expect(fileSize).to.be.above(200);
      expect(fileSize).to.be.below(500);
    });
    download.on('end', function(output) {
      expect(output).to.equal('Finished writing to disk');
      // Check if file existed
      expect(fs.existsSync('npm-logo.svg')).to.be.true;
      // Delete download file
      fs.unlinkSync('npm-logo.svg');
      done();
    });
    download.on('progress', function(progress) {
      expect(progress).to.be.above(0);
    });
  });

  it('Should download the NPM logo without given output path', function(done) {
    let download = wget.download(
      'https://www.npmjs.com/static/images/npm-logo.svg?query=string'
    );

    download.on('error', function(err) {
      console.log(err);
      expect(err).to.be.null;
    });
    download.on('start', function(fileSize) {
      expect(fileSize).to.be.a('string');
      fileSize = Number(fileSize);
      expect(fileSize).to.be.above(200);
      expect(fileSize).to.be.below(500);
    });
    download.on('end', function(output) {
      expect(output).to.equal('Finished writing to disk');
      // Check if file existed
      expect(fs.existsSync('npm-logo.svg')).to.be.true;
      // Delete download file
      fs.unlinkSync('npm-logo.svg');
      done();
    });
    download.on('progress', function(progress) {
      expect(progress).to.be.above(0);
    });
  });
});
