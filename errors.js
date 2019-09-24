require('dotenv').config();

const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const axios = require('axios');
const EthereumTx = require('ethereumjs-tx');
const log = require('ololog').configure({time: true});
const ansi = require('ansicolor').nice;
//const runner = require('child_process');
const fs = require('fs');
const readline = require('readline');

const network = `https://mainnet.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`;
const web3 = new Web3(new Web3.providers.HttpProvider(network));

const run = async () => {
	var files = fs.readdirSync('./errors/');
	for (var i = 0; i < files.length; i++) {
		var address = files[i].split('.')[0];
		if (address.length < 32) continue;
		web3.eth.defaultAccount = '0x' + address;
		var myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber();
		var myBalance = web3.fromWei(myBalanceWei, 'ether');
		if (myBalance > 0) {
			log (`balance ${address}: ${myBalance}`.green);
		} else {
			fs.unlink('./errors/' + files[i], function (err) {  });
			log (`balance ${address}: ${myBalance}`);
		}
	}
	if (fs.existsSync('./oks/1.txt')) {
		var inStream = fs.createReadStream('./oks/1.txt');
		var rl = readline.createInterface({input: inStream});
		var zeroLine = 0, positive = 0, failLine = 0, errorLine = 0, saveLine = 0, sendLine = 0;
		var matches;
		rl.on('line', function(line) {
			if (/	Fail /.test(line)) {
				failLine++;
			} else if (/	Error /.test(line)) {
				matches = /(\w+): (\w+)/.exec(line);
				if (matches.length > 1 && matches[1].length >= 32) {
					web3.eth.defaultAccount = '0x' + matches[1];
					var myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber();
					var myBalance = web3.fromWei(myBalanceWei, 'ether');
					if (myBalance > 0) {
						log (`balance ${matches[1]}: ${myBalance}`.green);
					} else {
						log (`balance ${matches[1]}: ${myBalance}`);
					}
				}
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
			}
		});
	}
};

run();