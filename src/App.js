import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
const App = () => {
  /*
  * A state variable to store the user's public wallet
  */
  const [currentAccount, setCurrentAccount] = useState("");

  /* 
  * A state variable to store the contract address after it is deployed
  */
 const contractAddress = "0xC9Af4E56741f255743e8f4877d4cfa9971E910C2"
 const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      /*
      * First make sure we have access to window.ethereum
      */
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask");
        return;
      } else {
        console.log("We have the ethereum object");
      }

      /*
      * Check if we're authorised to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Implement the connectWallet method
   */

  const connectWallet = async () => {
    try {
      const { ethereum} = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  /* 
  * This runs our function when the page loads
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const wave = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
       const waveTxn = await wavePortalContract.wave();
       console.log("Mining... ", waveTxn.hash);

       await waveTxn.wait();
       console.log("Mined -- ", waveTxn.hash);

       count = await wavePortalContract.getTotalWaves();
       console.log("Retrieved total wave count... ", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Nissan and I am learning to code my first DApp so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {
        /*
        * If there is no currentAccount render this button
        */
        }
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default App