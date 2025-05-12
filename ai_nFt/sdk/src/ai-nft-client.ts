import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createMintToInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';
import * as borsh from 'borsh';

// The address of your deployed program
const PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// Define instruction data layout using borsh
class InitializeInstruction {
  instruction = 0; // 0 = Initialize
  name: string;
  symbol: string;
  uri: string;

  constructor(props: { name: string; symbol: string; uri: string }) {
    this.name = props.name;
    this.symbol = props.symbol;
    this.uri = props.uri;
  }

  static schema = new Map([
    [
      InitializeInstruction,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['name', 'string'],
          ['symbol', 'string'],
          ['uri', 'string'],
        ],
      },
    ],
  ]);
}

class MintInstruction {
  instruction = 1; // 1 = Mint
  tokenId: string;
  imageUrl: string;
  metadata: string;

  constructor(props: { tokenId: string; imageUrl: string; metadata: string }) {
    this.tokenId = props.tokenId;
    this.imageUrl = props.imageUrl;
    this.metadata = props.metadata;
  }

  static schema = new Map([
    [
      MintInstruction,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['tokenId', 'string'],
          ['imageUrl', 'string'],
          ['metadata', 'string'],
        ],
      },
    ],
  ]);
}

class TransferInstruction {
  instruction = 2; // 2 = Transfer
  amount: number;

  constructor(props: { amount: number }) {
    this.amount = props.amount;
  }

  static schema = new Map([
    [
      TransferInstruction,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['amount', 'u64'],
        ],
      },
    ],
  ]);
}

export class AiNftClient {
  connection: Connection;
  payer: Keypair;

  constructor(connection: Connection, payer: Keypair) {
    this.connection = connection;
    this.payer = payer;
  }

  async initialize(
    name: string,
    symbol: string,
    uri: string
  ): Promise<string> {
    const mintKeypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(this.connection);
    
    const [metadataAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('metadata'), mintKeypair.publicKey.toBuffer()],
      PROGRAM_ID
    );
    
    const tokenAddress = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      this.payer.publicKey
    );

    // Create instruction data
    const instructionData = new InitializeInstruction({
      name,
      symbol,
      uri,
    });
    
    const serializedData = borsh.serialize(
      InitializeInstruction.schema,
      instructionData
    );

    // Create a transaction
    const transaction = new Transaction().add(
      // Create the mint account
      SystemProgram.createAccount({
        fromPubkey: this.payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize the mint
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        0, // Decimals
        this.payer.publicKey,
        this.payer.publicKey
      ),
      // Create the associated token account
      createAssociatedTokenAccountInstruction(
        this.payer.publicKey,
        tokenAddress,
        this.payer.publicKey,
        mintKeypair.publicKey
      ),
      // Initialize the NFT with our program
      {
        keys: [
          { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
          { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: tokenAddress, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: metadataAddress, isSigner: false, isWritable: true },
          // Add your Metaplex Token Metadata program ID here
          { pubkey: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'), isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(serializedData),
      }
    );

    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer, mintKeypair]
    );

    return signature;
  }

  async mint(
    mintPubkey: PublicKey, 
    tokenAddress: PublicKey,
    tokenId: string,
    imageUrl: string,
    metadata: string
  ): Promise<string> {
    const [metadataAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('metadata'), mintPubkey.toBuffer()],
      PROGRAM_ID
    );

    // Create instruction data
    const instructionData = new MintInstruction({
      tokenId,
      imageUrl,
      metadata,
    });
    
    const serializedData = borsh.serialize(
      MintInstruction.schema,
      instructionData
    );

    // Create transaction
    const transaction = new Transaction().add({
      keys: [
        { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: mintPubkey, isSigner: false, isWritable: true },
        { pubkey: tokenAddress, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: metadataAddress, isSigner: false, isWritable: true },
        { pubkey: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'), isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from(serializedData),
    });

    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer]
    );

    return signature;
  }

  async transfer(
    source: PublicKey,
    destination: PublicKey,
    amount: number
  ): Promise<string> {
    // Create instruction data
    const instructionData = new TransferInstruction({
      amount,
    });
    
    const serializedData = borsh.serialize(
      TransferInstruction.schema,
      instructionData
    );

    // Create transaction
    const transaction = new Transaction().add({
      keys: [
        { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: source, isSigner: false, isWritable: true },
        { pubkey: destination, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from(serializedData),
    });

    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer]
    );

    return signature;
  }
} 