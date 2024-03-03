const assert = require('assert');
const ganache = require('ganache');
const { Web3 } = require('web3');
const { interface, bytecode } = require('../compile').contracts[':Inbox'];

const INITIAL_MESSAGE = 'Hello World!';
const UPDATE_MESSAGE = 'Hello Universe!';

const web3 = new Web3(ganache.provider());

let accounts;
let inbox;
beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy
    // the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [INITIAL_MESSAGE] })
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