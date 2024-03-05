const assert = require('assert');
const ganache = require('ganache');
const { Web3 } = require('web3');
const { abi, evm } = require('../compile')['Inbox.sol'].Inbox;

const INITIAL_MESSAGE = process.env.INITIAL_MESSAGE;
const UPDATE_MESSAGE = process.env.UPDATE_MESSAGE;

const web3 = new Web3(ganache.provider());

let accounts;
let inbox;
beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy
    // the contract
    inbox = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object, arguments: [INITIAL_MESSAGE] })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Inbox', () => {
    it('check contract deployment', () => {
        assert.ok(inbox.options.address);
    });

    it('check initial message', async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, INITIAL_MESSAGE);
    });

    it('check update message', async () => {
        await inbox.methods.setMessage(UPDATE_MESSAGE).send({ from: accounts[1] });
        const message = await inbox.methods.message().call();
        assert.equal(message, UPDATE_MESSAGE);
    })
});