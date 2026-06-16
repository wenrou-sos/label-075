"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User } from "lucide-react";

const departments = ["心内科", "骨科", "眼科", "神经外科", "普外科", "泌尿外科", "妇产科", "ICU"];

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  currentDepartment?: string;
  onDepartmentChange?: (dept: string) => void;
  userName?: string;
}

export default function Header({
  breadcrumbs = [],
  currentDepartment = "心内科",
  onDepartmentChange,
  userName = "管理员",
}: HeaderProps) {
  const [deptOpen, setDeptOpen] = useState(false);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setDeptOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-card border-b border-border">
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-text-muted">/</span>}
            {crumb.href ? (
              <a
                href={crumb.href}
                className="text-text-secondary hover:text-primary transition-colors"
              >
                {crumb.label}
              </a>
            ) : (
              <span className="text-text font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div ref={deptRef} className="relative">
          <button
            onClick={() => setDeptOpen(!deptOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-border bg-bg hover:bg-border/50 transition-colors"
          >
            <span className="text-text-secondary">{currentDepartment}</span>
            <ChevronDown
              size={14}
              className={`text-text-muted transition-transform duration-200 ${deptOpen ? "rotate-180" : ""}`}
            />
          </button>
          {deptOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-card rounded-md shadow-lg border border-border z-50 py-1">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => {
                    onDepartmentChange?.(dept);
                    setDeptOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                    dept === currentDepartment
                      ? "text-accent bg-accent/5"
                      : "text-text-secondary hover:bg-bg"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm text-text-secondary">{userName}</span>
        </div>
      </div>
    </header>
  );
}
