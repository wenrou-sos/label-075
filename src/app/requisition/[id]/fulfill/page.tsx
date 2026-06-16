"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Package,
  PackageOpen,
} from "lucide-react";
import type { Requisition, RequisitionItem, Inventory } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";

interface FulfillFormItem {
  itemId: string;
  fulfillQty: number;
  allocations: { inventoryId: string; qty: number }[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 0,
  }).format(v);

const statusLabels: Record<RequisitionItem["status"], string> = {
  pending: "待出库",
  fulfilled: "已出库",
  partial: "部分出库",
};

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diff = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export default function FulfillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formItems, setFormItems] = useState<Record<string, FulfillFormItem>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/requisition").then((r) => r.json()),
      fetch("/api/warehouse/delivery").then(() => {
        return Promise.resolve();
      }),
    ]).then(([reqData]) => {
      const req = (reqData as Requisition[]).find((r) => r.id === id);
      setRequisition(req || null);

      import("@/lib/mock-data").then(({ inventory: inv }) => {
        setInventory(inv);

        if (req) {
          const forms: Record<string, FulfillFormItem> = {};
          req.items.forEach((item) => {
            const remainingQty = item.requestedQty - item.fulfilledQty;
            const itemInventory = inv.filter(
              (i) => i.consumableId === item.consumableId && i.quantity > 0
            );
            const allocations: { inventoryId: string; qty: number }[] = [];
            let allocated = 0;
            for (const invItem of itemInventory) {
              if (allocated >= remainingQty) break;
              const toAlloc = Math.min(invItem.quantity, remainingQty - allocated);
              if (toAlloc > 0) {
                allocations.push({ inventoryId: invItem.id, qty: toAlloc });
                allocated += toAlloc;
              }
            }
            forms[item.id] = {
              itemId: item.id,
              fulfillQty: Math.min(allocated, remainingQty),
              allocations,
            };
          });
          setFormItems(forms);
        }
        setLoading(false);
      });
    });
  }, [id]);

  const updateAllocation = (
    itemId: string,
    inventoryId: string,
    newQty: number
  ) => {
    setFormItems((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      const newAllocations = item.allocations.map((a) =>
        a.inventoryId === inventoryId ? { ...a, qty: Math.max(0, newQty) } : a
      );
      const totalQty = newAllocations.reduce((s, a) => s + a.qty, 0);
      return {
        ...prev,
        [itemId]: {
          ...item,
          allocations: newAllocations,
          fulfillQty: totalQty,
        },
      };
    });
  };

  const getItemInventory = (consumableId: string) =>
    inventory.filter((i) => i.consumableId === consumableId && i.quantity > 0);

  const getTotalInventoryQty = (consumableId: string) =>
    inventory
      .filter((i) => i.consumableId === consumableId)
      .reduce((s, i) => s + i.quantity, 0);

  const handleSubmit = async () => {
    if (!requisition) return;
    setSubmitting(true);

    const fulfillItems: { itemId: string; fulfilledQty: number; inventoryId: string }[] = [];
    Object.values(formItems).forEach((fi) => {
      fi.allocations.forEach((a) => {
        if (a.qty > 0) {
          fulfillItems.push({
            itemId: fi.itemId,
            fulfilledQty: a.qty,
            inventoryId: a.inventoryId,
          });
        }
      });
    });

    try {
      const res = await fetch(`/api/requisition/${id}/fulfill`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillItems }),
      });
      if (res.ok) {
        setSuccess(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-border rounded animate-pulse" />
          <div className="h-8 bg-border rounded w-48 animate-pulse" />
        </div>
        <div className="bg-card rounded-xl p-6 border border-border space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-border rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle size={48} className="text-warning mb-4" />
        <p className="text-lg font-medium text-text mb-2">未找到领用单</p>
        <Link
          href="/requisition"
          className="text-sm text-primary hover:underline"
        >
          返回领用列表
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CheckCircle2 size={64} className="text-accent mb-4" />
        <p className="text-xl font-bold text-text mb-2">出库完成</p>
        <p className="text-sm text-text-secondary mb-6">
          领用单 {requisition.id} 已成功处理
        </p>
        <div className="flex gap-3">
          <Link
            href="/requisition"
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
          >
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const reqStatusLabel: Record<Requisition["status"], string> = {
    pending: "待出库",
    fulfilled: "已出库",
    partial: "部分出库",
    cancelled: "已取消",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="领用出库"
        description={`领用单号：${requisition.id}`}
        actions={
          <Link
            href="/requisition"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
            返回列表
          </Link>
        }
      />

      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-sm font-medium text-text mb-4">领用单信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-text-muted mb-1">领用科室</div>
            <div className="text-sm text-text font-medium">
              {requisition.departmentName || requisition.departmentId}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">申请日期</div>
            <div className="text-sm text-text font-medium">
              {requisition.createdAt}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">状态</div>
            <StatusBadge
              variant={requisition.status}
              label={reqStatusLabel[requisition.status]}
            />
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">申请项数</div>
            <div className="text-sm text-text font-medium">
              {requisition.items.length} 项
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-sm font-medium text-text mb-4 flex items-center gap-2">
          <PackageOpen size={18} className="text-primary" />
          出库拣货
        </h3>

        <div className="space-y-5">
          {requisition.items.map((item) => {
            const formItem = formItems[item.id];
            const remainingQty = item.requestedQty - item.fulfilledQty;
            const itemInv = getItemInventory(item.consumableId);
            const totalStock = getTotalInventoryQty(item.consumableId);
            const stockShortage = totalStock < remainingQty;

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-4 transition-colors ${
                  stockShortage
                    ? "border-danger/50 bg-danger/5"
                    : "border-border bg-bg/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {item.consumableName || item.consumableId}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      规格：{item.specification || "-"} ｜ 单价：
                      {item.unitPrice ? formatCurrency(item.unitPrice) : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs text-text-muted">申请数量</p>
                      <p className="text-sm font-bold text-text">
                        {item.requestedQty}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">已出库</p>
                      <p className="text-sm font-bold text-text-secondary">
                        {item.fulfilledQty}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">本次出</p>
                      <p className="text-sm font-bold text-accent">
                        {formItem?.fulfillQty || 0}
                      </p>
                    </div>
                    <div>
                      <StatusBadge variant={item.status} label={statusLabels[item.status]} />
                    </div>
                  </div>
                </div>

                {stockShortage && (
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-danger">
                    <AlertTriangle size={12} />
                    库存不足！需 {remainingQty}，现有库存仅 {totalStock}
                  </div>
                )}

                {itemInv.length === 0 ? (
                  <div className="py-4 text-center text-sm text-text-muted border border-dashed border-border rounded-lg">
                    无可用库存
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium text-text-muted bg-bg/50 rounded">
                      <div className="col-span-3">批次/效期</div>
                      <div className="col-span-2">存放位置</div>
                      <div className="col-span-2 text-center">供应商</div>
                      <div className="col-span-2 text-center">库存</div>
                      <div className="col-span-2 text-center">本次出库</div>
                      <div className="col-span-1 text-center">状态</div>
                    </div>
                    {itemInv.map((inv) => {
                      const alloc = formItem?.allocations.find(
                        (a) => a.inventoryId === inv.id
                      );
                      const daysLeft = getDaysUntilExpiry(inv.expiryDate);
                      const nearExpiry = daysLeft <= 90;
                      return (
                        <div
                          key={inv.id}
                          className="grid grid-cols-12 gap-3 items-center px-3 py-2.5 bg-card rounded-lg border border-border"
                        >
                          <div className="col-span-3">
                            <div className="text-xs font-medium text-text">
                              {inv.batchNo}
                            </div>
                            <div className="text-xs text-text-muted mt-0.5">
                              效期至 {inv.expiryDate}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                              <Package size={12} />
                              {inv.location}
                            </span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-xs text-text-secondary">
                              {inv.supplierName}
                            </span>
                            {inv.isConsignment && (
                              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 text-[10px] bg-accent/10 text-accent rounded">
                                寄售
                              </span>
                            )}
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-sm font-medium text-text">
                              {inv.quantity}
                            </span>
                          </div>
                          <div className="col-span-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={inv.quantity}
                              value={alloc?.qty || 0}
                              onChange={(e) =>
                                updateAllocation(
                                  item.id,
                                  inv.id,
                                  Math.min(
                                    inv.quantity,
                                    parseInt(e.target.value) || 0
                                  )
                                )
                              }
                              className="w-20 mx-auto px-2 py-1 text-center text-sm rounded-md border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            {nearExpiry ? (
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  daysLeft <= 30
                                    ? "bg-danger/10 text-danger"
                                    : "bg-warning/10 text-warning"
                                }`}
                              >
                                {daysLeft}天
                              </span>
                            ) : (
                              <span className="text-text-muted text-xs">正常</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/requisition"
          className="px-5 py-2.5 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-accent/5 transition-colors"
        >
          取消
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "提交中..." : "确认出库"}
        </button>
      </div>
    </div>
  );
}
