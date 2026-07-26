import { CheckCircle, Clock, Database, Globe, FileText, MapPin, Activity, Zap, Info, ShieldCheck } from "lucide-react";

const SOURCES = [
  {
    id: "doc-ocr",
    name: "Document Extraction (OCR)",
    description: "Extracts claims from uploaded registration certificates, ID documents, and utility bills",
    icon: FileText,
    lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "healthy" as const,
    latencyMs: 340,
    successRate: 97,
    color: "#FBBF24", // caution yellow
  },
  {
    id: "registry",
    name: "Business Registry Lookup",
    description: "Checks registration status, active status, director info, and filing recency against state registries",
    icon: Database,
    lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: "healthy" as const,
    latencyMs: 210,
    successRate: 99,
    color: "#818CF8", // accent blue
  },
  {
    id: "address",
    name: "Address Verification (GIS)",
    description: "Verifies claimed addresses against GIS data, identifies commercial vs residential zones, cross-checks utility bills",
    icon: MapPin,
    lastRun: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: "healthy" as const,
    latencyMs: 490,
    successRate: 94,
    color: "#34D399", // verified green
  },
  {
    id: "web",
    name: "Digital Footprint Analysis",
    description: "Checks domain registration age vs incorporation year, Google Business listings, social media, reviews",
    icon: Globe,
    lastRun: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    status: "healthy" as const,
    latencyMs: 450,
    successRate: 98,
    color: "#A78BFA", // purple
  },
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  return `${Math.round(diff / 60)}m ago`;
}

export default function SourcesPage() {
  const healthyCount = SOURCES.filter(s => s.status === "healthy").length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 z-0 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-border/30 bg-paper/60 backdrop-blur-md px-8 py-8 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-verified to-transparent" />
        
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-verified/20 border border-border-light flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-verified" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display font-bold text-3xl text-text tracking-tight">Evidence Sources</h1>
                <div className="px-3 py-1 bg-verified/10 border border-verified/30 rounded-full text-verified text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
                  <div className="w-2 h-2 rounded-full bg-verified animate-pulse" />
                  {healthyCount}/{SOURCES.length} Operational
                </div>
              </div>
              <p className="text-text-muted text-sm mt-1">
                Real-time health monitoring of AI investigation data connectors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-8 py-10 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {SOURCES.map((source, i) => {
            const Icon = source.icon;
            const isHealthy = source.status === "healthy";
            return (
              <div
                key={source.id}
                className={`group relative glass-card p-6 transition-all duration-500 animate-fade-in-up hover:-translate-y-1 hover:shadow-2xl overflow-hidden`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Hover gradient glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" 
                  style={{ background: `radial-gradient(circle at 100% 0%, ${source.color}, transparent 60%)` }} 
                />
                
                {/* Active edge highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-80" style={{ background: source.color }} />

                <div className="flex items-start gap-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: source.color + "1A", boxShadow: `0 0 20px ${source.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: source.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h2 className="font-display font-bold text-text text-lg tracking-tight group-hover:text-white transition-colors">{source.name}</h2>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          isHealthy
                            ? "bg-verified/10 text-verified border border-verified/20"
                            : "bg-caution/10 text-caution border border-caution/20"
                        }`}>
                          {isHealthy
                            ? <><CheckCircle className="w-3.5 h-3.5" />Operational</>
                            : <><Clock className="w-3.5 h-3.5" />Degraded</>
                          }
                        </div>
                      </div>
                      
                      {/* Interactive pill */}
                      <div className="text-[10px] font-mono font-medium text-text-muted bg-ink/50 px-3 py-1 rounded-full border border-border/50">
                        ID: {source.id}
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-2xl">{source.description}</p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Metric 1 */}
                      <div className="bg-paper-raised/50 backdrop-blur-sm rounded-xl p-4 border border-border/40 group-hover:border-border-light transition-colors">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                          <Clock className="w-3.5 h-3.5 opacity-70" /> Last Run
                        </div>
                        <div className="text-base font-mono text-text">{timeAgo(source.lastRun)}</div>
                      </div>
                      
                      {/* Metric 2 */}
                      <div className="bg-paper-raised/50 backdrop-blur-sm rounded-xl p-4 border border-border/40 group-hover:border-border-light transition-colors">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                          <Activity className="w-3.5 h-3.5 opacity-70" /> Latency
                        </div>
                        <div className={`text-base font-mono ${source.latencyMs > 1000 ? "text-caution" : "text-verified"}`}>
                          {source.latencyMs}ms
                        </div>
                      </div>
                      
                      {/* Metric 3 */}
                      <div className="bg-paper-raised/50 backdrop-blur-sm rounded-xl p-4 border border-border/40 group-hover:border-border-light transition-colors">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                          <CheckCircle className="w-3.5 h-3.5 opacity-70" /> Reliability
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`text-base font-mono font-semibold ${source.successRate < 90 ? "text-caution" : "text-verified"}`}>
                            {source.successRate}%
                          </div>
                          {/* Animated progress bar */}
                          <div className="flex-1 h-2 bg-ink/80 rounded-full overflow-hidden border border-border/30">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${source.successRate}%`,
                                background: source.successRate < 90 ? "var(--caution)" : source.color,
                                boxShadow: `0 0 10px ${source.color}80`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Architecture Note */}
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/5 p-6 shadow-[0_0_30px_rgba(129,140,248,0.05)]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Database className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 border border-accent/30 shadow-[0_0_15px_rgba(129,140,248,0.2)]">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-text font-display font-semibold text-sm mb-1.5">Distributed Trust Network</h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                The GeoTrust Kitchen automatically routes validation checks to healthy evidence sources. If a source experiences latency or degradation, the AI Risk Arbiter adjusts confidence weights to ensure investigations remain deterministic and reliable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
