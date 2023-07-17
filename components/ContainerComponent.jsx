import { useEffect, useState } from "react";
import SwapComponent from "./SwapComponent";
import ProvideComponent from "./ProvideComponent";
import WithdrawComponent from "./WithdrawComponent";
import FaucetComponent from "./FaucetComponent";
import { PRECISION } from "../utils/constants";
import { NumberUtils } from "../utils/NumberUtils";

export default function ContainerComponent(props) {
    const [activeTab, setActiveTab] = useState("Swap");
    const [amountOfETH, setAmountOfETH] = useState(0);
    const [amountOfUSDT, setAmountOfUSDT] = useState(0);
    const [amountOfShare, setAmountOfShare] = useState(0);
    const [totalETH, setTotalETH] = useState(0);
    const [totalUSDT, setTotalUSDT] = useState(0);
    const [totalShare, setTotalShare] = useState(0);

    useEffect(() => {
        getHoldings();
    });

    // Fetch the pool details and personal assets details.
    async function getHoldings() {
        try {
            console.log("Fetching holdings----");
            let response = await props.contract.getMyHoldings();
            console.log("Holdings... \n: " + response);
            setAmountOfETH(BigInt(response.amountToken1) / BigInt(PRECISION));
            setAmountOfUSDT(BigInt(response.amountToken2) / BigInt(PRECISION));
            setAmountOfShare(BigInt(response.myShare) / BigInt(PRECISION));

            response = await props.contract.getPoolDetails();
            console.log("Pool... \n: " + response);
            setTotalETH(BigInt(response[0]) / BigInt(PRECISION));
            setTotalUSDT(BigInt(response[1]) / BigInt(PRECISION));
            setTotalShare(BigInt(response[2]) / BigInt(PRECISION));
        } catch (err) {
            console.log("Couldn't Fetch holdings", err);
        }
    }

    const changeTab = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="centerBody">
            <div className="centerContainer">
                <div className="selectTab">
                    <div
                        className={"tabStyle " + (activeTab === "Swap" ? "activeTab" : "")}
                        onClick={() => changeTab("Swap")}
                    >
                        Swap
                    </div>
                    <div
                        className={
                            "tabStyle " + (activeTab === "Provide" ? "activeTab" : "")
                        }
                        onClick={() => changeTab("Provide")}
                    >
                        Provide
                    </div>
                    <div
                        className={
                            "tabStyle " + (activeTab === "Withdraw" ? "activeTab" : "")
                        }
                        onClick={() => changeTab("Withdraw")}
                    >
                        Withdraw
                    </div>
                    <div
                        className={
                            "tabStyle " + (activeTab === "Faucet" ? "activeTab" : "")
                        }
                        onClick={() => changeTab("Faucet")}
                    >
                        Faucet
                    </div>
                </div>

                {activeTab === "Swap" && (
                    <SwapComponent
                        contract={props.contract}
                        getHoldings={() => getHoldings()}
                    />
                )}
                {activeTab === "Provide" && (
                    <ProvideComponent
                        contract={props.contract}
                        getHoldings={() => getHoldings()}
                    />
                )}
                {activeTab === "Withdraw" && (
                    <WithdrawComponent
                        contract={props.contract}
                        maxShare={NumberUtils.fromNumber(amountOfShare)}
                        getHoldings={() => getHoldings()}
                    />
                )}
                {activeTab === "Faucet" && (
                    <FaucetComponent
                        contract={props.contract}
                        getHoldings={() => getHoldings()}
                    />
                )}
            </div>
            <div className="details">
                <div className="detailsBody">
                    <div className="detailsHeader">Details</div>
                    <div className="detailsRow">
                        <div className="detailsAttribute">Amount of ETH:</div>
                        <div className="detailsValue">{NumberUtils.fromNumber(amountOfETH)}</div>
                    </div>
                    <div className="detailsRow">
                        <div className="detailsAttribute">Amount of USDT:</div>
                        <div className="detailsValue">{NumberUtils.fromNumber(amountOfUSDT)}</div>
                    </div>
                    <div className="detailsRow">
                        <div className="detailsAttribute">Your Share:</div>
                        <div className="detailsValue">{NumberUtils.fromNumber(amountOfShare)}</div>
                    </div>
                    <div className="detailsHeader">Pool Details</div>
                    <div className="detailsRow">
                        <div className="detailsAttribute">Total ETH:</div>
                        <div className="detailsValue">{NumberUtils.fromNumber(totalETH)}</div>
                    </div>
                    <div className="detailsRow">
                        <div className="detailsAttribute">Total USDT:</div>
                        <div className="detailsValue">{NumberUtils.fromNumber(totalUSDT)}</div>
                    </div>
                    <div className="detailsRow">
                        <div className="detailsAttribute">Total Shares:</div>
                        <div className="detailsValue">{NumberUtils.fromNumber(totalShare)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}