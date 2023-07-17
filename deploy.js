const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const {abi, evm} = require('./compile');

provider = new HDWalletProvider(
    'obscure special warm card cause novel warrior ghost large pear fuel abandon',
    'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
);

const web3 = new Web3(provider);

const estimateGas = async () => {
    try {
        const result = await new web3.eth.Contract(abi)
            .deploy({data: evm.bytecode.object, arguments: []})
            .estimateGas();

        console.log('Gas Estimate: ', result)
    } catch (err) {
        console.error('Gas Estimation Error:', error);
    }
}

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);
    //
    // const result = await new web3.eth.Contract(abi)
    //     .deploy({data: evm.bytecode.object, arguments: []})
    //     .send({gas: '1600000', from: accounts[0]});
    //
    // console.log(result);
    // console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
};

deploy();
