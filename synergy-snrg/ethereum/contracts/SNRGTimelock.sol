// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/*
      ,gg,                                                                                        
     i8""8i                                                                                       
     `8,,8'                                                                                       
      `88'                                                                                        
      dP"8,                                                                                       
     dP' `8a  gg     gg   ,ggg,,ggg,    ,ggg,    ,gggggg,    ,gggg,gg  gg     gg                  
    dP'   `Yb I8     8I  ,8" "8P" "8,  i8" "8i   dP""""8I   dP"  "Y8I  I8     8I                  
_ ,dP'     I8 I8,   ,8I  I8   8I   8I  I8, ,8I  ,8'    8I  i8'    ,8I  I8,   ,8I                  
"888,,____,dP,d8b, ,d8I ,dP   8I   Yb, `YbadP' ,dP     Y8,,d8,   ,d8I ,d8b, ,d8I                  
a8P"Y88888P" P""Y88P"8888P'   8I   `Y8888P"Y8888P      `Y8P"Y8888P"888P""Y88P"888                 
                   ,d8I'                                         ,d8I'      ,d8I'                 
                 ,dP'8I                                        ,dP'8I     ,dP'8I                  
                ,8"  8I                                       ,8"  8I    ,8"  8I                  
                I8   8I                                       I8   8I    I8   8I                  
                `8, ,8I                                       `8, ,8I    `8, ,8I                  
                 `Y8P"                                         `Y8P"      `Y8P"                   
 ,ggggggggggggggg                                                                                 
dP""""""88"""""""                                                                                 
Yb,_    88                                                                                        
 `""    88                                                                                        
        88                                                                                        
        88   ,gggggg,   ,ggg,     ,gggg,gg    ,g,     gg      gg   ,gggggg,  gg     gg            
        88   dP""""8I  i8" "8i   dP"  "Y8I   ,8'8,    I8      8I   dP""""8I  I8     8I            
  gg,   88  ,8'    8I  I8, ,8I  i8'    ,8I  ,8'  Yb   I8,    ,8I  ,8'    8I  I8,   ,8I            
   "Yb,,8P ,dP     Y8, `YbadP' ,d8,   ,d8b,,8'_   8) ,d8b,  ,d8b,,dP     Y8,,d8b, ,d8I            
     "Y8P' 8P      `Y8888P"Y888P"Y8888P"`Y8P' "YY8P8P8P'"Y88P"`Y88P      `Y8P""Y88P"888           
                                                                                  ,d8I'           
                                                                                ,dP'8I            
                                                                               ,8"  8I            
                                                                               I8   8I            
                                                                               `8, ,8I            
                                                                                `Y8P"             
 ,ggggggggggggggg                                       ,gggg,                                    
dP""""""88"""""""                                      d8" "8I                          ,dPYb,    
Yb,_    88                                             88  ,dP                          IP'`Yb    
 `""    88       gg                                 8888888P"                           I8  8I    
        88       ""                                    88                               I8  8bgg, 
        88       gg    ,ggg,,ggg,,ggg,    ,ggg,        88          ,ggggg,      ,gggg,  I8 dP" "8 
        88       88   ,8" "8P" "8P" "8,  i8" "8i  ,aa,_88         dP"  "Y8ggg  dP"  "Yb I8d8bggP" 
  gg,   88       88   I8   8I   8I   8I  I8, ,8I dP" "88P        i8'    ,8I   i8'       I8P' "Yb, 
   "Yb,,8P     _,88,_,dP   8I   8I   Yb, `YbadP' Yb,_,d88b,,_   ,d8,   ,d8'  ,d8,_    _,d8    `Yb,
     "Y8P'     8P""Y88P'   8I   8I   `Y8888P"Y888 "Y8P"  "Y88888P"Y8888P"    P""Y8888PP88P      Y8
                                                                                                  
                                                                                                  
                                                                                                  
                                                                                                  
                                                                                                  
                                                                                                  
*/

import {TimelockController} from "openzeppelin-contracts/governance/TimelockController.sol";

/**
 * @title SNRGTimelock
 * @author Synergy Protocol
 * @notice This contract enforces a time delay for all administrative actions.
 * It is designed to be the "owner" of all other protocol contracts.
 *
 * It inherits from OpenZeppelin's audited TimelockController and is configured
 * with specific roles for proposers and executors.
 *
 * - Proposers: The Treasury multisig wallet, which can schedule new transactions.
 * - Executors: Anyone. This allows for permissionless execution of a proposal *after*
 * the time delay has passed, ensuring decentralization and preventing a single
 * point of failure for execution.
 * - Admin: The contract itself. After deployment, the initial admin (the deployer)
 * should transfer the admin role to this contract, making any changes to the
 * timelock's rules (e.g., changing the delay) also subject to the time delay.
 */
contract SNRGTimelock is TimelockController {
    /**
     * @param minDelay The minimum delay in seconds between a proposal's creation and its execution.
     * @param proposers An array of addresses that are allowed to propose new transactions.
     * This should be your Treasury multisig address.
     * @param admin The initial admin of this Timelock. This should be a trusted address
     * (like the deployer) who will perform the final setup of transferring
     * the admin role to the Timelock itself.
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address admin
    )
        TimelockController(
            minDelay,
            proposers,
            // By passing address(0), we allow anyone to execute a matured proposal.
            // This is a decentralized pattern that prevents execution from being a single point of failure.
            // The proposal itself is still protected by the proposer role and the time delay.
            new address[](1), // Executor array must be non-empty; address(0) will be set in it
            admin
        )
    {
        // Inside the constructor, address(0) represents anyone, but it must be explicitly set
        // into an array for the parent constructor in some Solidity versions.
        // A cleaner way is often just to grant the role post-deployment.
        // For clarity and robustness, we grant the EXECUTOR_ROLE to the zero address here.
        grantRole(EXECUTOR_ROLE, address(0));
    }
}