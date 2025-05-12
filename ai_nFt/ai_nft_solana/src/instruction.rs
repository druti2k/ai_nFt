use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::instruction::{AccountMeta, Instruction};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub enum AiNftInstruction {
    /// Initialize a new NFT mint
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The account of the person initializing the NFT
    /// 1. `[writable]` The NFT mint account
    /// 2. `[writable]` The token account where the NFT will be minted
    /// 3. `[]` The rent sysvar
    /// 4. `[]` The token program
    /// 5. `[writable]` The metadata account
    /// 6. `[]` The token metadata program
    /// 7. `[]` The system program
    Initialize {
        /// Name of the NFT
        name: String,
        /// Symbol of the NFT
        symbol: String,
        /// URI pointing to the JSON metadata
        uri: String,
    },
    
    /// Mint a new NFT
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The account of the person minting the NFT
    /// 1. `[writable]` The NFT mint account
    /// 2. `[writable]` The token account where the NFT will be minted
    /// 3. `[]` The rent sysvar
    /// 4. `[]` The token program
    /// 5. `[writable]` The metadata account
    /// 6. `[]` The token metadata program
    /// 7. `[]` The system program
    Mint {
        /// Token ID (unique identifier)
        token_id: String,
        /// URL to the AI-generated image
        image_url: String,
        /// Additional metadata about the AI generation
        metadata: String,
    },
    
    /// Transfer ownership of an NFT
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The current owner of the NFT
    /// 1. `[writable]` The token account of the current owner
    /// 2. `[writable]` The token account of the new owner
    /// 3. `[]` The token program
    Transfer {
        /// Amount to transfer (should be 1 for NFT)
        amount: u64,
    },
}

impl AiNftInstruction {
    /// Creates an 'Initialize' instruction
    pub fn initialize(
        program_id: &Pubkey,
        initializer: &Pubkey,
        mint: &Pubkey,
        token_account: &Pubkey,
        metadata_account: &Pubkey,
        token_program: &Pubkey,
        metadata_program: &Pubkey,
        name: String,
        symbol: String,
        uri: String,
    ) -> Instruction {
        let data = AiNftInstruction::Initialize {
            name,
            symbol,
            uri,
        }
        .try_to_vec()
        .unwrap();
        
        Instruction {
            program_id: *program_id,
            accounts: vec![
                AccountMeta::new_readonly(*initializer, true),
                AccountMeta::new(*mint, false),
                AccountMeta::new(*token_account, false),
                AccountMeta::new_readonly(solana_program::sysvar::rent::id(), false),
                AccountMeta::new_readonly(*token_program, false),
                AccountMeta::new(*metadata_account, false),
                AccountMeta::new_readonly(*metadata_program, false),
                AccountMeta::new_readonly(solana_program::system_program::id(), false),
            ],
            data,
        }
    }
    
    /// Creates a 'Mint' instruction
    pub fn mint(
        program_id: &Pubkey,
        minter: &Pubkey,
        mint: &Pubkey,
        token_account: &Pubkey,
        metadata_account: &Pubkey,
        token_program: &Pubkey,
        metadata_program: &Pubkey,
        token_id: String,
        image_url: String,
        metadata: String,
    ) -> Instruction {
        let data = AiNftInstruction::Mint {
            token_id,
            image_url,
            metadata,
        }
        .try_to_vec()
        .unwrap();
        
        Instruction {
            program_id: *program_id,
            accounts: vec![
                AccountMeta::new_readonly(*minter, true),
                AccountMeta::new(*mint, false),
                AccountMeta::new(*token_account, false),
                AccountMeta::new_readonly(solana_program::sysvar::rent::id(), false),
                AccountMeta::new_readonly(*token_program, false),
                AccountMeta::new(*metadata_account, false),
                AccountMeta::new_readonly(*metadata_program, false),
                AccountMeta::new_readonly(solana_program::system_program::id(), false),
            ],
            data,
        }
    }
    
    /// Creates a 'Transfer' instruction
    pub fn transfer(
        program_id: &Pubkey,
        owner: &Pubkey,
        source: &Pubkey,
        destination: &Pubkey,
        token_program: &Pubkey,
        amount: u64,
    ) -> Instruction {
        let data = AiNftInstruction::Transfer { amount }
            .try_to_vec()
            .unwrap();
            
        Instruction {
            program_id: *program_id,
            accounts: vec![
                AccountMeta::new_readonly(*owner, true),
                AccountMeta::new(*source, false),
                AccountMeta::new(*destination, false),
                AccountMeta::new_readonly(*token_program, false),
            ],
            data,
        }
    }
} 