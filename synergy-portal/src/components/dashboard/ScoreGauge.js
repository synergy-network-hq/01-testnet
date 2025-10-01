import React from "react";

export default function ScoreGauge({ score = 0, max = 2500, percentile = 0, nextRank = "Pro", progress = 0 }) {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
      <svg className="absolute" width="160" height="160">
        <circle cx="80" cy="80" r="70" fill="none" stroke="#444" strokeWidth="18" opacity="0.2" />
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="18"
          strokeDasharray={440}
          strokeDashoffset={440 - (440 * score) / max}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(.4,2,.2,1)",
          }}
        />
      </svg>
      <span className="text-4xl font-bold text-blue-300 z-10">{score}</span>
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center text-sm text-blue-200">
        <span>Percentile: <b>Top {percentile}%</b></span>
        <span>
          Next rank: <span className="font-medium text-blue-100">{nextRank}</span>
        </span>
      </div>
      <div className="absolute w-full left-0 bottom-6">
        <div className="w-full bg-gray-700 h-2 rounded-lg overflow-hidden">
          <div
            className="bg-blue-400 h-2 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Current</span>
          <span>{progress}%</span>
          <span>Next Rank</span>
        </div>
      </div>
    </div>
  );
}
