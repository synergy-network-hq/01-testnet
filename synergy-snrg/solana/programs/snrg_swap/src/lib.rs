use anchor_lang::prelude::*;

declare_id!("SNRGswap111111111111111111111111111111111");

#[program]
pub mod snrg_swap {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
