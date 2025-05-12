use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum AiNftError {
    #[error("Invalid instruction")]
    InvalidInstruction,
    
    #[error("Not the NFT owner")]
    NotOwner,
    
    #[error("Token ID already exists")]
    TokenIdExists,
}

impl From<AiNftError> for ProgramError {
    fn from(e: AiNftError) -> Self {
        ProgramError::Custom(e as u32)
    }
} 