const fs = require('fs'), readline = require('readline'), os = require("os"),
    writeStream = fs.createWriteStream('oks/csv.txt', { encoding: "utf8"});
var zeroLine = 0, positive = 0, failLine = 0, errorLine = 0, saveLine = 0, sendLine = 0;

const run = async () => {
    var files = fs.readdirSync('./outputs/');
    for (var i = 0; i < files.length; i++) {
        var type = files[i].split('.');
        if (type.length < 1 || type[1].toLowerCase() != 'txt') continue;
        var inStream = fs.createReadStream('outputs/' + files[i])
        var rl = readline.createInterface({input: inStream});
        rl.on('line', function(line) {
            if (/	Fail /.test(line)) {
                failLine++;
                var data = line.match(/	Fail (\w+): 0 : (\w+)/);
                writeStream.write(data[1] + ',' + data[2] + ',0' + os.EOL);
            } else if (/	Error /.test(line)) {
                errorLine++;
            } else if (/	Save /.test(line)) {
                saveLine++;
                var data = line.match(/	Fail (\w+): ([^\s]+) : (\w+)/);
                writeStream.write(data[1] + ',' + data[3] + ',' + data[2] + os.EOL);
            } else if (/	Send /.test(line)) {
                sendLine++;
            }
            if (/: 0 : /.test(line)) {
                zeroLine++;
            } else {
                positive++;
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
    }

    var files = fs.readdirSync('./errors/');
    for (var i = 0; i < files.length; i++) {
        var address = files[i].split('.')[0];
        if (address.length < 32) continue;
        var key = fs.readFileSync('./errors/' + files[i], 'utf8');
        writeStream.write(address + ',' + key + ',0' + os.EOL);
    }
};

run();