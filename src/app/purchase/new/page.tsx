"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import type { Consumable, Department } from "@/lib/types";

interface ItemRow {
  key: string;
  consumableId: string;
  consumableName: string;
  specification: string;
  unitPrice: number;
  quantity: number;
  urgency: "routine" | "urgent";
}

export default function NewPurchasePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { key: crypto.randomUUID(), consumableId: "", consumableName: "", specification: "", unitPrice: 0, quantity: 1, urgency: "routine" },
  ]);
  const [searchTerm, setSearchTerm] = useState<Record<string, string>>({});
  const [showDropdown, setShowDropdown] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/master/departments").then((r) => r.json()).then(setDepartments);
    fetch("/api/master/consumables").then((r) => r.json()).then(setConsumables);
  }, []);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { key: crypto.randomUUID(), consumableId: "", consumableName: "", specification: "", unitPrice: 0, quantity: 1, urgency: "routine" },
    ]);
  };

  const removeItem = (key: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.key !== key));
    setSearchTerm((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setShowDropdown((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateItem = (key: string, field: keyof ItemRow, value: string | number) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, [field]: value } : i))
    );
  };

  const selectConsumable = useCallback(
    (key: string, c: Consumable) => {
      setItems((prev) =>
        prev.map((i) =>
          i.key === key
            ? { ...i, consumableId: c.id, consumableName: c.name, specification: c.specification, unitPrice: c.unitPrice }
            : i
        )
      );
      setSearchTerm((prev) => ({ ...prev, [key]: c.name }));
      setShowDropdown((prev) => ({ ...prev, [key]: false }));
    },
    []
  );

  const handleSubmit = async () => {
    if (!departmentId) return;
    const validItems = items.filter((i) => i.consumableId && i.quantity > 0);
    if (validItems.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId,
          items: validItems.map((i) => ({
            consumableId: i.consumableId,
            quantity: i.quantity,
            urgency: i.urgency,
          })),
        }),
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="新建申购"
        description="填写科室耗材采购申请"
        actions={
          <button
            type="button"
            onClick={() => router.push("/purchase")}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors"
          >
            取消
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">申请科室</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            >
              <option value="">请选择科室</option>
              {departments
                .filter((d) => d.type === "clinical")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">申请日期</label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              readOnly
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg/50 text-text-secondary text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text">耗材明细</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors"
            >
              <Plus size={14} />
              添加耗材
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.key}
                className="grid grid-cols-12 gap-3 items-start p-4 bg-bg rounded-lg border border-border"
              >
                <div className="col-span-4 relative">
                  <label className="block text-xs text-text-secondary mb-1">耗材名称</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="搜索耗材..."
                      value={searchTerm[item.key] || ""}
                      onChange={(e) => {
                        setSearchTerm((prev) => ({ ...prev, [item.key]: e.target.value }));
                        setShowDropdown((prev) => ({ ...prev, [item.key]: true }));
                        if (!e.target.value) {
                          updateItem(item.key, "consumableId", "");
                          updateItem(item.key, "consumableName", "");
                        }
                      }}
                      onFocus={() => setShowDropdown((prev) => ({ ...prev, [item.key]: true }))}
                      onBlur={() => setTimeout(() => setShowDropdown((prev) => ({ ...prev, [item.key]: false })), 200)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    />
                  </div>
                  {showDropdown[item.key] && searchTerm[item.key] !== undefined && (
                    <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-card border border-border rounded-lg shadow-lg">
                      {consumables
                        .filter(
                          (c) =>
                            c.name.includes(searchTerm[item.key] || "") ||
                            c.specification.includes(searchTerm[item.key] || "")
                        )
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={() => selectConsumable(item.key, c)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent/5 transition-colors"
                          >
                            <div className="text-text">{c.name}</div>
                            <div className="text-xs text-text-muted">
                              {c.specification} · {formatCurrency(c.unitPrice)}
                            </div>
                          </button>
                        ))}
                      {consumables.filter(
                        (c) =>
                          c.name.includes(searchTerm[item.key] || "") ||
                          c.specification.includes(searchTerm[item.key] || "")
                      ).length === 0 && (
                        <div className="px-3 py-2 text-sm text-text-muted">无匹配耗材</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">规格</label>
                  <input
                    type="text"
                    value={item.specification}
                    readOnly
                    placeholder="自动填充"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg/50 text-text-secondary"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">单价</label>
                  <input
                    type="text"
                    value={item.unitPrice ? formatCurrency(item.unitPrice) : ""}
                    readOnly
                    placeholder="自动填充"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg/50 text-text-secondary"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs text-text-secondary mb-1">数量</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.key, "quantity", Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">紧急程度</label>
                  <select
                    value={item.urgency}
                    onChange={(e) => updateItem(item.key, "urgency", e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  >
                    <option value="routine">常规</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>

                <div className="col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    disabled={items.length <= 1}
                    className="p-2 text-text-muted hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => router.push("/purchase")}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!departmentId || items.every((i) => !i.consumableId) || submitting}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            提交申请
          </button>
        </div>
      </div>
    </div>
  );
}
