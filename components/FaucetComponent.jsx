import { useState } from "react";
import BoxTemplate from "./BoxTemplate";
import { PRECISION } from "../utils/constants";

export default function FaucetComponent(props) {
    const [amountOfEth, setAmountOfEth] = useState(0);
    const [amountOfUsdt, setAmountOfUsdt] = useState(0);

    const onChangeAmountOfUsdt = (e) => {
        setAmountOfUsdt(e.target.value);
    };

    const onChangeAmountOfEth = (e) => {
        setAmountOfEth(e.target.value);
    };
	
    // Funds the account with given amount of Tokens 
    async function onClickFund() {
        if (props.contract === null) {
            alert("Connect to Metamask");
            return;
        }
        if (["", "."].includes(amountOfEth) || ["", "."].includes(amountOfUsdt)) {
            alert("Amount should be a valid number");
            return;
        }
        try {
            let response = await props.contract.faucet(
                amountOfEth * PRECISION,
                amountOfUsdt * PRECISION
            );
            let res = await response.wait();
            console.log("res", res);
            setAmountOfEth(0);
            setAmountOfUsdt(0);
            await props.getHoldings();
            alert("Success");
        } catch (err) {
            err?.data?.message && alert(err?.data?.message);
            console.log(err);
        }
    }

    return (
        <div className="tabBody">
            <BoxTemplate
                leftHeader={"Amount of ETH"}
                right={"ETH"}
                value={amountOfEth}
                onChange={(e) => onChangeAmountOfEth(e)}
            />
            <BoxTemplate
                leftHeader={"Amount of USDT"}
                right={"USDT"}
                value={amountOfUsdt}
                onChange={(e) => onChangeAmountOfUsdt(e)}
            />
            <div className="bottomDiv">
                <div className="btn" onClick={() => onClickFund()}>
                    Fund
                </div>
            </div>
        </div>
    );
}
