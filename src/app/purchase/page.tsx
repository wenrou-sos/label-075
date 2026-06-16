"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import type { PurchasePlan } from "@/lib/types";

type TabKey = "all" | "pending" | "approved" | "rejected" | "ordered";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待审核" },
  { key: "approved", label: "已审核" },
  { key: "rejected", label: "已驳回" },
  { key: "ordered", label: "已下单" },
];

const statusLabel: Record<PurchasePlan["status"], string> = {
  pending: "待审核",
  approved: "已审核",
  rejected: "已驳回",
  ordered: "已下单",
};

export default function PurchaseListPage() {
  const [plans, setPlans] = useState<PurchasePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  useEffect(() => {
    fetch("/api/purchase")
      .then((r) => r.json())
      .then((data: PurchasePlan[]) => {
        setPlans(data);
        setLoading(false);
      });
  }, []);

  const filtered = activeTab === "all" ? plans : plans.filter((p) => p.status === activeTab);

  const columns = [
    { key: "id", header: "申请单号" },
    { key: "departmentName", header: "科室" },
    {
      key: "itemCount",
      header: "耗材项数",
      render: (row: PurchasePlan) => row.items.length,
    },
    {
      key: "status",
      header: "状态",
      render: (row: PurchasePlan) => (
        <StatusBadge variant={row.status} label={statusLabel[row.status]} />
      ),
    },
    { key: "createdAt", header: "申请日期" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="h-6 w-40 bg-border rounded animate-pulse" />
            <div className="h-4 w-60 bg-border rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-28 bg-border rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <div key={t.key} className="h-9 w-20 bg-border rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-border rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="申购管理"
        description="管理科室耗材采购申请"
        actions={
          <Link
            href="/purchase/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-colors"
          >
            <Plus size={16} />
            新建申购
          </Link>
        }
      />

      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 text-xs">
                ({plans.filter((p) => p.status === tab.key).length})
              </span>
            )}
            {tab.key === "all" && <span className="ml-1.5 text-xs">({plans.length})</span>}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered as (PurchasePlan & Record<string, unknown>)[]}
        actions={(row) => (
          <div className="flex items-center gap-3">
            <Link
              href={`/purchase/${row.id}`}
              className="text-sm text-accent hover:text-accent-light transition-colors"
            >
              查看详情
            </Link>
            {row.status === "pending" && (
              <Link
                href={`/purchase/${row.id}`}
                className="text-sm text-warning hover:text-warning/80 transition-colors font-medium"
              >
                审核
              </Link>
            )}
          </div>
        )}
        emptyText="暂无申购记录"
      />
    </div>
  );
}
