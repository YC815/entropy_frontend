import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Task } from "@/types"; // 假設你在 types 裡已經定義了 Task

export function useSpeechToText() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (audioBlob: Blob) => {
      // 1. 建立 FormData
      const formData = new FormData();
      // 注意：檔名必須有副檔名，後端 ffmpeg 才能識別
      formData.append("file", audioBlob, "recording.webm");

      // 2. 發送 POST 請求
      const { data } = await api.post<Task[]>("/tasks/speech", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return data;
    },
    onSuccess: (newTasks) => {
      // 3. 成功後，讓列表重新整理，或是直接把新任務塞進快取 (Optimistic Update)
      console.log("AI Parsed Tasks:", newTasks);
      
      // 讓 Dashboard 數據重整 (因為任務增加了，壓力可能變了)
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      // 讓任務列表重整 (如果之後有做列表頁的話)
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Speech processing failed:", error);
    }
  });
}