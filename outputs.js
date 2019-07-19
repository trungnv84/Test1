var fs = require('fs'), readline = require('readline'), os = require("os"),
    inStream = fs.createReadStream('outputs/' + (process.argv[2] || '1.txt')),
    writeStream = fs.createWriteStream('oks/1.txt', { encoding: "utf8"}),
    zeroLine = 0, positive = 0, failLine = 0, errorLine = 0, saveLine = 0, sendLine = 0;

var rl = readline.createInterface({
    input: inStream,
    terminal: false
});

rl.on('line', function(line) {
    if (/	Fail /.test(line)) {
        failLine++;
    } else if (/	Error /.test(line)) {
        errorLine++;
    } else if (/	Save /.test(line)) {
        saveLine++;
    } else if (/	Send /.test(line)) {
        sendLine++;
    }
    if (/: 0 : /.test(line)) {
        zeroLine++;
    } else {
        positive++;
        writeStream.write(line + os.EOL);
    }
});

rl.on('close', function() {
    console.log('Zero line: ' + zeroLine);
    console.log('!Zero line: ' + positive);
    console.log('====================');
    console.log('Fail line: ' + failLine);
    console.log('Error line: ' + errorLine);
    console.log('Save line: ' + saveLine);
    console.log('Send line: ' + sendLine);
});