const { Web3 } = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { abi, evm } = require('./compile')['Inbox.sol'].Inbox;

require('dotenv').config()
const INITIAL_MESSAGE = process.env.INITIAL_MESSAGE;
const mnemonicPhrase = process.env.MNEMONIC_PHRASE;
const sepoliaInfuraUrl = process.env.SEPOLIA_INFURA_URL;

const provider = new HDWalletProvider({
    mnemonic: mnemonicPhrase,
    providerOrUrl: sepoliaInfuraUrl
});
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account: ', accounts[0]);

    const result = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object, arguments: [INITIAL_MESSAGE] })
        .send({ gas: '1000000', from: accounts[0] });
    console.log('Contract deployed at ', result.options.address);

    provider.engine.stop();
}
deploy();