import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { AptosClient } from "aptos";
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Contact from './components/Contact';
import Header from './components/Header';
import Footer from './components/Footer';


function hexToUint8Array(hex) {
  if (hex.startsWith("0x")) {
      hex = hex.slice(2);
  }

  // Convert hex string to Uint8Array
  let bytes = new Uint8Array(32);
  let hexBytes = Uint8Array.from(Buffer.from(hex, 'hex'));

  // Ensure it's 32 bytes long by padding with leading zeros if necessary
  bytes.set(hexBytes, 32 - hexBytes.length);
  
  return bytes;
}



const App = () => {
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Aptos client
    setClient(new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1"));
  }, []);

  const connectWallet = async () => {
    try {
      const petraWallet = new PetraWallet();
      await petraWallet.connect();
      setWallet(petraWallet);
      setIsConnected(true);

      // Fetch wallet address
      const account = await petraWallet.account();
      setWalletAddress(account.address);
      account_data = {
        "accountAddress": account.address,
        "publicKey": account.publicKey
    }
    const uint8Array = hexToUint8Array(account_data.accountAddress);

    console.log(uint8Array);
      console.log("Wallet Address:", account_data);

      // Fetch balance if client is available
      if (client) {
        const balance = await client.getAccountResource(account.address, "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
        setWalletBalance(parseInt(balance.data.coin.value) / 1e8); // Convert from Octas to APT
        console.log("Wallet Balance:", balance.data.coin.value);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setIsConnected(false);
    }
  };

  const disconnectWallet = () => {
    if (wallet) {
      wallet.disconnect();
    }
    setWallet(null);
    setWalletAddress("");
    setWalletBalance(0);
    setIsConnected(false);
  };

  return (
    <Router>
      <Header 
        wallet={wallet} 
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        isConnected={isConnected} 
        connectWallet={connectWallet} 
        disconnectWallet={disconnectWallet} 
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={
          <Dashboard 
            wallet={wallet} 
            walletAddress={walletAddress}
            walletBalance={walletBalance}
            client={client} 
            isConnected={isConnected} 
            connectWallet={connectWallet}
          />
        } />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
