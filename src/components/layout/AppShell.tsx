"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAppStore } from "@/store";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setCurrentDepartment } = useAppStore();
  const [deptName, setDeptName] = useState("心内科");

  const getBreadcrumbs = () => {
    const crumbs: { label: string; href?: string }[] = [{ label: "首页", href: "/" }];
    const pathMap: Record<string, string> = {
      purchase: "申购管理",
      acceptance: "入库验收",
      requisition: "领用管理",
      usage: "使用管理",
      settlement: "结算管理",
      master: "基础数据",
      departments: "科室管理",
      suppliers: "供应商管理",
      consumables: "耗材目录",
      new: "新建",
    };
    const segments = pathname.split("/").filter(Boolean);
    segments.forEach((seg, i) => {
      const label = pathMap[seg] || seg;
      const href = i < segments.length - 1 ? "/" + segments.slice(0, i + 1).join("/") : undefined;
      crumbs.push({ label, href });
    });
    return crumbs;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        activePath={pathname}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          breadcrumbs={getBreadcrumbs()}
          currentDepartment={deptName}
          onDepartmentChange={(d) => {
            setDeptName(d);
            const deptMap: Record<string, string> = {
              "心内科": "d1", "骨科": "d2", "眼科": "d3",
              "神经外科": "d4", "普外科": "d5", "泌尿外科": "d6",
              "妇产科": "d7", "ICU": "d8",
            };
            setCurrentDepartment(deptMap[d] || "d1");
          }}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
