"use client";

import { Database, Shield, Activity, RefreshCw } from "lucide-react";

export default function SourcesPage() {
  const sources = [
    { name: "MCA Registry", type: "Government Database", status: "Connected", health: "OK" },
    { name: "GST Portal", type: "Tax Database", status: "Connected", health: "OK" },
    { name: "Udyam Registry", type: "MSME Database", status: "Connected", health: "OK" },
    { name: "Google Maps API", type: "GIS Data", status: "Connected", health: "OK" },
  ];

  return (
    <div className="min-h-screen">
      <div className="px-8 py-8">
        <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <Database className="w-6 h-6 text-accent" />
          Evidence Sources
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map(s => (
            <div key={s.name} className="glass-card p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  <p className="text-sm text-text-muted">{s.type}</p>
                </div>
                <span className="px-2 py-1 rounded bg-verified/10 text-verified text-xs font-mono">
                  {s.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-text-muted">
                  <Activity className="w-4 h-4" /> Health: {s.health}
                </span>
                <span className="flex items-center gap-1 text-text-muted cursor-pointer hover:text-accent">
                  <RefreshCw className="w-4 h-4" /> Sync Now
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
