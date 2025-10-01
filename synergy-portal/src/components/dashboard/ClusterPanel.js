import React from "react";
import { Button } from "@chakra-ui/react";

export default function ClusterPanel({ clusters = [] }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 shadow-lg glassmorphism">
      <div className="text-lg font-semibold text-blue-200 mb-3">Your Clusters</div>
      <ul>
        {clusters.map((c, i) => (
          <li key={c.name} className="flex justify-between items-center py-1">
            <span className="text-blue-100 font-medium">{c.name}</span>
            <span className="text-blue-300">{c.synergy} synergy</span>
            <Button className="wizard-btn" size="sm" ml={2} px={2} py={1} fontSize="xs">
              View
            </Button>
          </li>
        ))}
      </ul>
      <Button className="wizard-btn" mt={4} w="full" py={2} fontSize="sm">
        Join or Create Cluster
      </Button>
    </div>
  );
}
