import React from "react";

export default function ContributionHistory({ events = [] }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 shadow-lg glassmorphism">
      <div className="text-lg font-semibold text-blue-200 mb-3">Recent Contributions</div>
      <ul className="divide-y divide-blue-900">
        {events.map(ev => (
          <li key={ev.id} className="py-2 flex items-center justify-between">
            <span className="text-blue-100">{ev.description}</span>
            <span className="text-green-300 font-bold">+{ev.points} pts</span>
            <span className="text-xs text-gray-400">{ev.ts}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
