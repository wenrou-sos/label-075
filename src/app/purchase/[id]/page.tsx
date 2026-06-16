"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import type { PurchasePlan } from "@/lib/types";

interface ReviewItem {
  id: string;
  status: "approved" | "rejected";
  remark: string;
}

export default function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<PurchasePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/purchase")
      .then((r) => r.json())
      .then((data: PurchasePlan[]) => {
        const found = data.find((p) => p.id === id);
        if (found) {
          setPlan(found);
          setReviewItems(
            found.items.map((item) => ({
              id: item.id,
              status: "approved" as const,
              remark: "",
            }))
          );
        }
        setLoading(false);
      });
  }, [id]);

  const updateReviewItem = (itemId: string, field: keyof ReviewItem, value: string) => {
    setReviewItems((prev) =>
      prev.map((ri) => (ri.id === itemId ? { ...ri, [field]: value } : ri))
    );
  };

  const handleSubmitReview = async (action: "approve" | "reject") => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/purchase/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewItems }),
      });
      if (res.ok) {
        router.push("/purchase");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 0 }).format(v);

  const statusLabel: Record<PurchasePlan["status"], string> = {
    pending: "待审核",
    approved: "已审核",
    rejected: "已驳回",
    ordered: "已下单",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-border rounded animate-pulse" />
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-border rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <PageHeader title="未找到申购单" />
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-text-muted mb-4">该申购单不存在或已被删除</p>
          <Link href="/purchase" className="text-accent hover:text-accent-light text-sm">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const isPending = plan.status === "pending";

  return (
    <div className="space-y-6">
      <PageHeader
        title="申购详情"
        description={`申请单号：${plan.id}`}
        actions={
          <Link
            href="/purchase"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
            返回列表
          </Link>
        }
      />

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-text mb-4">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-text-muted mb-1">申请科室</div>
            <div className="text-sm text-text font-medium">{plan.departmentName || plan.departmentId}</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">申请日期</div>
            <div className="text-sm text-text font-medium">{plan.createdAt}</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">状态</div>
            <StatusBadge variant={plan.status} label={statusLabel[plan.status]} />
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">耗材项数</div>
            <div className="text-sm text-text font-medium">{plan.items.length} 项</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-medium text-text mb-4">耗材明细</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap">耗材名称</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap">规格</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap">单价</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap">数量</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap">紧急程度</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap">状态</th>
                {isPending && <th className="px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap">审核操作</th>}
                {isPending && <th className="px-4 py-3 text-left font-medium text-text-secondary whitespace-nowrap">备注</th>}
              </tr>
            </thead>
            <tbody>
              {plan.items.map((item, index) => {
                const reviewItem = reviewItems.find((ri) => ri.id === item.id);
                return (
                  <tr key={item.id} className={`border-b border-border last:border-b-0 ${index % 2 === 1 ? "bg-bg/50" : ""}`}>
                    <td className="px-4 py-3 text-text whitespace-nowrap">{item.consumableName || item.consumableId}</td>
                    <td className="px-4 py-3 text-text whitespace-nowrap">{item.specification || "-"}</td>
                    <td className="px-4 py-3 text-text whitespace-nowrap">{item.unitPrice ? formatCurrency(item.unitPrice) : "-"}</td>
                    <td className="px-4 py-3 text-text whitespace-nowrap">{item.quantity}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.urgency === "urgent"
                            ? "bg-danger/10 text-danger"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {item.urgency === "urgent" ? "紧急" : "常规"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isPending && reviewItem ? (
                        <StatusBadge
                          variant={reviewItem.status}
                          label={reviewItem.status === "approved" ? "通过" : "驳回"}
                        />
                      ) : (
                        <StatusBadge variant={item.status} />
                      )}
                    </td>
                    {isPending && (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateReviewItem(item.id, "status", "approved")}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                reviewItem?.status === "approved"
                                  ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                                  : "text-text-muted hover:bg-accent/5"
                              }`}
                            >
                              <CheckCircle size={12} />
                              通过
                            </button>
                            <button
                              type="button"
                              onClick={() => updateReviewItem(item.id, "status", "rejected")}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                reviewItem?.status === "rejected"
                                  ? "bg-danger/10 text-danger ring-1 ring-danger/30"
                                  : "text-text-muted hover:bg-danger/5"
                              }`}
                            >
                              <XCircle size={12} />
                              驳回
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="审核备注"
                            value={reviewItem?.remark || ""}
                            onChange={(e) => updateReviewItem(item.id, "remark", e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                          />
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isPending && (
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => handleSubmitReview("reject")}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-danger/30 text-danger text-sm font-medium hover:bg-danger/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              全部驳回
            </button>
            <button
              type="button"
              onClick={() => handleSubmitReview("approve")}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              提交审核
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
