"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import type { Department } from "@/lib/types";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", code: "", type: "clinical" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/master/departments")
      .then((r) => r.json())
      .then(setDepartments)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/master/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newItem: Department = await res.json();
        setDepartments((prev) => [...prev, newItem]);
        resetForm();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", code: "", type: "clinical" });
  };

  const startEdit = (dept: Department) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code, type: dept.type });
    setShowForm(true);
  };

  const columns: Column<Department>[] = [
    { key: "name", header: "科室名称" },
    { key: "code", header: "编码" },
    {
      key: "type",
      header: "类型",
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          row.type === "clinical" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
        }`}>
          {row.type === "clinical" ? "临床" : "库房"}
        </span>
      ),
    },
    { key: "createdAt", header: "创建日期" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-border/50 rounded w-48 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-border/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="科室管理"
        description="管理医院各科室基础信息"
        actions={
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-light transition-colors"
          >
            <Plus size={16} />
            新增科室
          </button>
        }
      />

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">
              {editing ? "编辑科室" : "新增科室"}
            </h3>
            <button onClick={resetForm} className="p-1 rounded hover:bg-bg transition-colors text-text-muted">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">科室名称</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                placeholder="请输入科室名称"
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
                placeholder="请输入科室编码"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              >
                <option value="clinical">临床</option>
                <option value="warehouse">库房</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3">
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
        data={departments}
        actions={(row) => {
          const dept = row as typeof departments[number];
          return (
            <button
              onClick={() => startEdit(dept)}
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
