import { 
  Connection, 
  PublicKey, 
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import * as borsh from 'borsh';

// The address of your deployed program
const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');

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

  static schema: Map<any, any> = new Map([
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

  static schema: Map<any, any> = new Map([
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TransferInstruction {
  instruction = 2; // 2 = Transfer
  amount: number;

  constructor(props: { amount: number }) {
    this.amount = props.amount;
  }

  static schema: Map<any, any> = new Map([
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

export class AiNftBrowserClient {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async createInitializeTransaction(
    payer: PublicKey,
    mintPubkey: PublicKey,
    tokenAddress: PublicKey,
    metadataAddress: PublicKey,
    name: string,
    symbol: string,
    uri: string
  ): Promise<Transaction> {
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

    // Create transaction
    const transaction = new Transaction().add(
      // Create the associated token account if it doesn't exist
      createAssociatedTokenAccountInstruction(
        payer,
        tokenAddress,
        payer,
        mintPubkey
      ),
      // Initialize the NFT with our program
      new TransactionInstruction({
        keys: [
          { pubkey: payer, isSigner: true, isWritable: true },
          { pubkey: mintPubkey, isSigner: false, isWritable: true },
          { pubkey: tokenAddress, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: metadataAddress, isSigner: false, isWritable: true },
          { pubkey: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'), isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(serializedData),
      })
    );

    return transaction;
  }

  async createMintTransaction(
    payer: PublicKey,
    mintPubkey: PublicKey,
    tokenAddress: PublicKey,
    metadataAddress: PublicKey,
    tokenId: string,
    imageUrl: string,
    metadata: string
  ): Promise<Transaction> {
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
    const transaction = new Transaction().add(
      new TransactionInstruction({
        keys: [
          { pubkey: payer, isSigner: true, isWritable: true },
          { pubkey: mintPubkey, isSigner: false, isWritable: true },
          { pubkey: tokenAddress, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: metadataAddress, isSigner: false, isWritable: true },
          { pubkey: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'), isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from(serializedData),
      })
    );

    return transaction;
  }
} 