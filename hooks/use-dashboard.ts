// hooks/use-dashboard.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardData } from "@/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"], // 這個 key 用來做快取管理
    queryFn: async () => {
      // 呼叫後端 API
      const { data } = await api.get<DashboardData>("/dashboard/");
      return data;
    },
  });
}