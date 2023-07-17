const Amm = artifacts.require("Amm.sol");

module.exports = function (deployer) {
    deployer
        .deploy(Amm)
        .then(() => Amm.deployed())
        .then((_instance) => {
            console.log(
                "Amm contract deployed to following address: ",
                _instance.address
            )
        })
}