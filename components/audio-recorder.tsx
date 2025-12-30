"use client";

import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { useSpeechToText } from "@/hooks/use-speech";

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { mutate: sendAudio, isPending } = useSpeechToText();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        sendAudio(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to access microphone:", err);
      alert("無法存取麥克風，請確認權限設定。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 1. 處理中狀態 (AI Thinking)
  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-2">
        {/* 這裡用 neo-card 沒問題，因為我們希望它是白底 */}
        <div className="neo-card p-4 flex items-center gap-3 bg-neo-white rounded-full px-6">
          <Loader2 className="h-6 w-6 animate-spin text-neo-black" />
          <span className="font-display text-sm tracking-widest">
            PROCESSING...
          </span>
        </div>
      </div>
    );
  }

  // 2. 正常/錄音狀態
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        // ⚠️ 關鍵修改：
        // 1. 移除了 'neo-button' class (因為它會強制背景變白)
        // 2. 手動加上 neo 風格的邊框和陰影: border-2 border-neo-black shadow-neo
        className={`
          w-20 h-20 rounded-full flex items-center justify-center transition-all
          border-2 border-neo-black shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer
          ${
            isRecording
              ? "bg-neo-red hover:bg-red-400"
              : "bg-neo-blue hover:bg-blue-400"
          }
        `}
      >
        {isRecording ? (
          <Square className="h-8 w-8 text-white fill-current animate-pulse" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </button>

      <div className="text-sm font-mono font-bold text-stone-500 uppercase tracking-widest">
        {isRecording ? (
          <span className="text-neo-red animate-pulse">● Recording...</span>
        ) : (
          "Click to Input Command"
        )}
      </div>
    </div>
  );
}
