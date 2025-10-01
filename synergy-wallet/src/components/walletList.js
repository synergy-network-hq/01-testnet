import React from 'react';

export default function WalletList({ wallets, onSelectWallet, onDeleteWallet }) {
  if (!wallets.length) return (
    <div className="p-6 text-center text-gray-400">
      No wallets found. Create a new wallet to get started.
    </div>
  );

  return (
    <div className="space-y-4">
      {wallets.map(wallet => (
        <div
          key={wallet.id}
          className="bg-glass dark:bg-glass-dark p-4 rounded-xl flex items-center justify-between shadow"
        >
          <div>
            <div className="font-bold text-lg mb-1">{wallet.label || "Universal Wallet"}</div>
            <div className="font-mono text-xs text-gray-300 truncate">
              {wallet.synergyAddress}
            </div>
            <div className="flex gap-2 mt-1">
              <span title="Bitcoin" className="text-yellow-400 font-mono text-xs">{wallet.bitcoinAddress?.slice(0, 12)}...</span>
              <span title="Ethereum" className="text-green-300 font-mono text-xs">{wallet.ethereumAddress?.slice(0, 10)}...</span>
              <span title="Solana" className="text-blue-400 font-mono text-xs">{wallet.solanaAddress?.slice(0, 10)}...</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              className="text-xs btn-glass px-3 py-1"
              onClick={() => onSelectWallet(wallet)}
            >
              View
            </button>
            <button
              className="text-xs text-red-500 hover:underline"
              onClick={() => onDeleteWallet(wallet.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
