"use client";

import { Box, LayoutDashboard } from "lucide-react";

type Tab = "logistics" | "dashboard";

interface NeoTabsProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function NeoTabs({ currentTab, onTabChange }: NeoTabsProps) {
  const tabs = [
    { id: "logistics", label: "LOGISTICS", icon: Box },
    { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  ] as const;

  return (
    // 外層容器：保留這條 4px 的粗黑線作為 "軌道"
    <div className="flex items-end border-b-4 border-neo-black space-x-1 px-4">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as Tab)}
            className={`
              relative flex items-center justify-center gap-2 px-6 py-3
              font-display text-lg tracking-wide
              border-2 border-neo-black rounded-t-lg
              
              ${
                isActive
                  ? // === 激活狀態 (Active) ===
                    // border-b-0: 底部開口，讓它跟內容區連通
                    // mb-[-4px]: 往下蓋住容器的粗黑線
                    // bg-stone-100: 跟背景同色
                    "bg-stone-100 text-neo-black border-b-0 mb-[-4px] pt-4 pb-4 z-10"
                  : // === 未激活狀態 (Inactive) ===
                    // border-b-0: 【關鍵修正】移除底部邊框！讓它直接坐在容器的粗黑線上
                    // mt-2: 壓低高度，製造層次感
                    // bg-stone-300: 變暗，做出退後感
                    "bg-stone-300 text-stone-500 border-b-0 mt-2 hover:bg-stone-200 hover:text-stone-700"
              }
            `}
          >
            <Icon
              className={`w-5 h-5 ${
                isActive ? "text-neo-blue" : "text-stone-500"
              }`}
            />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
