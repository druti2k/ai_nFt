import { Connection, Keypair, PublicKey } from '@solana/web3.js';
export declare class AiNftClient {
    connection: Connection;
    payer: Keypair;
    constructor(connection: Connection, payer: Keypair);
    initialize(name: string, symbol: string, uri: string): Promise<string>;
    mint(mintPubkey: PublicKey, tokenAddress: PublicKey, tokenId: string, imageUrl: string, metadata: string): Promise<string>;
    transfer(source: PublicKey, destination: PublicKey, amount: number): Promise<string>;
}
