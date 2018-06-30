const fs = require('fs');
const wget = require('./index');

describe('Integration tests', function() {
  it('should download the file with HTTP protocol', function(done) {
    const Bytes = 1024;
    const fileName = 'logo.svg';
    wget('http://www.president.gov.tw/images/logo.svg', {
      onStart: headers => {
        expect(headers['content-type']).toContain('image/svg+xml');
      },
      onProgress: progress => {
        console.log('downloaded', progress, '%');
      },
      output: fileName
    })
      .then(result => {
        expect(result.headers['content-type']).toContain('image/svg+xml');
        expect(result.fileSize).toBeGreaterThan(0 * Bytes);
        expect(result.fileSize).toBeLessThan(100 * Bytes);
        // Check if file existed
        expect(fs.existsSync(fileName)).toBeTruthy();
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).toBeNull();
      });
  });

  it('should download the file with HTTPS protocol', function(done) {
    const Bytes = 1024;
    const fileName = '__nodejs-logo.png';
    wget(
      'https://raw.githubusercontent.com/ajhsu/node-wget-promise/master/assets/nodejs-logo.png',
      {
        onStart: headers => {
          expect(headers['content-type']).toContain('image/png');
        },
        onProgress: progress => {
          console.log('downloaded', progress, '%');
        },
        output: fileName
      }
    )
      .then(result => {
        expect(result.headers['content-type']).toContain('image/png');
        expect(result.fileSize).toBeGreaterThan(0 * Bytes);
        expect(result.fileSize).toBeLessThan(50 * Bytes);
        // Check if file existed
        expect(fs.existsSync(fileName)).toBeTruthy();
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).toBeNull();
      });
  });

  it('should download file even options is not given', function(done) {
    const fileName = 'nodejs-logo.png';
    wget(
      'https://raw.githubusercontent.com/ajhsu/node-wget-promise/master/assets/nodejs-logo.png'
    )
      .then(result => {
        // Check if file existed
        expect(fs.existsSync(fileName)).toBeTruthy();
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).toBeNull();
      });
  });

  it('should download with unknown file name', function(done) {
    const fileName = 'unknown';
    wget('https://www.apple.com/')
      .then(result => {
        // Check if file existed
        expect(fs.existsSync(fileName)).toBeTruthy();
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).toBeNull();
      });
  });

  it.skip('should download large file size in ~100MB', function(done) {
    const fileName = 'large_file.jpg';
    wget(
      'https://upload.wikimedia.org/wikipedia/commons/6/6e/1_lijiang_old_town_2012.jpg',
      {
        onStart: headers => {
          expect(headers['content-type']).toContain('image/jpeg');
        },
        onProgress: progress => {
          console.log('downloaded', progress, '%');
        },
        output: fileName
      }
    )
      .then(result => {
        // Check if file existed
        expect(fs.existsSync(fileName)).toBeTruthy();
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).toBeNull();
      });
  });

  it('should download file via 301 redirection', function(done) {
    const Bytes = 1024;
    const fileName = 'index.html';
    wget('http://www.kimo.com/index.html', {
      onStart: headers => {
        expect(headers['content-type']).toContain('text/html');
      },
      onProgress: progress => {
        console.log('downloaded', progress, '%');
      },
      output: fileName
    })
      .then(result => {
        expect(result.headers['content-type']).toContain('text/html');
        expect(result.fileSize).toBeGreaterThan(0 * Bytes);
        expect(result.fileSize).toBeLessThan(1024 * Bytes);
        // Check if file existed
        expect(fs.existsSync(fileName)).toBeTruthy();
        // Delete download file
        fs.unlinkSync(fileName);
        done();
      })
      .catch(err => {
        console.log(err);
        expect(err).toBeNull();
      });
  });
});
