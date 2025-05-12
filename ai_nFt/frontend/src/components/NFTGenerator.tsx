import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import './NFTGenerator.css';

interface NFTGeneratorProps {
  onGenerate?: (imageUrl: string) => void;
}

const NFTGenerator: React.FC<NFTGeneratorProps> = ({ onGenerate }) => {
  const { publicKey } = useWallet();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('512x512');
  const [share, setShare] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('NFTGenerator mounted');
    console.log('Initial state:', {
      publicKey: publicKey?.toString(),
      prompt,
      size,
      share,
      isGenerating,
      isMinting,
      generatedImage,
      shareUrl,
      error
    });
  }, [publicKey, prompt, size, share, isGenerating, isMinting, generatedImage, shareUrl, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Handling submit with:', { prompt, size, share, publicKey: publicKey?.toString() });

    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setIsGenerating(true);
    console.log('Starting generation process...');

    try {
      const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          size,
          share,
          walletAddress: publicKey.toString(),
        }),
      });

      console.log('Received response:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate NFT');
      }

      const data = await response.json();
      console.log('Generation successful:', data);
      
      setGeneratedImage(data.imageUri);
      if (data.shareUrl) {
        setShareUrl(data.shareUrl);
      }
      onGenerate?.(data.imageUri);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate NFT');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share URL copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy URL:', err);
        alert('Failed to copy share URL');
      }
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'generated-nft.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleMint = async () => {
    if (!generatedImage) return;
    
    setIsMinting(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: generatedImage,
          walletAddress: publicKey?.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mint NFT');
      }

      const data = await response.json();
      alert(`NFT minted successfully! Transaction: ${data.signature}`);
    } catch (err) {
      console.error('Minting error:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="nft-generator">
      <div className="wallet-button">
        <WalletMultiButton />
      </div>
      
      <form onSubmit={handleSubmit} className="generator-form">
        <div className="input-group">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your NFT description..."
            className="prompt-input"
            disabled={isGenerating}
          />
        </div>

        <div className="options-group">
          <div className="size-selector">
            <label>Size:</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              disabled={isGenerating}
            >
              <option value="256x256">256x256</option>
              <option value="512x512">512x512</option>
              <option value="1024x1024">1024x1024</option>
            </select>
          </div>

          <div className="share-option">
            <label>
              <input
                type="checkbox"
                checked={share}
                onChange={(e) => setShare(e.target.checked)}
                disabled={isGenerating}
              />
              Share publicly
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="generate-button"
          disabled={isGenerating || !publicKey}
        >
          {isGenerating ? 'Generating...' : 'Generate NFT'}
        </button>

        {error && <div className="error-message">{error}</div>}

        {generatedImage && (
          <div className="generated-image">
            <img src={generatedImage} alt="Generated NFT" />
            <div className="action-buttons">
              {shareUrl && (
                <button onClick={handleShare} className="share-button">
                  Share
                </button>
              )}
              <button onClick={handleDownload} className="download-button">
                Download
              </button>
              <button
                onClick={handleMint}
                disabled={isMinting}
                className="mint-button"
              >
                {isMinting ? 'Minting...' : 'Mint NFT'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default NFTGenerator; 