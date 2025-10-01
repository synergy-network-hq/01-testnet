use anchor_lang::prelude::*;

declare_id!("SNRGstak111111111111111111111111111111111");

#[program]
pub mod snrg_staking {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
