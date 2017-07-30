'use strict';

const fs = require('fs');
const wget = require('../build/wget');
const expect = require('chai').expect;

describe('Download Tests', function() {
  this.timeout(30 * 1000);

  it.only('Should download the NPM logo', function(done) {
    const Bytes = 1024;
    const fileName = 'open-graph.png';
    wget(
      'https://www.npmjs.com/static/images/touch-icons/open-graph.png',
      fileName
    )
      .then(result => {
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
});
