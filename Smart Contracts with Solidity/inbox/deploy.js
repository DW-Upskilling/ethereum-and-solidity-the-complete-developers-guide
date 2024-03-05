const { Web3 } = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { interface, bytecode } = require('./compile').contracts[':Inbox'];

require('dotenv').config()
const INITIAL_MESSAGE = process.env.INITIAL_MESSAGE;
const mnemonicPhrase = process.env.MNEMONIC_PHRASE;
const providerUrl = process.env.PROVIDER_URL;

const provider = new HDWalletProvider({
    mnemonic: mnemonicPhrase,
    providerOrUrl: providerUrl
});
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account: ', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [INITIAL_MESSAGE] })
        .send({ gas: '1000000', from: accounts[0] });
    console.log('Contract deployed at ', result['_address']);

    provider.engine.stop();
}
deploy();