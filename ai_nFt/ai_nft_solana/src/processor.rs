use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use spl_token::instruction as token_instruction;
use crate::metaplex_token_mock as metadata_instruction;

use crate::instruction::AiNftInstruction;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = AiNftInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        AiNftInstruction::Initialize { name, symbol, uri } => {
            process_initialize(program_id, accounts, name, symbol, uri)
        }
        AiNftInstruction::Mint { token_id, image_url, metadata } => {
            process_mint(program_id, accounts, token_id, image_url, metadata)
        }
        AiNftInstruction::Transfer { amount } => {
            process_transfer(program_id, accounts, amount)
        }
    }
}

fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    symbol: String,
    uri: String,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let initializer = next_account_info(account_info_iter)?;
    let mint_account = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;
    let rent_account = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let metadata_account = next_account_info(account_info_iter)?;
    let metadata_program = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    
    // Verify the initializer signed the transaction
    if !initializer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Create mint account
    let create_mint_ix = token_instruction::initialize_mint(
        token_program.key,
        mint_account.key,
        initializer.key,
        Some(initializer.key),
        0,
    )?;
    
    invoke(
        &create_mint_ix,
        &[
            mint_account.clone(),
            initializer.clone(),
            rent_account.clone(),
            token_program.clone(),
        ],
    )?;
    
    // Create token account
    let create_token_account_ix = spl_associated_token_account::instruction::create_associated_token_account(
        initializer.key,
        initializer.key,
        mint_account.key,
        &spl_token::id(),
    );
    
    invoke(
        &create_token_account_ix,
        &[
            initializer.clone(),
            token_account.clone(),
            initializer.clone(),
            mint_account.clone(),
            system_program.clone(),
            token_program.clone(),
            rent_account.clone(),
        ],
    )?;
    
    // Create metadata account
    let create_metadata_ix = metadata_instruction::create_metadata_accounts(
        metadata_program.key,
        metadata_account.key,
        mint_account.key,
        initializer.key,
        initializer.key,
        initializer.key,
        name,
        symbol,
        uri,
    );
    
    invoke(
        &create_metadata_ix,
        &[
            metadata_account.clone(),
            mint_account.clone(),
            initializer.clone(),
            initializer.clone(),
            initializer.clone(),
            system_program.clone(),
            rent_account.clone(),
            metadata_program.clone(),
        ],
    )?;
    
    msg!("NFT initialized successfully");
    Ok(())
}

fn process_mint(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    token_id: String,
    image_url: String,
    metadata: String,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let minter = next_account_info(account_info_iter)?;
    let mint_account = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;
    let rent_account = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let metadata_account = next_account_info(account_info_iter)?;
    let metadata_program = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    
    // Verify the minter signed the transaction
    if !minter.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Mint one token (NFT)
    let mint_to_ix = token_instruction::mint_to(
        token_program.key,
        mint_account.key,
        token_account.key,
        minter.key,
        &[minter.key],
        1,
    )?;
    
    invoke(
        &mint_to_ix,
        &[
            mint_account.clone(),
            token_account.clone(),
            minter.clone(),
            token_program.clone(),
        ],
    )?;
    
    // Update metadata with AI-specific information
    // In a real implementation, you would update the metadata with the AI-generated content
    // This is a simplified version
    
    msg!("NFT minted successfully: {}", token_id);
    msg!("Image URL: {}", image_url);
    msg!("Metadata: {}", metadata);
    
    Ok(())
}

fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let owner = next_account_info(account_info_iter)?;
    let source = next_account_info(account_info_iter)?;
    let destination = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    
    // Verify the owner signed the transaction
    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Transfer the NFT
    let transfer_ix = token_instruction::transfer(
        token_program.key,
        source.key,
        destination.key,
        owner.key,
        &[owner.key],
        amount,
    )?;
    
    invoke(
        &transfer_ix,
        &[
            source.clone(),
            destination.clone(),
            owner.clone(),
            token_program.clone(),
        ],
    )?;
    
    msg!("NFT transferred successfully");
    Ok(())
} 