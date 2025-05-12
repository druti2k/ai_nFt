import React, { useEffect } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import NFTGenerator from './components/NFTGenerator';
import './App.css';
import '@solana/wallet-adapter-react-ui/styles.css';

const App: React.FC = () => {
  const wallets = [new PhantomWalletAdapter()];

  useEffect(() => {
    console.log('App component mounted');
    const root = document.getElementById('root');
    console.log('Root element:', root);
    console.log('Root element styles:', root ? window.getComputedStyle(root) : 'Not found');
  }, []);

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <div className="App">
          <header className="App-header">
            <h1>AI NFT Generator</h1>
          </header>
          <main>
            <NFTGenerator />
          </main>
        </div>
      </WalletModalProvider>
    </WalletProvider>
  );
};

export default App; 