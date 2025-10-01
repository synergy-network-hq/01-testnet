use anchor_lang::prelude::*;

declare_id!("SNRGpres111111111111111111111111111111111");

#[program]
pub mod snrg_presale {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
