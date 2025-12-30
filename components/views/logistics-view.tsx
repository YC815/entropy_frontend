"use client";

import { AudioRecorder } from "@/components/audio-recorder";

export function LogisticsView() {
  return (
    <div className="space-y-8">
      <div className="neo-card p-12 bg-stone-50/50 border-dashed flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="font-display text-2xl mb-8 text-stone-400 uppercase">
          Input / Staging Area
        </h2>
        <AudioRecorder />

        <p className="mt-8 font-mono text-stone-400 text-sm max-w-md text-center">
          [LOGISTICS PROTOCOL]
          <br />
          Record tasks here. They will appear in the Staging Area below. Drag
          them to the Dock to initialize execution.
        </p>
      </div>

      {/* 這裡未來要放 DnD 列表 */}
      <div className="grid grid-cols-2 gap-8">
        <div className="neo-card p-4 min-h-[300px] opacity-50">
          <h3 className="font-display text-lg mb-4">STAGING</h3>
          <div className="text-xs font-mono text-stone-400">
            WAITING FOR DATA...
          </div>
        </div>
        <div className="neo-card p-4 min-h-[300px] opacity-50 border-neo-blue">
          <h3 className="font-display text-lg mb-4 text-neo-blue">
            DOCK (0/3)
          </h3>
          <div className="text-xs font-mono text-stone-400">EMPTY</div>
        </div>
      </div>
    </div>
  );
}
