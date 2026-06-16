"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil, Search } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import type { Consumable, Supplier } from "@/lib/types";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 0 }).format(v);

export default function ConsumablesPage() {
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Consumable | null>(null);
  const [searchName, setSearchName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    specification: "",
    model: "",
    category: "",
    unit: "个",
    unitPrice: 0,
    isImplant: false,
    supplierId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/master/consumables").then((r) => r.json()),
      fetch("/api/master/suppliers").then((r) => r.json()),
    ])
      .then(([consumableData, supplierData]) => {
        setConsumables(consumableData);
        setSuppliers(supplierData);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(consumables.map((c) => c.category)));

  const filtered = consumables.filter((c) => {
    const matchName = !searchName || c.name.includes(searchName);
    const matchCategory = !filterCategory || c.category === filterCategory;
    return matchName && matchCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supplier = suppliers.find((s) => s.id === form.supplierId);
      const payload = {
        ...form,
        supplierName: supplier?.name,
      };
      const res = await fetch("/api/master/consumables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newItem: Consumable = await res.json();
        setConsumables((prev) => [...prev, newItem]);
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      name: "",
      specification: "",
      model: "",
      category: "",
      unit: "个",
      unitPrice: 0,
      isImplant: false,
      supplierId: "",
    });
  };

  const startEdit = (item: Consumable) => {
    setEditing(item);
    setForm({
      name: item.name,
      specification: item.specification,
      model: item.model,
      category: item.category,
      unit: item.unit,
      unitPrice: item.unitPrice,
      isImplant: item.isImplant,
      supplierId: item.supplierId,
    });
    setShowForm(true);
  };

  const columns: Column<Consumable>[] = [
    { key: "name", header: "耗材名称" },
    { key: "specification", header: "规格" },
    { key: "model", header: "型号" },
    {
      key: "category",
      header: "类别",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
          {row.category}
        </span>
      ),
    },
    {
      key: "unitPrice",
      header: "单价",
      render: (row) => (
        <span className="font-medium text-text">{formatCurrency(row.unitPrice)}</span>
      ),
    },
    {
      key: "isImplant",
      header: "植入标记",
      render: (row) =>
        row.isImplant ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-danger/10 text-danger">
            植入
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-text-muted/10 text-text-muted">
            非植入
          </span>
        ),
    },
    { key: "supplierName", header: "供应商", render: (row) => row.supplierName || "-" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border/50 rounded w-48 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-border/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="耗材目录"
        description="管理高值耗材基础信息与分类"
        actions={
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-light transition-colors"
          >
            <Plus size={16} />
            新增耗材
          </button>
        }
      />

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">
              {editing ? "编辑耗材" : "新增耗材"}
            </h3>
            <button onClick={resetForm} className="p-1 rounded hover:bg-bg transition-colors text-text-muted">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">耗材名称</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="请输入耗材名称"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">规格</label>
              <input
                type="text"
                required
                value={form.specification}
                onChange={(e) => setForm((f) => ({ ...f, specification: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="请输入规格"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">型号</label>
              <input
                type="text"
                required
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="请输入型号"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">类别</label>
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="如：心血管介入、骨科植入"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">单位</label>
              <input
                type="text"
                required
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="个/套/根"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">单价 (元)</label>
              <input
                type="number"
                required
                min={0}
                value={form.unitPrice || ""}
                onChange={(e) => setForm((f) => ({ ...f, unitPrice: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="请输入单价"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">供应商</label>
              <select
                required
                value={form.supplierId}
                onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              >
                <option value="">请选择供应商</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">植入标记</label>
              <label className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  checked={form.isImplant}
                  onChange={(e) => setForm((f) => ({ ...f, isImplant: e.target.checked }))}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
                />
                <span className="text-sm text-text">植入性耗材</span>
              </label>
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-bg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-light transition-colors disabled:opacity-50"
              >
                {submitting ? "提交中..." : "确认"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-card text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            placeholder="搜索耗材名称..."
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-card text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        >
          <option value="">全部类别</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        actions={(row) => {
          const item = row as typeof filtered[number];
          return (
            <button
              onClick={() => startEdit(item)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
            >
              <Pencil size={12} />
              编辑
            </button>
          );
        }}
        emptyText="暂无耗材数据"
      />
    </div>
  );
}
