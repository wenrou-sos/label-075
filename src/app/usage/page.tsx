"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, ChevronDown, ChevronUp, Syringe, Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import type { UsageRecord } from "@/lib/types";

export default function UsagePage() {
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usage").then((r) => r.json()).then(setRecords);
  }, []);

  const columns: Column<UsageRecord>[] = [
    {
      key: "id",
      header: "使用记录号",
      render: (row) => (
        <span className="font-mono text-xs text-primary">{row.id}</span>
      ),
    },
    { key: "departmentName", header: "科室" },
    { key: "operatingRoom", header: "手术室" },
    {
      key: "usedAt",
      header: "使用时间",
      render: (row) => (
        <span className="text-text-secondary">
          {new Date(row.usedAt).toLocaleString("zh-CN")}
        </span>
      ),
    },
    {
      key: "items",
      header: "物品数",
      render: (row) => {
        const implantCount = row.items.filter((i) => i.isImplant).length;
        return (
          <span className="text-text-secondary">
            {row.items.length} 项
            {implantCount > 0 && (
              <span className="ml-1.5 inline-flex items-center gap-0.5 text-warning text-xs">
                <Syringe size={12} />
                {implantCount}植入
              </span>
            )}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="使用管理"
        description="查看手术耗材使用记录与植入物追溯"
        actions={
          <Link
            href="/usage/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-light transition-colors"
          >
            <Plus size={16} />
            录入使用记录
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={records as (UsageRecord & Record<string, unknown>)[]}
        actions={(row) => (
          <button
            onClick={() =>
              setExpandedId(expandedId === row.id ? null : row.id)
            }
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-primary border border-border rounded-md hover:bg-bg transition-colors"
          >
            {expandedId === row.id ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
            <Eye size={14} />
            查看
          </button>
        )}
      />

      {expandedId && (() => {
        const record = records.find((r) => r.id === expandedId);
        if (!record) return null;
        return (
          <div className="mt-4 bg-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold text-text mb-1">
              使用记录 {record.id} 明细
            </h3>
            <p className="text-xs text-text-muted mb-3">
              {record.departmentName} · {record.operatingRoom} ·{" "}
              {new Date(record.usedAt).toLocaleString("zh-CN")}
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">耗材名称</th>
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">规格</th>
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">使用数量</th>
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">植入标记</th>
                  <th className="px-3 py-2 text-left text-text-secondary font-medium">患者ID</th>
                </tr>
              </thead>
              <tbody>
                {record.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 text-text">
                      {item.consumableName}
                    </td>
                    <td className="px-3 py-2 text-text-secondary">
                      {item.specification || "-"}
                    </td>
                    <td className="px-3 py-2 text-text">{item.usedQty}</td>
                    <td className="px-3 py-2">
                      {item.isImplant ? (
                        <span className="inline-flex items-center gap-1 text-warning text-xs font-medium">
                          <Syringe size={12} />
                          植入
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">非植入</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {item.patientId ? (
                        <span className="font-mono text-xs text-primary">
                          {item.patientId}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">-</span>
                      )}
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
