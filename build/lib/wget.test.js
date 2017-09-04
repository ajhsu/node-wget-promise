'use strict';

var _chai = require('chai');

var _wget = require('./wget');

describe('cleanProtocol', function () {
  this.timeout(15 * 1000);
  it('should clean protocol as expected', function (done) {
    (0, _chai.expect)((0, _wget.cleanProtocol)('https:')).to.be.eqls('https');
    done();
  });
});