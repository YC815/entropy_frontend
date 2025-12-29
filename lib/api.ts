// lib/api.ts
import axios from "axios";

// 設定後端 API 的基礎網址
// 如果環境變數沒設定，就預設用 localhost:8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 增加一個回應攔截器 (Response Interceptor)
// 這樣可以直接拿到 data，不用每次都 .data
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 這裡可以統一處理錯誤，例如 401 未授權跳轉登入頁
    // 目前我們先把錯誤印出來
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);