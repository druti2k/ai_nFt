import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { AiNftBrowserClient } from '../utils/ai-nft-program';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const AIGenerator: React.FC = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<AiNftBrowserClient | null>(null);
  
  useEffect(() => {
    // Initialize client
    setClient(new AiNftBrowserClient(connection));
  }, [connection]);

  const generateImage = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          walletAddress: publicKey.toString(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async () => {
    if (!result || !connected || !publicKey || !client) return;
    
    setLoading(true);
    
    try {
      // Generate a new mint keypair
      const mintKeypair = Keypair.generate();
      const mintPubkey = mintKeypair.publicKey;
      
      // Get token account
      const tokenAddress = await getAssociatedTokenAddress(
        mintPubkey,
        publicKey
      );
      
      // Get metadata address
      const [metadataAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('metadata'), mintPubkey.toBuffer()],
        new PublicKey('YOUR_PROGRAM_ID_HERE')
      );
      
      // Create transaction for initialization
      const initTx = await client.createInitializeTransaction(
        publicKey,
        mintPubkey,
        tokenAddress,
        metadataAddress,
        `AI NFT: ${prompt.substring(0, 30)}...`,
        'AINFT',
        result.metadataUri
      );
      
      // Send the transaction
      const signature = await sendTransaction(initTx, connection, {
        signers: [mintKeypair]
      });
      
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Create transaction for minting
      const mintTx = await client.createMintTransaction(
        publicKey,
        mintPubkey,
        tokenAddress,
        metadataAddress,
        Date.now().toString(),
        result.imageUri,
        result.metadataUri
      );
      
      // Send the transaction
      const mintSignature = await sendTransaction(mintTx, connection);
      
      await connection.confirmTransaction(mintSignature, 'confirmed');
      
      alert(`NFT minted successfully! Signature: ${mintSignature}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error minting NFT:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-generator">
      <h1>AI NFT Generator</h1>
      
      <div className="wallet-section">
        <WalletMultiButton />
      </div>
      
      {connected ? (
        <div className="generator-form">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows={4}
          />
          
          <button 
            onClick={generateImage} 
            disabled={loading || !prompt.trim()}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
          
          {error && <div className="error">{error}</div>}
          
          {result && (
            <div className="result">
              <h3>Your AI Generated NFT</h3>
              <img src={result.imageUri} alt="AI generated" />
              
              <div className="metadata">
                <h4>Metadata</h4>
                <pre>{JSON.stringify(result.metadata, null, 2)}</pre>
              </div>
              
              <button 
                onClick={mintNFT}
                disabled={loading}
                className="mint-btn"
              >
                Mint as NFT
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="connect-prompt">
          Please connect your wallet to get started
        </div>
      )}
    </div>
  );
}; 