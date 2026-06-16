"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  className?: string;
}

export default function StatCard({ icon, label, value, trend, className = "" }: StatCardProps) {
  return (
    <div
      className={`bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
              trend.direction === "up"
                ? "text-accent bg-accent/10"
                : "text-danger bg-danger/10"
            }`}
          >
            {trend.direction === "up" ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-text mt-1">{value}</p>
      </div>
    </div>
  );
}
