const runner = require('child_process');
var isWin = process.platform === 'win32';
if (isWin) {
    runner.exec('node play.js >> outputs\\1.txt', function (err, response, stderr) {
        process.abort();
    });
} else {
    runner.exec('node play.js >> "outputs\\$(date +\'%Y-%m-%d\'.txt"', function (err, response, stderr) {
        process.abort();
    });
}