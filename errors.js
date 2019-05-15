require('dotenv').config();

const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const axios = require('axios');
const EthereumTx = require('ethereumjs-tx');
const log = require('ololog').configure({time: true});
const ansi = require('ansicolor').nice;
//const runner = require('child_process');
const fs = require('fs');

const network = `https://mainnet.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`;
const web3 = new Web3(new Web3.providers.HttpProvider(network));

const run = async () => {
	var files = fs.readdirSync('./errors/');
	for(var i = 0; i < files.length; i++) {
		var address = files[i].split('.')[0];
		if (address.length < 32) continue;
		web3.eth.defaultAccount = '0x' + address;
		var myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber();
		var myBalance = web3.fromWei(myBalanceWei, 'ether');
		if (myBalance > 0) {
			log (`balance ${address}: ${myBalance}`.green);
		} else {
			fs.unlink('./errors/' + files[i], function (err) {  });
			//log (`balance ${address}: ${myBalance}`);
		}
	}
};

run();