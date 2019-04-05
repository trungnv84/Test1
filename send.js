require('dotenv').config();

const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');
const log = require('ololog').configure({time: true});
const ansi = require('ansicolor').nice;
const fs = require('fs');

const address = require('./address.js');

var walletAddress = process.argv[2];
var gasPrices = process.argv[3];
var privateKey = process.argv[4];
var testing = process.argv[5];

if (testing === '1') {
	var chainId = 4; // EIP 155 chainId - mainnet: 1, rinkeby: 4
	var network = `https://rinkeby.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`;
} else {
	var chainId = 1; // EIP 155 chainId - mainnet: 1, rinkeby: 4
	var network = `https://mainnet.infura.io/v3/${process.env.INFURA_ACCESS_TOKEN}`;
}

const web3 = new Web3(new Web3.providers.HttpProvider(network));
web3.eth.defaultAccount = walletAddress;

var myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber();
var myBalance = web3.fromWei(myBalanceWei, 'ether');
if (testing === '1') {
	var amountToSend = 0.1;
} else {
	var amountToSend = Math.floor(myBalance * 0.9999);
}

log(`Your wallet balance is currently ${myBalance} ETH`.green);

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

const transaction = new EthereumTx(details);
transaction.sign(Buffer.from(privateKey, 'hex'));
const serializedTransaction = transaction.serialize();

try {
	log (`Send ${walletAddress}: ${amountToSend} : ${privateKey}`.cyan);
	const transactionId = web3.eth.sendRawTransaction('0x' + serializedTransaction.toString('hex'));
	fs.writeFile('oks/' + defaultAccount + '.txt', privateKey + "\n" + transactionId, function(err) {
		log (`Done ${walletAddress}: ${amountToSend} : ${privateKey}`.green);
		/*if(err) {
			return console.log(err);
		}
		console.log("The file was saved!");*/
	})
} catch (error) {
	log (`Fail ${walletAddress}: ${amountToSend} : ${privateKey}`);
	return;
}

if (testing === '1') {
	var url = `https://rinkeby.etherscan.io/tx/${transactionId}`;
} else {
	var url = `https://etherscan.io/tx/${transactionId}`;
}
log(url.cyan);

log(`Note: please allow for 30 seconds before transaction appears on Etherscan`.magenta);