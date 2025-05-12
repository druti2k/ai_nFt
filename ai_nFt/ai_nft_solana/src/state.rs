use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NftMetadata {
    pub token_id: String,
    pub owner: Pubkey,
    pub image_url: String,
    pub metadata: String,
} 