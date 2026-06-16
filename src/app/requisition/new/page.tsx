"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Search, ChevronDown } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import type { Department, Consumable } from "@/lib/types";

interface ItemRow {
  key: string;
  consumableId: string;
  requestedQty: number;
}

export default function NewRequisitionPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [items, setItems] = useState<ItemRow[]>([
    { key: crypto.randomUUID(), consumableId: "", requestedQty: 1 },
  ]);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/master/departments").then((r) => r.json()).then(setDepartments);
    fetch("/api/master/consumables").then((r) => r.json()).then(setConsumables);
  }, []);

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { key: crypto.randomUUID(), consumableId: "", requestedQty: 1 },
    ]);
  };

  const removeItemRow = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, field: "consumableId" | "requestedQty", value: string | number) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, [field]: value } : i))
    );
  };

  const getConsumable = (id: string) => consumables.find((c) => c.id === id);

  const filteredConsumables = useMemo(() => {
    const result: Record<string, Consumable[]> = {};
    items.forEach((item) => {
      const term = (searchTerms[item.key] || "").toLowerCase();
      result[item.key] = consumables.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.specification.toLowerCase().includes(term) ||
          c.category.toLowerCase().includes(term)
      );
    });
    return result;
  }, [consumables, items, searchTerms]);

  const handleSubmit = async () => {
    setError("");
    if (!departmentId) {
      setError("请选择领用科室");
      return;
    }
    const validItems = items.filter((i) => i.consumableId && i.requestedQty > 0);
    if (validItems.length === 0) {
      setError("请至少添加一项耗材并填写数量");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/requisition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId,
          items: validItems.map((i) => ({
            consumableId: i.consumableId,
            requestedQty: i.requestedQty,
          })),
        }),
      });
      if (res.ok) {
        router.push("/requisition");
      } else {
        const data = await res.json();
        setError(data.error || "提交失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="新建领用单"
        description="选择科室并添加需要领用的耗材"
      />

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        {error && (
          <div className="px-4 py-3 bg-danger/10 text-danger text-sm rounded-lg border border-danger/20">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            领用科室
          </label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full max-w-xs px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text">领用物品</h3>
            <button
              onClick={addItemRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-md hover:bg-accent/5 transition-colors"
            >
              <Plus size={14} />
              添加物品
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const selected = getConsumable(item.consumableId);
              const isOpen = openDropdown === item.key;
              return (
                <div
                  key={item.key}
                  className="flex items-start gap-3 p-3 bg-bg rounded-lg border border-border"
                >
                  <div className="flex-1 relative">
                    <div
                      onClick={() =>
                        setOpenDropdown(isOpen ? null : item.key)
                      }
                      className="flex items-center justify-between px-3 py-2 bg-card border border-border rounded-lg cursor-pointer text-sm hover:border-primary/30 transition-colors"
                    >
                      {selected ? (
                        <span className="text-text">
                          {selected.name}
                          <span className="text-text-secondary ml-2">
                            {selected.specification}
                          </span>
                        </span>
                      ) : (
                        <span className="text-text-muted">搜索并选择耗材</span>
                      )}
                      <ChevronDown
                        size={16}
                        className={`text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>

                    {isOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                        <div className="p-2 border-b border-border sticky top-0 bg-card">
                          <div className="flex items-center gap-2 px-2 py-1.5 bg-bg rounded-md">
                            <Search size={14} className="text-text-muted" />
                            <input
                              type="text"
                              placeholder="搜索耗材名称/规格/类别"
                              value={searchTerms[item.key] || ""}
                              onChange={(e) =>
                                setSearchTerms((prev) => ({
                                  ...prev,
                                  [item.key]: e.target.value,
                                }))
                              }
                              className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                            />
                          </div>
                        </div>
                        {(filteredConsumables[item.key] || []).map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              updateItem(item.key, "consumableId", c.id);
                              setOpenDropdown(null);
                              setSearchTerms((prev) => {
                                const next = { ...prev };
                                delete next[item.key];
                                return next;
                              });
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent/5 transition-colors"
                          >
                            <div className="text-text">{c.name}</div>
                            <div className="text-xs text-text-muted">
                              {c.specification} · {c.category} · ¥
                              {c.unitPrice.toLocaleString()}
                            </div>
                          </button>
                        ))}
                        {(filteredConsumables[item.key] || []).length === 0 && (
                          <div className="px-3 py-4 text-sm text-text-muted text-center">
                            未找到匹配耗材
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="w-28">
                    <label className="block text-xs text-text-muted mb-1">
                      数量
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.requestedQty}
                      onChange={(e) =>
                        updateItem(
                          item.key,
                          "requestedQty",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <button
                    onClick={() => removeItemRow(item.key)}
                    className="mt-5 p-2 text-text-muted hover:text-danger transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-50"
          >
            {submitting ? "提交中..." : "提交领用单"}
          </button>
          <button
            onClick={() => router.push("/requisition")}
            className="px-6 py-2.5 border border-border text-text-secondary rounded-lg text-sm font-medium hover:bg-bg transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
