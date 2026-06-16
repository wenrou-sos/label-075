"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface NearExpiryItem {
  id: string;
  consumableId: string;
  consumableName?: string;
  specification?: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  location: string;
  daysLeft: number;
  warningLevel: "critical" | "warning" | "notice";
}

interface NearExpiryResponse {
  total: number;
  criticalCount: number;
  warningCount: number;
  noticeCount: number;
  items: NearExpiryItem[];
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NearExpiryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNearExpiry();
    const interval = setInterval(fetchNearExpiry, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNearExpiry = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory/near-expiry");
      const json: NearExpiryResponse = await res.json();
      setData(json);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const totalCount = data?.total ?? 0;

  const warningColorMap = {
    critical: "bg-danger",
    warning: "bg-warning",
    notice: "bg-text-secondary",
  };

  const warningTextColorMap = {
    critical: "text-danger",
    warning: "text-warning",
    notice: "text-text-secondary",
  };

  const warningLabelMap = {
    critical: "紧急",
    warning: "预警",
    notice: "提醒",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && !data) fetchNearExpiry();
        }}
        className="relative p-2 rounded-lg hover:bg-border/50 transition-colors text-text-secondary hover:text-text"
        title="近效期预警"
      >
        <Bell size={18} />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-danger rounded-full leading-none">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text">近效期预警</span>
              {data && (
                <span className="text-xs text-text-muted">
                  共 {data.total} 项
                </span>
              )}
            </div>
            {data && (
              <div className="flex items-center gap-2">
                {data.criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-danger">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                    紧急 {data.criticalCount}
                  </span>
                )}
                {data.warningCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-warning">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    预警 {data.warningCount}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && !data ? (
              <div className="flex items-center justify-center py-8 text-text-muted text-sm">
                加载中...
              </div>
            ) : data && data.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-muted text-sm">
                <Bell size={24} className="mb-2 opacity-30" />
                暂无近效期预警
              </div>
            ) : (
              data?.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/master/consumables/${item.consumableId}`);
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg transition-colors border-b border-border/50 last:border-b-0"
                >
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      warningColorMap[item.warningLevel]
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text truncate">
                        {item.consumableName}
                      </span>
                      <span
                        className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          item.warningLevel === "critical"
                            ? "bg-danger/10 text-danger"
                            : item.warningLevel === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-text-secondary/10 text-text-secondary"
                        }`}
                      >
                        {warningLabelMap[item.warningLevel]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span>{item.specification}</span>
                      <span>批号 {item.batchNo}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-text-secondary">
                        效期 {item.expiryDate}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          warningTextColorMap[item.warningLevel]
                        }`}
                      >
                        剩余 {item.daysLeft} 天
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
