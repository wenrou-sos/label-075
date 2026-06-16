"use client";

type StatusVariant =
  | "pending"
  | "approved"
  | "rejected"
  | "fulfilled"
  | "partial"
  | "cancelled"
  | "confirmed"
  | "delivered"
  | "completed"
  | "ordered"
  | "draft"
  | "paid";

const variantConfig: Record<StatusVariant, { label: string; bg: string; text: string }> = {
  pending: { label: "待审批", bg: "bg-warning/10", text: "text-warning" },
  approved: { label: "已审批", bg: "bg-accent/10", text: "text-accent" },
  rejected: { label: "已驳回", bg: "bg-danger/10", text: "text-danger" },
  fulfilled: { label: "已完成", bg: "bg-accent/10", text: "text-accent" },
  partial: { label: "部分完成", bg: "bg-orange-500/10", text: "text-orange-600" },
  cancelled: { label: "已取消", bg: "bg-text-muted/10", text: "text-text-muted" },
  confirmed: { label: "已确认", bg: "bg-accent/10", text: "text-accent" },
  delivered: { label: "已发货", bg: "bg-primary/10", text: "text-primary" },
  completed: { label: "已完成", bg: "bg-accent/10", text: "text-accent" },
  ordered: { label: "已下单", bg: "bg-primary/10", text: "text-primary" },
  draft: { label: "草稿", bg: "bg-text-muted/10", text: "text-text-muted" },
  paid: { label: "已支付", bg: "bg-accent/10", text: "text-accent" },
};

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

export default function StatusBadge({ variant, label, className = "" }: StatusBadgeProps) {
  const config = variantConfig[variant];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {label || config.label}
    </span>
  );
}
