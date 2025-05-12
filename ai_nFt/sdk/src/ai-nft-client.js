"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiNftClient = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const borsh = __importStar(require("borsh"));
// The address of your deployed program
const PROGRAM_ID = new web3_js_1.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
// Define instruction data layout using borsh
class InitializeInstruction {
    constructor(props) {
        this.instruction = 0; // 0 = Initialize
        this.name = props.name;
        this.symbol = props.symbol;
        this.uri = props.uri;
    }
}
InitializeInstruction.schema = new Map([
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
class MintInstruction {
    constructor(props) {
        this.instruction = 1; // 1 = Mint
        this.tokenId = props.tokenId;
        this.imageUrl = props.imageUrl;
        this.metadata = props.metadata;
    }
}
MintInstruction.schema = new Map([
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
class TransferInstruction {
    constructor(props) {
        this.instruction = 2; // 2 = Transfer
        this.amount = props.amount;
    }
}
TransferInstruction.schema = new Map([
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
class AiNftClient {
    constructor(connection, payer) {
        this.connection = connection;
        this.payer = payer;
    }
    async initialize(name, symbol, uri) {
        const mintKeypair = web3_js_1.Keypair.generate();
        const lamports = await (0, spl_token_1.getMinimumBalanceForRentExemptMint)(this.connection);
        const [metadataAddress] = await web3_js_1.PublicKey.findProgramAddress([Buffer.from('metadata'), mintKeypair.publicKey.toBuffer()], PROGRAM_ID);
        const tokenAddress = await (0, spl_token_1.getAssociatedTokenAddress)(mintKeypair.publicKey, this.payer.publicKey);
        // Create instruction data
        const instructionData = new InitializeInstruction({
            name,
            symbol,
            uri,
        });
        const serializedData = borsh.serialize(InitializeInstruction.schema, instructionData);
        // Create a transaction
        const transaction = new web3_js_1.Transaction().add(
        // Create the mint account
        web3_js_1.SystemProgram.createAccount({
            fromPubkey: this.payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: spl_token_1.MINT_SIZE,
            lamports,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }), 
        // Initialize the mint
        (0, spl_token_1.createInitializeMintInstruction)(mintKeypair.publicKey, 0, // Decimals
        this.payer.publicKey, this.payer.publicKey), 
        // Create the associated token account
        (0, spl_token_1.createAssociatedTokenAccountInstruction)(this.payer.publicKey, tokenAddress, this.payer.publicKey, mintKeypair.publicKey), 
        // Initialize the NFT with our program
        {
            keys: [
                { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
                { pubkey: tokenAddress, isSigner: false, isWritable: true },
                { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: metadataAddress, isSigner: false, isWritable: true },
                // Add your Metaplex Token Metadata program ID here
                { pubkey: new web3_js_1.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'), isSigner: false, isWritable: false },
            ],
            programId: PROGRAM_ID,
            data: Buffer.from(serializedData),
        });
        // Sign and send the transaction
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, transaction, [this.payer, mintKeypair]);
        return signature;
    }
    async mint(mintPubkey, tokenAddress, tokenId, imageUrl, metadata) {
        const [metadataAddress] = await web3_js_1.PublicKey.findProgramAddress([Buffer.from('metadata'), mintPubkey.toBuffer()], PROGRAM_ID);
        // Create instruction data
        const instructionData = new MintInstruction({
            tokenId,
            imageUrl,
            metadata,
        });
        const serializedData = borsh.serialize(MintInstruction.schema, instructionData);
        // Create transaction
        const transaction = new web3_js_1.Transaction().add({
            keys: [
                { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: mintPubkey, isSigner: false, isWritable: true },
                { pubkey: tokenAddress, isSigner: false, isWritable: true },
                { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: metadataAddress, isSigner: false, isWritable: true },
                { pubkey: new web3_js_1.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'), isSigner: false, isWritable: false },
            ],
            programId: PROGRAM_ID,
            data: Buffer.from(serializedData),
        });
        // Sign and send the transaction
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, transaction, [this.payer]);
        return signature;
    }
    async transfer(source, destination, amount) {
        // Create instruction data
        const instructionData = new TransferInstruction({
            amount,
        });
        const serializedData = borsh.serialize(TransferInstruction.schema, instructionData);
        // Create transaction
        const transaction = new web3_js_1.Transaction().add({
            keys: [
                { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
                { pubkey: source, isSigner: false, isWritable: true },
                { pubkey: destination, isSigner: false, isWritable: true },
                { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            ],
            programId: PROGRAM_ID,
            data: Buffer.from(serializedData),
        });
        // Sign and send the transaction
        const signature = await (0, web3_js_1.sendAndConfirmTransaction)(this.connection, transaction, [this.payer]);
        return signature;
    }
}
exports.AiNftClient = AiNftClient;
