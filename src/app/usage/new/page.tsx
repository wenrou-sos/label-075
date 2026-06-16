"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Search, ChevronDown, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import type { Department, Consumable } from "@/lib/types";

interface ItemRow {
  key: string;
  consumableId: string;
  inventoryId: string;
  usedQty: number;
  isImplant: boolean;
  patientId: string;
}

export default function NewUsagePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [operatingRoom, setOperatingRoom] = useState("");
  const [usedAt, setUsedAt] = useState("");
  const [initialInventoryId] = useState(() => `inv-${Math.random().toString(36).slice(2, 9)}`);
  const [items, setItems] = useState<ItemRow[]>([
    { key: crypto.randomUUID(), consumableId: "", inventoryId: initialInventoryId, usedQty: 1, isImplant: false, patientId: "" },
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
      { key: crypto.randomUUID(), consumableId: "", inventoryId: `inv-${Math.random().toString(36).slice(2, 9)}`, usedQty: 1, isImplant: false, patientId: "" },
    ]);
  };

  const removeItemRow = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, field: keyof ItemRow, value: string | number | boolean) => {
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
      setError("请选择使用科室");
      return;
    }
    if (!operatingRoom.trim()) {
      setError("请填写手术室");
      return;
    }
    if (!usedAt) {
      setError("请选择使用时间");
      return;
    }

    const validItems = items.filter((i) => i.consumableId && i.usedQty > 0);
    if (validItems.length === 0) {
      setError("请至少添加一项耗材并填写数量");
      return;
    }

    const implantErrors = validItems.filter(
      (i) => i.isImplant && !i.patientId.trim()
    );
    if (implantErrors.length > 0) {
      setError(
        "植入类耗材必须关联患者ID，请检查标红的植入项"
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId,
          operatingRoom: operatingRoom.trim(),
          usedAt,
          items: validItems.map((i) => ({
            consumableId: i.consumableId,
            inventoryId: i.inventoryId,
            usedQty: i.usedQty,
            isImplant: i.isImplant,
            patientId: i.isImplant ? i.patientId.trim() : null,
          })),
        }),
      });
      if (res.ok) {
        router.push("/usage");
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
        title="新建使用记录"
        description="记录手术耗材使用情况，植入物须关联患者"
      />

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 text-danger text-sm rounded-lg border border-danger/20">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              使用科室
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            <label className="block text-sm font-medium text-text mb-1.5">
              手术室
            </label>
            <input
              type="text"
              value={operatingRoom}
              onChange={(e) => setOperatingRoom(e.target.value)}
              placeholder="如 OR-1"
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              使用时间
            </label>
            <input
              type="datetime-local"
              value={usedAt}
              onChange={(e) => setUsedAt(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text">使用物品</h3>
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
              const needsPatient = item.isImplant && !item.patientId.trim();
              return (
                <div
                  key={item.key}
                  className={`p-3 bg-bg rounded-lg border ${
                    needsPatient ? "border-danger/50" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
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
                                updateItem(item.key, "isImplant", c.isImplant);
                                if (!c.isImplant) {
                                  updateItem(item.key, "patientId", "");
                                }
                                setOpenDropdown(null);
                                setSearchTerms((prev) => {
                                  const next = { ...prev };
                                  delete next[item.key];
                                  return next;
                                });
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent/5 transition-colors"
                            >
                              <div className="flex items-center gap-2 text-text">
                                {c.name}
                                {c.isImplant && (
                                  <span className="text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                                    植入
                                  </span>
                                )}
                              </div>
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

                    <div className="w-24">
                      <label className="block text-xs text-text-muted mb-1">
                        使用数量
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={item.usedQty}
                        onChange={(e) =>
                          updateItem(item.key, "usedQty", parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div className="w-24 flex flex-col items-center">
                      <label className="block text-xs text-text-muted mb-1">
                        植入标记
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={item.isImplant}
                          onChange={(e) => {
                            updateItem(item.key, "isImplant", e.target.checked);
                            if (!e.target.checked) {
                              updateItem(item.key, "patientId", "");
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-warning transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                      </label>
                    </div>

                    <button
                      onClick={() => removeItemRow(item.key)}
                      className="mt-5 p-2 text-text-muted hover:text-danger transition-colors"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {item.isImplant && (
                    <div className="mt-3 ml-0">
                      <label className="block text-xs font-medium text-text mb-1">
                        <span className="text-danger mr-0.5">*</span>
                        患者ID
                        <span className="text-text-muted font-normal ml-1">
                          （植入类耗材必填）
                        </span>
                      </label>
                      <input
                        type="text"
                        value={item.patientId}
                        onChange={(e) =>
                          updateItem(item.key, "patientId", e.target.value)
                        }
                        placeholder="请输入患者ID"
                        className={`w-full max-w-xs px-3 py-2 bg-card border rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                          needsPatient
                            ? "border-danger focus:ring-danger/20 focus:border-danger"
                            : "border-border focus:ring-primary/20 focus:border-primary"
                        }`}
                      />
                      {needsPatient && (
                        <p className="mt-1 text-xs text-danger flex items-center gap-1">
                          <AlertTriangle size={12} />
                          植入类耗材必须关联患者ID
                        </p>
                      )}
                    </div>
                  )}
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
            {submitting ? "提交中..." : "提交使用记录"}
          </button>
          <button
            onClick={() => router.push("/usage")}
            className="px-6 py-2.5 border border-border text-text-secondary rounded-lg text-sm font-medium hover:bg-bg transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
