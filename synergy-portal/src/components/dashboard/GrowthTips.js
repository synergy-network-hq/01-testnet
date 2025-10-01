import React from "react";
import { Button } from "@chakra-ui/react";

export default function GrowthTips({ tips = [] }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 shadow-lg glassmorphism min-w-[230px] flex flex-col justify-between">
      <div>
        <div className="text-lg font-semibold text-blue-200 mb-2">Next Steps</div>
        <ul className="text-blue-100 list-disc list-inside space-y-1">
          {tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
      <Button className="wizard-btn" mt={6} py={2} fontSize="sm">
        Explore More Ways to Earn
      </Button>
    </div>
  );
}
