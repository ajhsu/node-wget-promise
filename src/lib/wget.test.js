import { expect } from 'chai';
import { cleanProtocol } from './wget';

describe('cleanProtocol', function() {
  this.timeout(15 * 1000);
  it('should clean protocol as expected', function(done) {
    expect(cleanProtocol('https:')).to.be.eqls('https');
    done();
  });
});
