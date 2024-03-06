const assert = require('assert');
const ganache = require('ganache');
const { Web3 } = require('web3');
const { interface, bytecode } = require('../compile.js');

const web3 = new Web3(ganache.provider());

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploy a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[1], players[0]);
        assert.equal(players.length, 1);
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.2', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[1], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(players.length, 3);
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[1],
                value: 0
            });
            assert(false);
        } catch (err) {
            assert.ok(err);
        }
    });

    it('only manger can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1],
            });
            assert(false);
        } catch (err) {
            assert.ok(err);
        }
    });

    it('sends money to winner and resets', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('1', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[1]);
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });
        const finalBalance = await web3.eth.getBalance(accounts[1]);

        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('.8', 'ether'));

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(players.length, 0);
    });
});
