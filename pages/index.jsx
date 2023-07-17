import React from 'react';
import {ethers} from "ethers";
import {useState} from "react";
import {abi, CONTRACT_ADDRESS} from "../utils/constants";
import ContainerComponent from "../components/ContainerComponent";

import styles from '../styles/Home.module.css'

const Home = () => {
    const [myContract, setMyContract] = useState(null);
    const [address, setAddress] = useState();

    let provider, signer, add;

    // Connects to Metamask and sets the myContract state with a new instance of the contracts
    async function connect() {
        let res = await connectToMetamask();
        if (res) {
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts"
                });
                console.log(accounts);
            } catch (err) {
                console.log("Failed getting accounts")
            }
            provider = new ethers.BrowserProvider(window.ethereum)
            signer = await provider.getSigner();
            add = await signer.getAddress();
            setAddress(add);
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
                console.log(contract);
                setMyContract(contract);
            } catch (err) {
                alert("CONTRACT_ADDRESS not set properly");
            }
        } else {
            alert("Couldn't connect to Metamask");
        }
    }

    // Helps open Metamask
    async function connectToMetamask() {
        try {
            if (window.ethereum)
                return true;
        } catch (err) {
            return false;
        }
    }

    return (
        <div className="pageBody">
            <div className="navBar">
                <div className="appName"> AMM </div>
                {myContract === null ? (
                    <div className="connectBtn" onClick={() => connect()}>
                        {" "}
                        Connect to Metamask{" "}
                    </div>
                ) : (
                    <div className="connected"> {"Connected to " + address} </div>
                )}
            </div>
            <ContainerComponent contract={myContract} connect={() => connect()} />
        </div>
    );
}

export default Home
