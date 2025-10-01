import React, { useState, useEffect } from "react";
import ScoreGauge from "./ScoreGauge";
import ClusterPanel from "./ClusterPanel";
import Leaderboard from "./Leaderboard";
import ContributionHistory from "./ContributionHistory";
import GrowthTips from "./GrowthTips";
import RewardsPanel from "./RewardsPanel";

// Replace with real API integration (see next section)
import { fetchSynergyUserData, fetchLeaderboard } from "../../services/blockchainService";

export default function SynergyDashboard() {
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [userData, leaderboardData] = await Promise.all([
          fetchSynergyUserData(),
          fetchLeaderboard(),
        ]);
        setUser(userData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        // handle error
        setUser(null);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Unable to load Synergy Score data. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center py-12">
      <div className="w-full max-w-4xl px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col items-center">
            <ScoreGauge
              score={user.score}
              max={2500}
              percentile={user.percentile}
              nextRank={user.nextRank}
              progress={user.progressToNextRank}
            />
          </div>
          <RewardsPanel rewards={user.rewards} />
        </div>
        <div className="flex flex-col md:flex-row gap-6 mt-8">
          <ContributionHistory events={user.recentEvents} />
          <GrowthTips tips={user.growthTips} />
        </div>
        <div className="flex flex-col md:flex-row gap-6 mt-8">
          <ClusterPanel clusters={user.clusters} />
          <Leaderboard leaderboard={leaderboard} />
        </div>
      </div>
    </div>
  );
}
