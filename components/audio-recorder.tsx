"use client";

import { useEffect, useState, useRef } from "react";
import { Mic, Square, Loader2, Upload } from "lucide-react";
import { useSpeechToText } from "@/hooks/use-speech";

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
   // 調整: track last recorded blob for local playback
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMeta, setPreviewMeta] = useState<{ size: number; mime: string } | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: sendAudio, isPending } = useSpeechToText();

  // 取得麥克風清單
  useEffect(() => {
    const loadDevices = async () => {
      try {
        setDeviceError(null);
        // 必須先取得一次權限才能拿到標籤，這裡用無輸出的 getUserMedia 嘗試
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devs = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devs.filter((d) => d.kind === "audioinput");
        setInputs(audioInputs);
        if (!selectedDeviceId && audioInputs.length > 0) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Failed to enumerate devices:", err);
        setDeviceError("無法列出麥克風，請確認權限設定。");
      }
    };

    loadDevices();
    const handler = () => loadDevices();
    navigator.mediaDevices?.addEventListener("devicechange", handler);
    return () => navigator.mediaDevices?.removeEventListener("devicechange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const preferredMime =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ?
          "audio/webm;codecs=opus" :
          MediaRecorder.isTypeSupported("audio/ogg;codecs=opus") ?
            "audio/ogg;codecs=opus" :
            "audio/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType: preferredMime });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: preferredMime });
        console.log("[Recorder] Blob size:", blob.size, "mime:", preferredMime);
        setLastBlob(blob);
        setPreviewMeta({ size: blob.size, mime: preferredMime });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(blob));
        sendAudio(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      // timeslice 確保 dataavailable 定期觸發，避免只有 header
      mediaRecorder.start(1000);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLastBlob(file);
      setPreviewMeta({ size: file.size, mime: file.type });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      sendAudio(file); // File extends Blob
    }
  };

  // 清理 object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
      <div className="flex items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
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

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-all border-2 border-neo-black shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px] cursor-pointer bg-stone-600 hover:bg-stone-500"
        >
          <Upload className="h-8 w-8 text-white" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="text-sm font-mono font-bold text-stone-500 uppercase tracking-widest">
        {isRecording ? (
          <span className="text-neo-red animate-pulse">● Recording...</span>
        ) : (
          "Record or Upload Audio"
        )}
      </div>

      <div className="w-full max-w-xl neo-card bg-white p-4 border border-stone-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-mono text-stone-600">Microphone Source</div>
          {deviceError && (
            <span className="text-xs text-red-500 font-mono">{deviceError}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value || undefined)}
            className="w-full border border-stone-300 rounded px-3 py-2 text-sm font-mono text-stone-700 bg-white"
          >
            {inputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Unknown mic"}
              </option>
            ))}
            {inputs.length === 0 && <option value="">無可用麥克風</option>}
          </select>
          <button
            onClick={async () => {
              try {
                setDeviceError(null);
                const devs = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devs.filter((d) => d.kind === "audioinput");
                setInputs(audioInputs);
                if (!selectedDeviceId && audioInputs.length > 0) {
                    setSelectedDeviceId(audioInputs[0].deviceId);
                }
              } catch (err) {
                console.error("Refresh devices failed:", err);
                setDeviceError("刷新設備失敗");
              }
            }}
            className="px-3 py-2 text-xs font-mono bg-stone-200 border border-stone-400 rounded hover:bg-stone-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {previewUrl && (
        <div className="w-full max-w-xl neo-card bg-white p-4 border border-stone-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-mono text-stone-600">
              Local Test Clip
            </div>
            {previewMeta && (
              <div className="text-xs font-mono text-stone-400">
                {previewMeta.mime} · {(previewMeta.size / 1024).toFixed(1)} KB
              </div>
            )}
          </div>
          <audio controls src={previewUrl} className="w-full" />
          {lastBlob && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => sendAudio(lastBlob)}
                className="px-3 py-1 text-xs font-mono bg-neo-blue text-white rounded shadow-neo border-2 border-neo-black hover:bg-blue-500 active:translate-x-[1px] active:translate-y-[1px]"
              >
                Send This Clip
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
