use solana_program::pubkey::Pubkey;

pub mod id {
    use solana_program::declare_id;
    // This is the real Metaplex Token Metadata program ID on devnet/mainnet
    declare_id!("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
}

// Simplified instruction type for testing
pub enum Instruction {
    CreateMetadataAccount {
        name: String,
        symbol: String,
        uri: String,
    },
    UpdateMetadataAccount {
        name: String,
        symbol: String,
        uri: String,
    },
}

// Mock create_metadata_accounts instruction creation for tests
pub fn create_metadata_accounts(
    program_id: &Pubkey,
    metadata_account: &Pubkey,
    mint: &Pubkey,
    mint_authority: &Pubkey,
    payer: &Pubkey,
    update_authority: &Pubkey,
    _name: String,
    _symbol: String,
    _uri: String,
) -> solana_program::instruction::Instruction {
    solana_program::instruction::Instruction {
        program_id: *program_id,
        accounts: vec![
            solana_program::instruction::AccountMeta::new(*metadata_account, false),
            solana_program::instruction::AccountMeta::new_readonly(*mint, false),
            solana_program::instruction::AccountMeta::new_readonly(*mint_authority, true),
            solana_program::instruction::AccountMeta::new(*payer, true),
            solana_program::instruction::AccountMeta::new_readonly(*update_authority, false),
            solana_program::instruction::AccountMeta::new_readonly(solana_program::system_program::id(), false),
        ],
        data: vec![0], // Mock data
    }
}

// Mock update_metadata_accounts instruction creation for tests
pub fn update_metadata_accounts(
    program_id: &Pubkey,
    metadata_account: &Pubkey,
    update_authority: &Pubkey,
    _name: String,
    _symbol: String,
    _uri: String,
) -> solana_program::instruction::Instruction {
    solana_program::instruction::Instruction {
        program_id: *program_id,
        accounts: vec![
            solana_program::instruction::AccountMeta::new(*metadata_account, false),
            solana_program::instruction::AccountMeta::new_readonly(*update_authority, true),
        ],
        data: vec![1], // Mock data
    }
} 