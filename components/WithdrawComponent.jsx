import { useState } from "react";
import BoxTemplate from "./BoxTemplate";
import { PRECISION } from "../utils/constants";
import {NumberUtils} from "../utils/NumberUtils";

export default function WithdrawComponent(props) {
    const [amountOfShare, setAmountOfShare] = useState(0);
    const [estimateTokens, setEstimateTokens] = useState([]);
    const onChangeAmountOfShare = async (e) => {
        setAmountOfShare(e.target.value);
        if (!["", "."].includes(e.target.value) && props.contract !== null) {
            try {
                let response = await props.contract.getWithdrawEstimate(
                    BigInt(e.target.value) * BigInt(PRECISION)
                );
                setEstimateTokens([
                    BigInt(response.amountToken1) / BigInt(PRECISION),
                    BigInt(response.amountToken2) / BigInt(PRECISION),
                ]);
            } catch (err) {
                alert(err?.data?.message);
            }
        }
    };

    // Gets the maximun share one can withdraw
    const getMaxShare = async () => {
        if (props.contract !== null) {
            setAmountOfShare(props.maxShare);
            let response = await props.contract.getWithdrawEstimate(
                BigInt(props.maxShare) * BigInt(PRECISION)
            );
            setEstimateTokens([
                BigInt(response.amountToken1) / BigInt(PRECISION),
                BigInt(response.amountToken2) / BigInt(PRECISION),
            ]);
        } else alert("Connect to Metamask");
    };

    // Withdraws the share
    const withdrawShare = async () => {
        if (["", "."].includes(amountOfShare)) {
            alert("Amount should be a valid number");
            return;
        }
        if (BigInt(props.maxShare) < BigInt(amountOfShare)) {
            alert("Amount should be less than your max share");
            return;
        }
        if (props.contract === null) {
            alert("Connect to Metamask");
            return;
        } else {
            try {
                let response = await props.contract.withdraw(BigInt(amountOfShare) * BigInt(PRECISION));
                console.log(response);
                await response.wait();
                setAmountOfShare(0);
                setEstimateTokens([]);
                await props.getHoldings();
                alert("Success!");
            } catch (err) {
                alert(err?.data?.message);
            }
        }
    };
    return (
        <div className="tabBody">
            <BoxTemplate
                leftHeader={"Amount:"}
                right={
                    <div onClick={() => getMaxShare()} className="getMax">
                        Max
                    </div>
                }
                value={amountOfShare}
                onChange={(e) => onChangeAmountOfShare(e)}
            />
            {estimateTokens.length > 0 && (
                <div className="withdrawEstimate">
                    <div className="amount">Amount of ETH: {NumberUtils.fromNumber(estimateTokens[0])}</div>
                    <div className="amount">Amount of USDT: {NumberUtils.fromNumber(estimateTokens[1])}</div>
                </div>
            )}
            <div className="bottomDiv">
                <div className="btn" onClick={() => withdrawShare()}>
                    Withdraw
                </div>
            </div>
        </div>
    );
}
