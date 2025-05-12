import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { AiNftClient } from './ai-nft-client';

// Mock the Connection class
jest.mock('@solana/web3.js', () => {
  const originalModule = jest.requireActual('@solana/web3.js');
  const mockProgramId = new originalModule.PublicKey('11111111111111111111111111111111');
  const mockMintId = new originalModule.PublicKey('11111111111111111111111111111112');

  return {
    ...originalModule,
    Connection: jest.fn().mockImplementation(() => ({
      requestAirdrop: jest.fn().mockResolvedValue('mock-signature'),
      confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
      getTransaction: jest.fn().mockResolvedValue({
        transaction: {
          message: {
            accountKeys: [
              { pubkey: mockProgramId },
              { pubkey: mockMintId }
            ]
          }
        }
      }),
      sendTransaction: jest.fn().mockResolvedValue('mock-transaction-signature'),
      getMinimumBalanceForRentExemption: jest.fn().mockResolvedValue(1000000)
    }))
  };
});

describe('AiNftClient', () => {
  let connection: Connection;
  let payer: Keypair;
  let client: AiNftClient;

  beforeEach(() => {
    connection = new Connection('http://mock-url');
    payer = Keypair.generate();
    client = new AiNftClient(connection, payer);
  });

  it('should initialize an NFT collection', async () => {
    const name = 'Test Collection';
    const symbol = 'TEST';
    const uri = 'https://example.com/metadata.json';

    const signature = await client.initialize(name, symbol, uri);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
    expect(signature).toBe('mock-transaction-signature');
  });

  it('should mint an NFT', async () => {
    const mintPubkey = new PublicKey('11111111111111111111111111111112');
    const tokenId = '1';
    const imageUrl = 'https://example.com/image.jpg';
    const metadata = JSON.stringify({
      name: 'Test NFT',
      description: 'A test NFT',
      image: imageUrl,
    });

    const [tokenAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('token'), mintPubkey.toBuffer()],
      new PublicKey('11111111111111111111111111111111')
    );

    const mintSignature = await client.mint(
      mintPubkey,
      tokenAddress,
      tokenId,
      imageUrl,
      metadata
    );

    expect(mintSignature).toBeDefined();
    expect(typeof mintSignature).toBe('string');
    expect(mintSignature).toBe('mock-transaction-signature');
  });

  it('should transfer an NFT', async () => {
    const mintPubkey = new PublicKey('11111111111111111111111111111112');
    const [tokenAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('token'), mintPubkey.toBuffer()],
      new PublicKey('11111111111111111111111111111111')
    );

    const destination = Keypair.generate();
    const [destinationTokenAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('token'), mintPubkey.toBuffer()],
      new PublicKey('11111111111111111111111111111111')
    );

    const transferSignature = await client.transfer(
      tokenAddress,
      destinationTokenAddress,
      1
    );

    expect(transferSignature).toBeDefined();
    expect(typeof transferSignature).toBe('string');
    expect(transferSignature).toBe('mock-transaction-signature');
  });
}); 