// types/index.ts

// 任務類型
export type TaskType = "SCHOOL" | "SKILL" | "MISC";

// 任務狀態
export type TaskStatus = "DRAFT" | "STAGED" | "IN_DOCK" | "COMPLETED" | "ARCHIVED";

// 核心任務物件 (對應後端 TaskResponse)
export interface Task {
  id: number;
  title: string;
  type: TaskType;
  difficulty: number;
  status: TaskStatus;
  deadline?: string; // ISO String
  estimated_hours?: number;
  created_at: string;
  updated_at?: string;
}

// 建立任務時需要的資料
export interface TaskCreatePayload {
  title: string;
  type: TaskType;
  difficulty: number;
  deadline?: string;
}

// 儀表板資料 (對應後端 DashboardResponse)
export interface DashboardData {
  user_info: {
    level: number;
    current_xp: number;
    blackhole_days: number;
  };
  integrity: number; // HP
  stress_breakdown: Array<{
    task_title: string;
    stress_value: number;
  }>;
}

// 結算回應
export interface CommitResponse {
  task_id: number;
  status: string;
  xp_gained: number;
  hp_restored: boolean;
  message: string;
}