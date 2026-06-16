"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, DollarSign, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable from "@/components/ui/DataTable";
import StatCard from "@/components/ui/StatCard";
import type { Delivery, DashboardData } from "@/lib/types";
import type { Column } from "@/components/ui/DataTable";

type FilterTab = "all" | "pending" | "accepted" | "partial";

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待验收" },
  { key: "accepted", label: "已验收" },
  { key: "partial", label: "部分验收" },
];

const statusLabelMap: Record<string, string> = {
  pending: "待验收",
  accepted: "已验收",
  partial: "部分验收",
  rejected: "已拒收",
};

export default function AcceptanceListPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/warehouse/delivery").then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()),
    ]).then(([dl, db]) => {
      setDeliveries(dl);
      setDashboard(db);
      setLoading(false);
    });
  }, []);

  const filtered =
    activeTab === "all"
      ? deliveries
      : deliveries.filter((d) => d.status === activeTab);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
    }).format(v);

  const columns: Column<Record<string, unknown>>[] = [
    { key: "id", header: "送货单号" },
    { key: "supplierName", header: "供应商" },
    { key: "deliveryNoteNo", header: "随货同行单号" },
    {
      key: "items",
      header: "物品数",
      render: (row) => (row as unknown as Delivery).items.length,
    },
    {
      key: "status",
      header: "状态",
      render: (row) => {
        const d = row as unknown as Delivery;
        const variant = d.status === "accepted" ? "fulfilled" : d.status;
        return (
          <StatusBadge
            variant={variant as "pending" | "fulfilled" | "partial" | "rejected"}
            label={statusLabelMap[d.status]}
          />
        );
      },
    },
    {
      key: "createdAt",
      header: "日期",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 h-32 animate-pulse">
              <div className="h-4 bg-border rounded w-1/3 mb-4" />
              <div className="h-8 bg-border rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 bg-border rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-border rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="入库验收" description="管理送货单验收流程" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={<DollarSign size={22} />}
          label="库存总金额"
          value={dashboard ? formatCurrency(dashboard.totalInventoryValue) : "-"}
        />
        <StatCard
          icon={<AlertTriangle size={22} />}
          label="近效期品种"
          value={dashboard?.nearExpiryItems.length ?? 0}
        />
      </div>

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-text-muted">
              {tab.key === "all"
                ? deliveries.length
                : deliveries.filter((d) => d.status === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        actions={(row) => {
          const d = row as unknown as Delivery;
          if (d.status === "pending" || d.status === "partial") {
            return (
              <Link
                href={`/acceptance/${d.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
              >
                <ClipboardCheck size={14} />
                验收
              </Link>
            );
          }
          return <span className="text-sm text-text-muted">已处理</span>;
        }}
      />
    </div>
  );
}
