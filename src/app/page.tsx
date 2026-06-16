"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Package, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import type { DashboardData } from "@/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 h-32 animate-pulse">
              <div className="h-4 bg-border rounded w-1/3 mb-4" />
              <div className="h-8 bg-border rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">全院高值耗材概览</h1>
          <p className="text-sm text-text-secondary mt-1">实时监控库存、效期与科室领用情况</p>
        </div>
        <div className="text-sm text-text-muted">数据更新时间：{new Date().toLocaleString("zh-CN")}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
          <StatCard
            icon={<DollarSign size={22} />}
            label="库存总金额"
            value={formatCurrency(data.totalInventoryValue)}
            trend={{ value: 8.2, direction: "up" }}
          />
        </div>
        <div className="animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
          <StatCard
            icon={<AlertTriangle size={22} />}
            label="近效期占比"
            value={`${data.nearExpiryRatio}%`}
            trend={{ value: 2.1, direction: "up" }}
          />
        </div>
        <div className="animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
          <StatCard
            icon={<Package size={22} />}
            label="待处理事项"
            value={data.pendingTasks.reduce((s, t) => s + t.count, 0).toString()}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
          <h2 className="text-base font-semibold text-text mb-4">待办事项</h2>
          <div className="space-y-3">
            {data.pendingTasks.map((task) => (
              <Link
                key={task.type}
                href={task.link}
                className="flex items-center justify-between p-4 rounded-lg bg-bg hover:bg-accent/5 border border-transparent hover:border-accent/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock size={18} className="text-warning" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text">{task.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">需要尽快处理</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-warning">{task.count}</span>
                  <ArrowRight size={16} className="text-text-muted group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
          <h2 className="text-base font-semibold text-text mb-4">效期预警</h2>
          <div className="space-y-3">
            {data.nearExpiryItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-bg border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.daysLeft <= 60 ? "bg-danger/10" : "bg-warning/10"
                  }`}>
                    <AlertTriangle size={18} className={item.daysLeft <= 60 ? "text-danger" : "text-warning"} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text">{item.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">效期至 {item.expiryDate}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${item.daysLeft <= 60 ? "text-danger" : "text-warning"}`}>
                    {item.daysLeft}天
                  </div>
                  <div className="text-xs text-text-muted">剩余有效期</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
        <h2 className="text-base font-semibold text-text mb-6">各科室领用金额排行</h2>
        <div className="space-y-4">
          {data.departmentRanking.map((dept, i) => {
            const maxAmount = data.departmentRanking[0].amount;
            const ratio = (dept.amount / maxAmount) * 100;
            const colors = ["bg-accent", "bg-accent/80", "bg-accent/60", "bg-primary/60", "bg-primary/40"];
            return (
              <div key={dept.departmentName} className="flex items-center gap-4">
                <div className="w-8 text-sm font-bold text-text-secondary text-right">
                  {i + 1}
                </div>
                <div className="w-20 text-sm font-medium text-text">{dept.departmentName}</div>
                <div className="flex-1 h-8 bg-bg rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${colors[i] || "bg-primary/30"} rounded-lg flex items-center transition-all duration-700`}
                    style={{ width: `${ratio}%` }}
                  >
                    <span className="text-xs font-medium text-white ml-3 whitespace-nowrap">
                      {formatCurrency(dept.amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
