const source = 'https://etherscan.io/accounts/';
const https = require('https');
const fs = require('fs');
const n = 10;

var c = 0;
var address_arr = [];

for (var i = 1; i <= n; i++) {
	var taget = source + i;
	https.get(taget, (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			var table = data.match(/<tbody>[\w\W]+?<\/tbody>/i);
			var tr = table[0].match(/<tr>[\w\W]+?<\/tr>/ig);
			for(var j = 0; j < tr.length; j++) {
				var td = tr[j].match(/<td>[\w\W]*?<\/td>/ig);
				if (!/<td>[\s\n]*?<\/td>/.test(td[1])) continue;
				var address = tr[j].match(/>(0x\w+)?<\/a>/);
				address_arr.push(address[1]);
			}
			c++;
		});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
}

var timer = setInterval(function (args) {
	if (c >= n) {
		clearInterval(timer);
		fs.writeFile('address.js', "'use strict';\n\nmodule.exports = [\n\t'" + address_arr.join("',\n\t'") + "'\n];", function (err) {
			if(err) {
				return console.log(err);
			}
			console.log("The file was saved!");
		});
	}
}, 1000);