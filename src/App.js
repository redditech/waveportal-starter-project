import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
const App = () => {
  /*
  * A state variable to store the user's public wallet
  */
  const [currentAccount, setCurrentAccount] = useState("");

  // state property to store all waves
  const [allWaves, setAllWaves] = useState([]);

  // state variable to store the message
  const [message, setMessage] = useState('');

  /* 
  * A state variable to store the contract address after it is deployed
  */
  const contractAddress = "0x67434A3854610f700a353dA9Ab6F28bf7bEc3593"
  const contractABI = abi.abi;

  const onInputChange = (event) => {
    const {value} = event.target;
    setMessage(value);
  }

  // method to get all waves from the contract
  const getAllWaves = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavesPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // call getAllWaves method from smart contract
        const waves = await wavesPortalContract.getAllWaves();

        // we only need address, timestamp and message in the UI
        const wavesCleaned = [];
        waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          }
        });

        setAllWaves(wavesCleaned);
      }
      else {
        console.log("Ethereum object doesn't exist");
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  // Listen in for emitter events!
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ])
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
     

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);

      return () => {
        if (wavePortalContract) {
          wavePortalContract.off("NewWave", onNewWave);
        }
      }
    };
  }, []);

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
        setCurrentAccount(account);
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
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

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

  useEffect(() => {
    getAllWaves();
  }, [currentAccount])



  const wave = async () => {
    try {

      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("started");
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        if (message.length >0) {
          const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
          await waveTxn.wait();
          console.log("Mining... ", waveTxn.hash);   
          console.log("Mined -- ", waveTxn.hash);
        } else {
          console.log("Empty input. Try again.");
        }
        
        
        

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

        <form 
        onSubmit={(event) => {
          event.preventDefault();
          wave();
        }}
        >
          <input type="text" placeholder="Send me a message and wave!" value={message} onChange={onInputChange} />
          <button type="submit" className="waveButton submit-wave-button">Wave at me</button>
        </form>

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

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div className="sub-text">Address: {wave.address}</div>
              <div className="sub-text">Time: {wave.timestamp.toString()}</div>
              <div className="sub-text">Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App