"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, PackageOpen } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import type { Requisition } from "@/lib/types";

type FilterTab = "all" | "pending" | "fulfilled" | "partial";

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待出库" },
  { key: "fulfilled", label: "已出库" },
  { key: "partial", label: "部分出库" },
];

const statusLabels: Record<Requisition["status"], string> = {
  pending: "待出库",
  fulfilled: "已出库",
  partial: "部分出库",
  cancelled: "已取消",
};

export default function RequisitionPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/requisition")
      .then((r) => r.json())
      .then(setRequisitions);
  }, []);

  const filtered = activeTab === "all"
    ? requisitions
    : requisitions.filter((r) => r.status === activeTab);

  const columns: Column<Requisition>[] = [
    {
      key: "id",
      header: "领用单号",
      render: (row) => (
        <span className="font-mono text-xs text-primary">{row.id}</span>
      ),
    },
    { key: "departmentName", header: "科室" },
    {
      key: "items",
      header: "物品数",
      render: (row) => (
        <span className="text-text-secondary">{row.items.length} 项</span>
      ),
    },
    {
      key: "status",
      header: "状态",
      render: (row) => (
        <StatusBadge variant={row.status} label={statusLabels[row.status]} />
      ),
    },
    { key: "createdAt", header: "日期" },
  ];

  return (
    <div>
      <PageHeader
        title="领用管理"
        description="管理科室耗材领用申请与出库"
        actions={
          <Link
            href="/requisition/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-light transition-colors"
          >
            <Plus size={16} />
            新建领用
          </Link>
        }
      />

      <div className="flex gap-1 mb-4 bg-card rounded-lg border border-border p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-bg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered as (Requisition & Record<string, unknown>)[]}
        actions={(row) => (
          <div className="flex items-center gap-2">
            {row.status === "pending" && (
              <Link
                href={`/requisition/${row.id}/fulfill`}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-accent border border-accent/30 rounded-md hover:bg-accent/5 transition-colors"
              >
                <PackageOpen size={14} />
                出库
              </Link>
            )}
            <button
              onClick={() =>
                setExpandedId(expandedId === row.id ? null : row.id)
              }
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary border border-border rounded-md hover:bg-bg transition-colors"
            >
              <Eye size={14} />
              查看
            </button>
          </div>
        )}
      />

      {expandedId && (() => {
        const req = requisitions.find((r) => r.id === expandedId);
        if (!req) return null;
        return (
          <div className="mt-4 bg-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold text-text mb-3">
              领用单 {req.id} 明细
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">耗材名称</th>
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">规格</th>
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">单价</th>
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">申请数量</th>
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">已出库</th>
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {req.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 text-text">{item.consumableName}</td>
                    <td className="px-3 py-2 text-text-secondary">{item.specification || "-"}</td>
                    <td className="px-3 py-2 text-text-secondary">
                      {item.unitPrice ? `¥${item.unitPrice.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-3 py-2 text-text">{item.requestedQty}</td>
                    <td className="px-3 py-2 text-text">{item.fulfilledQty}</td>
                    <td className="px-3 py-2">
                      <StatusBadge variant={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
  );
}
