// types/index.ts

// 1. 任務類型 (後端回傳值為小寫)
export enum TaskType {
  SCHOOL = "school",
  SKILL = "skill",
  MISC = "misc",
}

// 任務狀態 (後端回傳值為小寫)
export enum TaskStatus {
  DRAFT = "draft",
  STAGED = "staged",
  COMPLETED = "completed",
  INCINERATED = "incinerated",
}

// 核心任務物件 (對應後端 TaskResponse)
export interface Task {
  id: number;
  title: string;
  type: TaskType;
  status: TaskStatus;
  difficulty: number; // 1-10
  xp_value: number;   // Base XP
  deadline: string | null; // ISO datetime string (UTC) with timezone offset, or null
  created_at: string;
  updated_at: string;
}

// 建立任務時需要的資料
export interface TaskCreatePayload {
  title: string;
  type: TaskType;
  difficulty?: number;
  xp_value?: number;
  deadline?: string | null; // ISO datetime string (UTC) with timezone offset, or null
}

// === Dashboard 相關定義 ===

export interface UserInfo {
  level: number;
  current_xp: number;
  blackhole_days: number;
}

export interface StressItem {
  task_title: string;
  days_left: number;      // ✅ 修正：這是 page.tsx 裡用到的
  stress_impact: number;  // ✅ 修正：後端回傳欄位名是 impact
}

export interface DashboardData {
  user_info: UserInfo;
  integrity: number;      // HP
  total_stress: number;   // ✅ 新增
  multiplier: number;     // ✅ 新增
  status: string;         // ✅ 新增："FLOW" | "NORMAL" | "BRAIN_FOG"
  stress_breakdown: StressItem[];
}

// 結算回應
export interface CommitResponse {
  task_id: number;
  status: string;
  xp_gained: number;
  hp_restored: boolean;
  message: string;
}
