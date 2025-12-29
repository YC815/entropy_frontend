這是一份經過優化、專門設計給 **AI 前端（如 v0, ChatGPT, Claude 協助寫扣）** 閱讀的 API 串接指南。

這份指南省略了後端實作細節（如 Python/SQL），直接聚焦在 **「前端該傳什麼」** 與 **「前端會收到什麼」**，並使用 TypeScript 介面定義資料結構，這是 AI 最容易理解的格式。

---

# 🚀 EntroPy Backend API 串接指南

## 1. 系統全觀 (Global Context)

本系統是一個 **「抗熵 (Anti-Entropy)」** 個人生產力系統。前端主要分為三個階段（Stage），對應後端的 API 分組：

1. **Logistics (輸入層)**：透過語音或手動建立任務。
2. **Dashboard (戰略層)**：查看壓力值 (Stress)、HP (Integrity) 與任務排程。
3. **Runtime (執行層)**：執行任務並結算獎勵 (Commit)。

- **Base URL**: `http://localhost:8000/api/v1`
- **Content-Type**: 預設為 `application/json` (語音上傳除外)

---

## 2. 核心資料結構 (TypeScript Interfaces)

請在前端使用以下定義來處理 API 回傳資料：

```typescript
// 任務類型
type TaskType = "SCHOOL" | "SKILL" | "MISC";

// 任務狀態流轉：DRAFT (草稿) -> STAGED (儲備) -> IN_DOCK (執行中) -> COMPLETED (完成)
type TaskStatus = "DRAFT" | "STAGED" | "IN_DOCK" | "COMPLETED" | "ARCHIVED";

// 核心任務物件
interface Task {
  id: number;
  title: string;
  type: TaskType;
  difficulty: number; // 1-10
  status: TaskStatus;
  deadline?: string; // ISO Date string
  estimated_hours?: number;
  created_at: string;
}

// 儀表板狀態
interface DashboardData {
  user_info: {
    level: number;
    current_xp: number;
    blackhole_days: number; // 距離崩潰天數
  };
  integrity: number; // HP (0-100)
  stress_breakdown: Array<{
    task_title: string;
    stress_value: number;
  }>;
}
```

---

## 3. 功能模組與 API 端點

### 🟢 模組 A：儀表板 (Dashboard)

**功能**：獲取主角當前的狀態（等級、HP、壓力來源）。通常用於首頁渲染。

| 方法  | 路徑                              | 功能描述                         |
| ----- | --------------------------------- | -------------------------------- |
| `GET` | `/dashboard/get_dashboard_status` | 取得完整遊戲狀態 (DashboardData) |

---

### 🟡 模組 B：任務管理 (Task CRUD)

**功能**：任務列表的增刪改查。

#### 1. 讀取任務列表

- **Endpoint**: `GET /tasks/`
- **Query Params**:
- `skip`: number (default: 0)
- `limit`: number (default: 100)
- `status`: TaskStatus (可選, 過濾狀態)
- `type`: TaskType (可選, 過濾類型)

- **Response**: `Task[]`

#### 2. 手動建立任務

- **Endpoint**: `POST /tasks/`
- **Body**:

```typescript
{
  "title": string;      // 必填
  "type": TaskType;     // 必填
  "difficulty": number; // 1-10, 預設 1
  "deadline": string;   // Optional ISO String
}

```

#### 3. 更新任務 (移動狀態/編輯)

- **Endpoint**: `PATCH /tasks/{task_id}`
- **Body** (Partial):

```typescript
{
  "status": "IN_DOCK", // 例如從 STAGED 移動到 IN_DOCK
  "title": "新標題"
}

```

- **⚠️ 重要規則**：當 `status` 改為 `IN_DOCK` 時，若 Dock 中已有 **3 個** 任務，API 會回傳 `400 Bad Request` (Payload Dock is full)。前端需捕捉此錯誤並提示使用者。

#### 4. 刪除任務 (Incineration)

- **Endpoint**: `DELETE /tasks/{task_id}`
- **Response**: `204 No Content`

---

### 🔴 模組 C：特色功能 (AI & Gamification)

#### 1. AI 語音轉任務 (Speech-to-Task)

**功能**：上傳錄音檔，AI 自動分析並建立多個任務。

- **Endpoint**: `POST /tasks/speech`
- **Header**: `Content-Type: multipart/form-data`
- **Body (Form Data)**:
- Key: `file`
- Value: `File` (音訊檔案)

- **Response**: `Task[]` (回傳新建立的任務陣列)

#### 2. 任務結算 (Commit Ritual)

**功能**：完成任務並領取獎勵（增加 XP、回復 HP）。

- **Endpoint**: `POST /tasks/{task_id}/commit`
- **Body**: `{}` (空物件即可)
- **Response**:

```typescript
{
  "task_id": number;
  "status": "COMPLETED";
  "xp_gained": number;  // 獲得的經驗值
  "hp_restored": boolean; // 是否回復了 HP
  "message": string;
}

```

---

## 4. 給 AI 前端的開發提示 (System Prompts)

如果你正在使用 Cursor/v0 開發，可以將這段複製給它：

> **Backend Behavior Note:**
>
> 1. **Validation**: All inputs are validated by Pydantic. Valid format violations return `422 Unprocessable Entity`.
> 2. **Dock Limit**: The UI must handle `400` error when dragging a task to "IN_DOCK" if the dock is full (Max 3 tasks).
> 3. **Audio**: Use standard `FormData` for the `/tasks/speech` endpoint. The field name must be `file`.
> 4. **Date Handling**: Send all dates as ISO 8601 strings.
