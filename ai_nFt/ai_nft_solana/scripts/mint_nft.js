const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');
const {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');
const fs = require('fs');
const borsh = require('borsh');

// Connect to the Solana network
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load your keypair
const secretKey = JSON.parse(fs.readFileSync('/path/to/keypair.json', 'utf8'));
const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

// Program ID (replace with your deployed program ID)
const programId = new PublicKey('YOUR_PROGRAM_ID');

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function mintNft(tokenId, imageUrl, metadata) {
  // Create a new mint
  const mint = Keypair.generate();
  
  // Get the token account of the wallet address
  const tokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint.publicKey,
    wallet.publicKey
  );
  
  // Derive the metadata account address
  const [metadataAccount] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  
  // First, initialize the NFT
  const initializeIx = createInitializeInstruction(
    programId,
    wallet.publicKey,
    mint.publicKey,
    tokenAccount,
    metadataAccount,
    TOKEN_PROGRAM_ID,
    TOKEN_METADATA_PROGRAM_ID,
    'AI NFT',
    'AINFT',
    'https://arweave.net/your-metadata-uri'
  );
  
  // Then, mint the NFT
  const mintIx = createMintInstruction(
    programId,
    wallet.publicKey,
    mint.publicKey,
    tokenAccount,
    metadataAccount,
    TOKEN_PROGRAM_ID,
    TOKEN_METADATA_PROGRAM_ID,
    tokenId,
    imageUrl,
    metadata
  );
  
  const transaction = new Transaction().add(initializeIx).add(mintIx);
  
  // Sign and send the transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet, mint],
    { commitment: 'confirmed' }
  );
  
  console.log('NFT minted successfully!');
  console.log('Transaction signature:', signature);
  console.log('Mint address:', mint.publicKey.toString());
  
  return { signature, mintAddress: mint.publicKey.toString() };
}

// Helper function to create the Initialize instruction
function createInitializeInstruction(
  programId,
  initializer,
  mint,
  tokenAccount,
  metadataAccount,
  tokenProgram,
  metadataProgram,
  name,
  symbol,
  uri
) {
  const data = borsh.serialize(
    // Define the schema for the instruction data
    { /* schema definition */ },
    {
      variant: 'Initialize',
      name,
      symbol,
      uri,
    }
  );
  
  return {
    programId,
    keys: [
      { pubkey: initializer, isSigner: true, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: metadataAccount, isSigner: false, isWritable: true },
      { pubkey: metadataProgram, isSigner: false, isWritable: false },
    ],
    data,
  };
}

// Helper function to create the Mint instruction
function createMintInstruction(
  programId,
  minter,
  mint,
  tokenAccount,
  metadataAccount,
  tokenProgram,
  metadataProgram,
  tokenId,
  imageUrl,
  metadata
) {
  const data = borsh.serialize(
    // Define the schema for the instruction data
    { /* schema definition */ },
    {
      variant: 'Mint',
      tokenId,
      imageUrl,
      metadata,
    }
  );
  
  return {
    programId,
    keys: [
      { pubkey: minter, isSigner: true, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: metadataAccount, isSigner: false, isWritable: true },
      { pubkey: metadataProgram, isSigner: false, isWritable: false },
    ],
    data,
  };
}

// Example usage
mintNft(
  'token1',
  'https://arweave.net/your-ai-image',
  'AI-generated artwork using DALL-E'
).catch(console.error); 