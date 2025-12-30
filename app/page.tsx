"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Brain, Shield, Zap } from "lucide-react"; // 引入一些 icon

export default function Home() {
  const { data, isLoading, isError, error } = useDashboard();

  // 1. 處理載入中狀態
  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // 2. 處理錯誤狀態
  if (isError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            無法連接到後端系統。請確認 Docker 容器是否正在執行。
            <br />
            錯誤訊息: {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 3. 顯示正常畫面 (確保 data 存在)
  if (!data) return null;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* 標題區 */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
        <div className="text-sm text-muted-foreground">
          System Status:{" "}
          <span className="text-green-500 font-mono">ONLINE</span>
        </div>
      </div>

      {/* 核心指標區 (Top Stats) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* HP / Integrity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Integrity (HP)
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.integrity}%</div>
            <Progress
              value={data.integrity}
              className={`mt-2 h-2 ${data.integrity < 50 ? "bg-red-100" : ""}`}
              // 這裡可以用 clsx 做更細緻的顏色變化，目前先用預設
            />
            <p className="text-xs text-muted-foreground mt-2">目前系統穩定度</p>
          </CardContent>
        </Card>

        {/* Level Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Level</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Lv. {data.user_info.level.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              XP: {data.user_info.current_xp}
            </p>
          </CardContent>
        </Card>

        {/* Blackhole Days */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Blackhole Horizon
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.user_info.blackhole_days} Days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              直到系統崩潰 (Time until collapse)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 壓力源分析 (Stress Breakdown) */}
      <Card>
        <CardHeader>
          <CardTitle>Stress Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          {data.stress_breakdown.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              目前沒有顯著的壓力源。系統運轉良好。
            </p>
          ) : (
            <div className="space-y-4">
              {data.stress_breakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="font-medium">{item.task_title}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-500 font-bold">
                      +{item.stress_value.toFixed(1)} Stress
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
