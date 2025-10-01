import React from "react";
import Section from "./Section";
import PQCWallet from "./PQCWallet";

export default function MainContent() {
  return (
    <div className="content">
      <Section id="section1" title="Quantum-Safe Wallet Test">
        <PQCWallet />
      </Section>
      <Section id="section2" title="Dashboard">
        <p>Overview of your Synergy Wallet balances, network status, and recent activity will appear here.</p>
      </Section>
      <Section id="section3" title="Transactions">
        <p>View and manage your past transactions and pending transactions here.</p>
      </Section>
      <Section id="section4" title="Settings">
        <p>Adjust your wallet preferences, network settings, and advanced configurations.</p>
      </Section>

    </div>
  );
}
