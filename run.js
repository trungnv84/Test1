require('dotenv').config();

const axios = require('axios');
const log = require('ololog').configure({time: true});
const ansi = require('ansicolor').nice;
const runner = require('child_process');

const address = require('./address.js');

const getCurrentGasPrices = async () => {
	let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
	let prices = {
		low: response.data.safeLow / 10,
		medium: response.data.average / 10,
		high: response.data.fast / 10
	};

	console.log("\r\n");
	log (`Current ETH Gas Prices (in GWEI):`.cyan);
	console.log("\r\n");
	log(`Low: ${prices.low} (transaction completes in < 30 minutes)`.green);
	log(`Standard: ${prices.medium} (transaction completes in < 5 minutes)`.yellow);
	log(`Fast: ${prices.high} (transaction completes in < 2 minutes)`.red);
	console.log("\r\n");

	return prices;
}

const rk = () => {
	var k = '';
	var ks = '1234567890abcdef';
	for(var i = 0; i < 64; i++) {
		k += ks[Math.round(Math.random() * (ks.length - 1))];
	}
	return k;
}

const run = () => {
	var pk = rk();
	var count = 0;
	for(var i = 0; i < address.length; i++) {
		//log('node send.js ' + address[i] + ' ' + gasPrices + ' ' + pk);
		runner.exec('node send.js ' + address[i] + ' ' + gasPrices + ' ' + pk, function (err, response, stderr) {
			count++;
			if (err) {
				//log (`Error`);
				log(err);
				log(response);
				log(stderr);
			} else {
				//log (`Run`);
				//log(response);
			}
		});
	}
	var timer = setInterval(function (args) {
		running();
	}, 1000);
	var running = function () {
		if (count >= address.length) {
			clearInterval(timer);
			getGasPrices();
		}
	};
};

var gasPrices = 10;

const getGasPrices = async () => {
	gasPrices = await getCurrentGasPrices();
	gasPrices = gasPrices.high;
	run();
};

getGasPrices();