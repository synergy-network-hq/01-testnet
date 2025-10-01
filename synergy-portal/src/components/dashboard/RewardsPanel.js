import React from "react";
import { Button } from "@chakra-ui/react";

export default function RewardsPanel({ rewards }) {
  return (
    <div className="bg-white/10 rounded-2xl p-8 shadow-lg glassmorphism flex flex-col justify-between min-w-[230px]">
      <div>
        <div className="text-xl font-semibold text-blue-200 mb-2">Rewards</div>
        <div className="flex flex-col gap-1">
          <span>
            Last payout: <span className="text-green-200 font-bold">{rewards.lastPayout}</span>
          </span>
          <span>
            Next payout: <span className="text-blue-100">{rewards.nextPayout}</span>
          </span>
          <span>
            Expected: <span className="text-blue-300">{rewards.expected}</span>
          </span>
        </div>
      </div>
      <Button className="wizard-btn" mt={6} py={2} fontSize="sm">
        View Payout History
      </Button>
    </div>
  );
}
