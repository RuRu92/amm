const assert = require("assert");
const Amm = artifacts.require('Amm')

contract('Amm', async accounts => {
    it('Should verify deployment', async () => {
        assert.ok(Amm.isDeployed(), "No holdings, undefined")
    })

    it('Can set slippage', async () => {
        assert.ok(Amm.isDeployed(), "No holdings, undefined")
        let amm = await Amm.deployed()
        await amm.setSlippage(0.05 * 100);
        let res = await amm.getSlippage.call()
        assert.equal(res.toString(), "5")
    })


    it('Can perform swap by providing initial pool', async () => {
        assert.ok(Amm.isDeployed(), "No holdings, undefined")
        let amm = await Amm.deployed()
        await amm.faucet(1000, 1000);
        let res = await amm.getMyHoldings();

        assert.equal(res[0].toString(), "1000")
        assert.equal(res[1].toString(), "1000")
        assert.equal(res[2].toString(), "0")

        await amm.provide(100, 100);

        res = await amm.getMyHoldings()

        assert.equal(res[0].toString(), "900")
        assert.equal(res[1].toString(), "900")
        assert.equal(res[2].toString(), "10000")

        res = await amm.getPoolDetails()

        assert.equal(res[0].toString(), "100")
        assert.equal(res[1].toString(), "100")
        assert.equal(res[2].toString(), "10000")

        res = await amm.getSwapToken1EstimateV2(10);
        console.log("=====> Est.")
        console.log(res)
        assert.equal(res.toString(), "10")

        res = await amm.calculateSlippage(13, 10);
        console.log("======> Slippage: ")
        console.log(res)
        assert.equal(res.toString(), "30") // 0.3

    })


    // it('Adding funds', async () => {
    //     let amm = await Amm.deployed()
    //
    //     console.log("Adding funds")
    //     console.log("\n=============\n")
    //     let holdings = await amm.getMyHoldings()
    //     console.log(holdings[0])
    //     console.log(holdings[1])
    //     console.log(holdings[2])
    //     await amm.faucet(1000, 1000)
    //     holdings = await amm.getMyHoldings();
    //     console.log(holdings[0])
    //     console.log(holdings[1])
    //     console.log(holdings[2])
    //
    //     let share = await amm.provide(100, 100);
    //     console.log("Share...")
    //     console.log(share)
    //     console.log("Updated Holdings")
    //     console.log(holdings[0])
    //     console.log(holdings[1])
    //     console.log(holdings[2])
    //
    //     let pool = await amm.getPoolDetails()
    //     console.log("Pool")
    //     console.log(pool)
    //     let res = await amm.getSwapToken1Estimate(10);
    //     console.log("============")
    //     console.log(res)
    //     console.log("============")
    //     console.log("SWAP CHECK")
    //     console.log(await amm.getPoolDetails())
    //
    //     // assert.equal(pool[0].words, 100, "Invalid token 1 amount")
    // })
});