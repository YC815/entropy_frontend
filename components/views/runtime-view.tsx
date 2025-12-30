"use client";

import { Play } from "lucide-react";

export function RuntimeView() {
  return (
    <div className="space-y-8">
      <div className="neo-card p-12 bg-stone-900 text-stone-100 min-h-[600px] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full border-4 border-stone-700 flex items-center justify-center mb-6">
          <Play className="w-10 h-10 text-stone-700 ml-1" />
        </div>
        <h2 className="font-display text-4xl mb-2 text-stone-700">
          NO ACTIVE TASK
        </h2>
        <p className="font-mono text-stone-600">
          Please select a task from Logistics Dock
        </p>
      </div>
    </div>
  );
}
