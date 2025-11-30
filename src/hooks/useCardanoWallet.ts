import { useState, useEffect } from 'react';
import { BrowserWallet } from '@meshsdk/core';

export function useCardanoWallet() {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string>('');

  const connectWallet = async () => {
    try {
      const browserWallet = await BrowserWallet.enable('lace');
      setWallet(browserWallet);
      setConnected(true);
      
      const addresses = await browserWallet.getUsedAddresses();
      setAddress(addresses[0] || '');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setConnected(false);
    setAddress('');
  };

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        if (window.cardano?.lace?.isEnabled()) {
          await connectWallet();
        }
      } catch (error) {
        console.log('No wallet connected');
      }
    };
    
    checkConnection();
  }, []);

  return {
    wallet,
    connected,
    address,
    connectWallet,
    disconnectWallet
  };
}