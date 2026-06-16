"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import type { Supplier } from "@/lib/types";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    contact: "",
    phone: "",
    isConsignment: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/master/suppliers")
      .then((r) => r.json())
      .then(setSuppliers)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/master/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newItem: Supplier = await res.json();
        setSuppliers((prev) => [...prev, newItem]);
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", code: "", contact: "", phone: "", isConsignment: false });
  };

  const startEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      code: supplier.code,
      contact: supplier.contact,
      phone: supplier.phone,
      isConsignment: supplier.isConsignment,
    });
    setShowForm(true);
  };

  const columns: Column<Supplier>[] = [
    { key: "name", header: "供应商名称" },
    { key: "code", header: "编码" },
    { key: "contact", header: "联系人" },
    { key: "phone", header: "电话" },
    {
      key: "isConsignment",
      header: "寄售标记",
      render: (row) =>
        row.isConsignment ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
            寄售
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-text-muted/10 text-text-muted">
            普通
          </span>
        ),
    },
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
        title="供应商管理"
        description="管理供应商基础信息与寄售标识"
        actions={
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-light transition-colors"
          >
            <Plus size={16} />
            新增供应商
          </button>
        }
      />

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">
              {editing ? "编辑供应商" : "新增供应商"}
            </h3>
            <button onClick={resetForm} className="p-1 rounded hover:bg-bg transition-colors text-text-muted">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">供应商名称</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="请输入供应商名称"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">编码</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="请输入供应商编码"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">联系人</label>
              <input
                type="text"
                required
                value={form.contact}
                onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="请输入联系人"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">电话</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="请输入联系电话"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">寄售模式</label>
              <label className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  checked={form.isConsignment}
                  onChange={(e) => setForm((f) => ({ ...f, isConsignment: e.target.checked }))}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
                />
                <span className="text-sm text-text">寄售供应商</span>
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

      <DataTable
        columns={columns}
        data={suppliers}
        actions={(row) => {
          const supplier = row as typeof suppliers[number];
          return (
            <button
              onClick={() => startEdit(supplier)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
            >
              <Pencil size={12} />
              编辑
            </button>
          );
        }}
      />
    </div>
  );
}
