"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TraceEvent } from "@/shared-types";
import { formatTimestamp } from "@/lib/utils";

const AGENT_CONFIG = {
  orchestrator:         { label: "Orchestrator",         color: "var(--verified)",       cls: "orchestrator" },
  document_reader:      { label: "Document Reader",      color: "var(--caution)",         cls: "document_reader" },
  registry_checker:     { label: "Registry Checker",     color: "var(--accent)",          cls: "registry_checker" },
  address_checker:      { label: "Address Checker",      color: "#7B8AE0",                cls: "address_checker" },
  web_presence_checker: { label: "Web Presence Checker", color: "#D69A4E",                cls: "web_presence_checker" },
  evidence_challenger:  { label: "Evidence Challenger",  color: "var(--caution)",         cls: "evidence_challenger" },
  risk_arbiter:         { label: "Risk Arbiter",         color: "var(--contradiction)",   cls: "risk_arbiter" },
};

interface Props {
  events: TraceEvent[];
  isLive: boolean;
}

export function InvestigationTrace({ events, isLive }: Props) {
  const [visible, setVisible] = useState<TraceEvent[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLive) {
      // Show all events for completed cases
      setVisible(events);
      return;
    }

    // Animate streaming for live investigations
    setVisible([]);
    let i = 0;
    const interval = setInterval(() => {
      if (i < events.length) {
        setVisible(prev => [...prev, events[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [events, isLive]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visible]);

  if (events.length === 0) {
    return (
      <div className="text-xs font-mono text-text-muted italic">
        Investigation not started
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
      <AnimatePresence>
        {visible.filter(e => e && e.agent).map((event, i) => {
          const cfg = AGENT_CONFIG[event.agent] ?? AGENT_CONFIG.orchestrator;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`trace-line ${cfg.cls} pl-3 py-1.5`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-mono font-semibold" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
              <p className="text-xs font-body text-text-muted leading-relaxed">{event.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Live cursor */}
      {isLive && visible.length < events.length && (
        <div className="pl-3 py-1 trace-line orchestrator">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-3 bg-verified animate-pulse rounded-sm" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
