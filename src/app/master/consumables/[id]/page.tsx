"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, AlertTriangle } from "lucide-react";
import type { Consumable, Inventory } from "@/lib/types";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 0 }).format(v);

interface NearExpiryInventory extends Inventory {
  daysLeft?: number;
  warningLevel?: "critical" | "warning" | "notice";
}

export default function ConsumableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [consumable, setConsumable] = useState<Consumable | null>(null);
  const [inventoryItems, setInventoryItems] = useState<NearExpiryInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/master/consumables").then((r) => r.json()),
      fetch("/api/inventory/near-expiry").then((r) => r.json()),
    ])
      .then(([consumablesData, nearExpiryData]) => {
        const found = (consumablesData as Consumable[]).find((c) => c.id === id);
        setConsumable(found || null);

        const nearExpiryItems = nearExpiryData.items || [];
        const related = nearExpiryItems.filter(
          (item: NearExpiryInventory) => item.consumableId === id
        );
        setInventoryItems(related);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border/50 rounded w-48 animate-pulse" />
        <div className="h-48 bg-border/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!consumable) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <Package size={48} className="mb-4 opacity-30" />
        <p className="text-lg">未找到该耗材信息</p>
        <button
          onClick={() => router.push("/master/consumables")}
          className="mt-4 px-4 py-2 text-sm text-accent hover:underline"
        >
          返回耗材目录
        </button>
      </div>
    );
  }

  const warningColorMap = {
    critical: "text-danger bg-danger/10",
    warning: "text-warning bg-warning/10",
    notice: "text-text-secondary bg-text-secondary/10",
  };

  const warningLabelMap = {
    critical: "紧急",
    warning: "预警",
    notice: "提醒",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/master/consumables")}
          className="p-2 rounded-lg hover:bg-border/50 transition-colors text-text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text">{consumable.name}</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {consumable.specification} · {consumable.model}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-text mb-4">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem label="耗材名称" value={consumable.name} />
          <InfoItem label="规格" value={consumable.specification} />
          <InfoItem label="型号" value={consumable.model} />
          <InfoItem label="类别" value={consumable.category} />
          <InfoItem label="单位" value={consumable.unit} />
          <InfoItem label="单价" value={formatCurrency(consumable.unitPrice)} />
          <InfoItem
            label="植入标记"
            value={
              consumable.isImplant ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-danger/10 text-danger">
                  植入
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-text-muted/10 text-text-muted">
                  非植入
                </span>
              )
            }
          />
          <InfoItem label="供应商" value={consumable.supplierName || "-"} />
          <InfoItem label="创建时间" value={consumable.createdAt} />
        </div>
      </div>

      {inventoryItems.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-warning" />
            <h2 className="text-sm font-semibold text-text">近效期库存预警</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger">
              {inventoryItems.length}
            </span>
          </div>
          <div className="space-y-3">
            {inventoryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text truncate">
                      批号 {item.batchNo}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                        warningColorMap[item.warningLevel!]
                      }`}
                    >
                      {warningLabelMap[item.warningLevel!]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                    <span>效期：{item.expiryDate}</span>
                    <span>库存：{item.quantity} {consumable.unit}</span>
                    <span>库位：{item.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span
                    className={`text-lg font-bold ${
                      item.warningLevel === "critical"
                        ? "text-danger"
                        : item.warningLevel === "warning"
                        ? "text-warning"
                        : "text-text-secondary"
                    }`}
                  >
                    {item.daysLeft}
                  </span>
                  <span className="text-xs text-text-muted">天</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-text-muted mb-1">{label}</dt>
      <dd className="text-sm text-text font-medium">{value}</dd>
    </div>
  );
}
