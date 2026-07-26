"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  Database,
  Shield,
  Activity,
  Zap,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Case Queue", icon: LayoutDashboard, description: "Active investigations" },
  { href: "/cases/new", label: "New Case", icon: FilePlus, description: "Start investigation" },
  { href: "/sources", label: "Evidence Sources", icon: Database, description: "Data connectors" },
];

const systemServices = [
  { name: "MCA Registry", status: "online" as const },
  { name: "Address GIS", status: "online" as const },
  { name: "Web OSINT", status: "online" as const },
  { name: "Doc OCR", status: "online" as const },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 w-[272px] h-full bg-paper/80 backdrop-blur-xl border-r border-border/50 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-verified/20 to-accent/20 border border-verified/20 flex items-center justify-center relative overflow-hidden">
            <Shield className="w-5 h-5 text-verified relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-verified/10 to-transparent" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-bold text-text text-lg tracking-tight">
                GeoTrust
              </span>
              <span className="text-gradient font-display font-bold text-lg">AI</span>
            </div>
            <p className="text-text-muted text-[11px] font-medium tracking-wide uppercase">
              Authenticity Console
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-5 px-4 space-y-1">
        <p className="text-text-muted text-[10px] font-semibold uppercase tracking-[0.1em] px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative",
                active
                  ? "bg-gradient-to-r from-verified/15 to-verified/5 text-verified shadow-sm"
                  : "text-text-muted hover:text-text hover:bg-paper-hover/60"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-verified rounded-r-full" />
              )}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                active
                  ? "bg-verified/15"
                  : "bg-transparent group-hover:bg-paper-raised"
              )}>
                <Icon className={cn("w-4 h-4", active ? "text-verified" : "text-text-muted group-hover:text-text")} />
              </div>
              <div>
                <span className={cn("font-medium block text-[13px] leading-tight", active && "text-verified")}>{item.label}</span>
                <span className="text-[10px] text-text-muted block mt-0.5">{item.description}</span>
              </div>
            </Link>
          );
        })}

        {/* System Status */}
        <div className="mt-8">
          <p className="text-text-muted text-[10px] font-semibold uppercase tracking-[0.1em] px-3 mb-3">
            System Health
          </p>
          <div className="glass-card-sm p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-verified animate-pulse" />
              <span className="text-verified text-xs font-medium">All Systems Operational</span>
            </div>
            <div className="space-y-2">
              {systemServices.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">{s.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-verified" />
                    <span className="text-[10px] text-verified font-mono font-medium">OK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-4 glass-card-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs text-text-secondary font-medium">Quick Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-lg font-display font-bold text-text">5</div>
              <div className="text-[10px] text-text-muted">Active Cases</div>
            </div>
            <div>
              <div className="text-lg font-display font-bold text-verified">88%</div>
              <div className="text-[10px] text-text-muted">Avg Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-accent" />
          <span className="text-text-muted text-[11px] font-medium">
            v1.0 · <span className="text-accent">NitroStack</span>
          </span>
        </div>
      </div>
    </nav>
  );
}
