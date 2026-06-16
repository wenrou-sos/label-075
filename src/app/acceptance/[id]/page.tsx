"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Truck,
  FileText,
  AlertTriangle,
} from "lucide-react";
import type { Delivery, DeliveryItem } from "@/lib/types";

interface ItemFormState {
  acceptedQty: number;
  photoNames: string[];
  remark: string;
}

export default function AcceptanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [itemForms, setItemForms] = useState<Record<string, ItemFormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/warehouse/delivery")
      .then((r) => r.json())
      .then((data: Delivery[]) => {
        const d = data.find((d) => d.id === id) || null;
        setDelivery(d);
        if (d) {
          const forms: Record<string, ItemFormState> = {};
          d.items.forEach((item) => {
            forms[item.id] = {
              acceptedQty: item.deliveredQty,
              photoNames: [],
              remark: "",
            };
          });
          setItemForms(forms);
        }
        setLoading(false);
      });
  }, [id]);

  const updateItemForm = (
    itemId: string,
    patch: Partial<ItemFormState>
  ) => {
    setItemForms((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...patch },
    }));
  };

  const handleFileChange = (itemId: string, files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    updateItemForm(itemId, {
      photoNames: [...(itemForms[itemId]?.photoNames || []), ...names],
    });
  };

  const handleSubmit = async () => {
    if (!delivery) return;
    setSubmitting(true);
    const acceptedItems = delivery.items.map((item) => ({
      itemId: item.id,
      acceptedQty: itemForms[item.id]?.acceptedQty ?? 0,
      photos: itemForms[item.id]?.photoNames ?? [],
      remark: itemForms[item.id]?.remark ?? "",
    }));

    try {
      const res = await fetch(`/api/warehouse/acceptance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptedItems }),
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
            <div key={i} className="h-16 bg-border rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle size={48} className="text-warning mb-4" />
        <p className="text-lg font-medium text-text mb-2">未找到送货单</p>
        <Link
          href="/acceptance"
          className="text-sm text-primary hover:underline"
        >
          返回验收列表
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CheckCircle2 size={64} className="text-accent mb-4" />
        <p className="text-xl font-bold text-text mb-2">验收完成</p>
        <p className="text-sm text-text-secondary mb-6">
          送货单 {delivery.deliveryNoteNo} 已成功验收
        </p>
        <div className="flex gap-3">
          <Link
            href="/acceptance"
            className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors"
          >
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const isMismatched = (item: DeliveryItem) => {
    const form = itemForms[item.id];
    return form && form.acceptedQty !== item.deliveredQty;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/acceptance"
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-accent/5 transition-colors"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">验收确认</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            核对送货信息并确认验收数量
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
          <Truck size={18} className="text-primary" />
          送货信息
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-text-muted">供应商</p>
            <p className="text-sm font-medium text-text mt-1">
              {delivery.supplierName || delivery.supplierId}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">随货同行单号</p>
            <p className="text-sm font-medium text-text mt-1">
              {delivery.deliveryNoteNo}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">送货日期</p>
            <p className="text-sm font-medium text-text mt-1">
              {delivery.createdAt}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          物品核验
        </h2>

        <div className="space-y-4">
          {delivery.items.map((item) => {
            const form = itemForms[item.id];
            if (!form) return null;
            const mismatch = isMismatched(item);

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-4 transition-colors ${
                  mismatch
                    ? "border-warning bg-warning/5"
                    : "border-border bg-bg/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {item.consumableName || item.consumableId}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      规格：{item.specification || "-"} ｜ 批号：
                      {item.batchNo} ｜ 效期：{item.expiryDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">送货数量</p>
                    <p className="text-sm font-bold text-text">
                      {item.deliveredQty}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">
                      验收数量
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={item.deliveredQty}
                      value={form.acceptedQty}
                      onChange={(e) =>
                        updateItemForm(item.id, {
                          acceptedQty: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-text-muted mb-1">
                      拍照留档
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[item.id]?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <Camera size={14} />
                        选择文件
                      </button>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[item.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileChange(item.id, e.target.files)}
                      />
                      {form.photoNames.length > 0 && (
                        <span className="text-xs text-accent">
                          {form.photoNames.length}张
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-text-muted mb-1">
                      备注
                    </label>
                    <input
                      type="text"
                      placeholder="可选备注"
                      value={form.remark}
                      onChange={(e) =>
                        updateItemForm(item.id, { remark: e.target.value })
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text bg-card placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>

                {mismatch && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-warning">
                    <AlertTriangle size={12} />
                    验收数量与送货数量不一致（送货 {item.deliveredQty}，验收{" "}
                    {form.acceptedQty}）
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/acceptance"
          className="px-5 py-2.5 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-accent/5 transition-colors"
        >
          取消
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "提交中..." : "确认验收"}
        </button>
      </div>
    </div>
  );
}
