import { MdAdd } from "react-icons/md";
import { useState } from "react";
import BoxTemplate from "./BoxTemplate";
import { PRECISION } from "../utils/constants";
import {NumberUtils} from "../utils/NumberUtils";

export default function ProvideComponent(props) {
    const [amountOfEth, setAmountOfEth] = useState(0);
    const [amountOfUsdt, setAmountOfUsdt] = useState(0);
    const [error, setError] = useState("");

    // Gets estimates of a token to be provided in the pool given the amount of other token
    const getProvideEstimate = async (token, value) => {
        if (["", "."].includes(value)) return;
        if (props.contract !== null) {
            try {
                let estimate;
                if (token === "ETH") {
                    estimate = await props.contract.getEquivalentToken2Estimate(
                        BigInt(value) * BigInt(PRECISION)
                    );
                    setAmountOfUsdt(BigInt(estimate) / BigInt(PRECISION));
                } else {
                    estimate = await props.contract.getEquivalentToken1Estimate(
                        BigInt(value) * BigInt(PRECISION)
                    );
                    setAmountOfEth(BigInt(estimate) / BigInt(PRECISION));
                }
            } catch (err) {
                if (err?.data?.message?.includes("Zero Liquidity")) {
                    setError("Message: Empty pool. Set the initial conversion rate.");
                } else {
                    alert(err?.data?.message);
                }
            }
        }
    };

    const onChangeAmountOfEth = (e) => {
        setAmountOfEth(e.target.value);
        getProvideEstimate("ETH", e.target.value);
    };

    const onChangeAmountOfUsdt = (e) => {
        setAmountOfUsdt(e.target.value);
        getProvideEstimate("USDT", e.target.value);
    };

    // Adds liquidity to the pool
    const provide = async () => {
        if (["", "."].includes(amountOfEth) || ["", "."].includes(amountOfUsdt)) {
            alert("Amount should be a valid number");
            return;
        }
        if (props.contract === null) {
            alert("Connect to Metamask");
            return;
        } else {
            try {
                let response = await props.contract.provide(
                    BigInt(amountOfEth) * BigInt(PRECISION),
                    BigInt(amountOfUsdt) * BigInt(PRECISION)
                );
                await response.wait();
                setAmountOfEth(0);
                setAmountOfUsdt(0);
                await props.getHoldings();
                alert("Success");
                setError("");
            } catch (err) {
                err && alert(err?.data?.message);
            }
        }
    };

    return (
        <div className="tabBody">
            <BoxTemplate
                leftHeader={"Amount of ETH"}
                value={NumberUtils.fromNumber(amountOfEth)}
                onChange={(e) => onChangeAmountOfEth(e)}
            />
            <div className="swapIcon">
                <MdAdd />
            </div>
            <BoxTemplate
                leftHeader={"Amount of USDT"}
                value={NumberUtils.fromNumber(amountOfUsdt)}
                onChange={(e) => onChangeAmountOfUsdt(e)}
            />
            <div className="error">{error}</div>
            <div className="bottomDiv">
                <div className="btn" onClick={() => provide()}>
                    Provide
                </div>
            </div>
        </div>
    );
}
