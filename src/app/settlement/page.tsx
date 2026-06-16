"use client";

import { useEffect, useState } from "react";
import { DollarSign, Clock, FileText, Eye, CheckCircle, Download } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import DataTable, { Column } from "@/components/ui/DataTable";
import { exportToCsv, type CsvColumn } from "@/lib/csv-export";
import type { Settlement } from "@/lib/types";

interface DepartmentSummary {
  departmentId: string;
  departmentName: string;
  month: string;
  totalAmount: number;
  itemCount: number;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 0 }).format(v);

const statusTextMap: Record<string, string> = {
  draft: "草稿",
  confirmed: "已确认",
  paid: "已支付",
  cancelled: "已取消",
};

function SkeletonRow() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-border/50 rounded animate-pulse" />
      ))}
    </div>
  );
}

export default function SettlementPage() {
  const [activeTab, setActiveTab] = useState<"department" | "supplier">("department");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [deptData, setDeptData] = useState<DepartmentSummary[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const promises =
      activeTab === "department"
        ? [fetch(`/api/settlement/department?month=${month}`).then((r) => r.json())]
        : [fetch(`/api/settlement/supplier?month=${month}`).then((r) => r.json())];

    Promise.all(promises)
      .then(([data]) => {
        if (activeTab === "department") {
          setDeptData(data);
        } else {
          setSettlements(data);
        }
        setLoading(false);
      });
  }, [activeTab, month]);

  const totalAmount = settlements.reduce((sum, s) => sum + s.totalAmount, 0);
  const pendingCount = settlements.filter((s) => s.status === "draft").length;

  const handleGenerateSettlement = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/settlement/supplier", { method: "POST" });
      if (res.ok) {
        const updated = await fetch(`/api/settlement/supplier?month=${month}`).then((r) => r.json());
        setSettlements(updated);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleExportDepartment = () => {
    const columns: CsvColumn<DepartmentSummary>[] = [
      { key: "departmentName", header: "科室名称" },
      { key: "itemCount", header: "耗材项数", render: (row) => row.itemCount || 0 },
      { key: "totalAmount", header: "领用金额", render: (row) => formatCurrency(row.totalAmount) },
    ];
    exportToCsv(deptData, columns, `${month}-科室领用统计.csv`);
  };

  const handleExportSupplier = () => {
    const columns: CsvColumn<Settlement>[] = [
      { key: "supplierName", header: "供应商名称", render: (row) => row.supplierName || "-" },
      { key: "month", header: "月份" },
      { key: "totalAmount", header: "结算金额", render: (row) => formatCurrency(row.totalAmount) },
      { key: "status", header: "状态", render: (row) => statusTextMap[row.status] || row.status },
    ];
    const uniqueMonths = [...new Set(settlements.map((s) => s.month))].sort();
    const monthLabel =
      uniqueMonths.length === 0
        ? month
        : uniqueMonths.length === 1
          ? uniqueMonths[0]
          : `${uniqueMonths[0]}至${uniqueMonths[uniqueMonths.length - 1]}`;
    exportToCsv(settlements, columns, `${monthLabel}-供应商结算.csv`);
  };

  const deptColumns: Column<DepartmentSummary>[] = [
    { key: "departmentName", header: "科室" },
    { key: "itemCount", header: "耗材项数", render: (row) => row.itemCount || 0 },
    { key: "totalAmount", header: "领用金额", render: (row) => formatCurrency(row.totalAmount) },
  ];

  const settlementColumns: Column<Settlement>[] = [
    { key: "supplierName", header: "供应商", render: (row) => row.supplierName || "-" },
    { key: "month", header: "月份" },
    { key: "totalAmount", header: "结算金额", render: (row) => formatCurrency(row.totalAmount) },
    {
      key: "status",
      header: "状态",
      render: (row) => <StatusBadge variant={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="结算管理"
        description="科室领用统计与供应商结算管理"
        actions={
          <div className="flex items-center gap-2">
            {activeTab === "supplier" && (
              <button
                onClick={handleGenerateSettlement}
                disabled={generating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50"
              >
                <FileText size={16} />
                {generating ? "生成中..." : "生成结算单"}
              </button>
            )}
            <button
              onClick={activeTab === "department" ? handleExportDepartment : handleExportSupplier}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-text-secondary text-sm font-medium rounded-lg hover:bg-bg hover:text-text transition-colors"
            >
              <Download size={16} />
              导出 CSV
            </button>
          </div>
        }
      />

      {activeTab === "supplier" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">结算总金额</p>
                <p className="text-xl font-bold text-text">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">待确认结算单</p>
                <p className="text-xl font-bold text-text">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex border-b border-border flex-1">
          <button
            onClick={() => setActiveTab("department")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "department"
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text"
            }`}
          >
            科室领用统计
          </button>
          <button
            onClick={() => setActiveTab("supplier")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "supplier"
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text"
            }`}
          >
            供应商结算
          </button>
        </div>
        <div className="flex items-center gap-3 pb-1 ml-4">
          <label className="text-sm text-text-secondary">月份：</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

      {activeTab === "department" && (
        <div className="space-y-4">
          {loading ? (
            <SkeletonRow />
          ) : (
            <DataTable
              columns={deptColumns}
              data={deptData}
              emptyText="该月份暂无科室领用数据"
            />
          )}
        </div>
      )}

      {activeTab === "supplier" && (
        <div>
          {loading ? (
            <SkeletonRow />
          ) : (
            <DataTable
              columns={settlementColumns}
              data={settlements}
              actions={(row) => {
                const settlement = row as typeof settlements[number];
                return (
                  <div className="flex items-center gap-2">
                    {settlement.status === "draft" && (
                      <button
                        onClick={() => {
                          setSettlements((prev) =>
                            prev.map((s) =>
                              s.id === settlement.id ? { ...s, status: "confirmed" as const } : s
                            )
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-accent bg-accent/10 rounded hover:bg-accent/20 transition-colors"
                      >
                        <CheckCircle size={12} />
                        确认
                      </button>
                    )}
                    <button className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors">
                      <Eye size={12} />
                      查看
                    </button>
                  </div>
                );
              }}
              emptyText="暂无结算单数据"
            />
          )}
        </div>
      )}
    </div>
  );
}
