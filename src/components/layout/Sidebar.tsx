"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  ShoppingCart,
  ClipboardCheck,
  PackageOpen,
  Syringe,
  Receipt,
  Database,
  ChevronDown,
  ChevronLeft,
  Building2,
  Truck,
  Box,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  { label: "首页", href: "/", icon: <Home size={20} /> },
  { label: "申购管理", href: "/purchase", icon: <ShoppingCart size={20} /> },
  { label: "入库验收", href: "/acceptance", icon: <ClipboardCheck size={20} /> },
  { label: "领用管理", href: "/requisition", icon: <PackageOpen size={20} /> },
  { label: "使用管理", href: "/usage", icon: <Syringe size={20} /> },
  { label: "结算管理", href: "/settlement", icon: <Receipt size={20} /> },
  {
    label: "基础数据",
    href: "/master",
    icon: <Database size={20} />,
    children: [
      { label: "科室", href: "/master/departments", icon: <Building2 size={16} /> },
      { label: "供应商", href: "/master/suppliers", icon: <Truck size={16} /> },
      { label: "耗材目录", href: "/master/consumables", icon: <Box size={16} /> },
    ],
  },
];

interface SidebarProps {
  sidebarCollapsed: boolean;
  onToggleCollapse?: () => void;
  activePath?: string;
}

export default function Sidebar({ sidebarCollapsed, onToggleCollapse, activePath = "/" }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === "/") return activePath === "/";
    return activePath.startsWith(href);
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-primary text-white transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between h-14 px-4 border-b border-white/10">
        {!sidebarCollapsed && (
          <h1 className="text-lg font-bold tracking-wide truncate">高值耗材管理</h1>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const expanded = expandedMenus[item.label];

          if (hasChildren) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (!sidebarCollapsed) toggleMenu(item.label);
                  }}
                  className={`flex items-center w-full gap-3 px-4 py-2.5 text-sm transition-colors relative ${
                    active
                      ? "bg-white/10 text-accent"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r" />
                  )}
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>
                {!sidebarCollapsed && expanded && (
                  <div className="bg-primary-dark/50">
                    {item.children!.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-3 pl-11 pr-4 py-2 text-sm transition-colors relative ${
                            childActive
                              ? "text-accent bg-white/5"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {childActive && (
                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r" />
                          )}
                          <span className="shrink-0">{child.icon}</span>
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative ${
                active
                  ? "bg-white/10 text-accent"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {active && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r" />
              )}
              <span className="shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-t border-white/10 text-xs text-white/40">
          HCMS v0.1.0
        </div>
      )}
    </aside>
  );
}
