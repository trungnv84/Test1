const runner = require('child_process');
runner.exec('node play.js >> outputs\\1.txt', function (err, response, stderr) {
    process.abort();
});