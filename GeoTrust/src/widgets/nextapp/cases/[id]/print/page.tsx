import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, dimensionLabel, scoreColor, recommendationConfig } from "@/lib/utils";
import { AutoPrint } from "./AutoPrint";

interface Props { params: Promise<{ id: string }>; }

export default async function PrintPage({ params }: Props) {
  const { id } = await params;
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      claims: { include: { evidence: true } },
      dimensionScores: true,
      missingEvidence: true
    }
  });
  if (!c) notFound();
  const rec = recommendationConfig((c.recommendation || "needs_review") as any);

  return (
    <div className="print-section p-8 bg-white text-black font-body max-w-4xl mx-auto">
      <style>{`@media print { body { background: white; color: black; } }`}</style>

      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl">GeoTrust AI</h1>
            <p className="text-gray-600 text-sm">Business Authenticity Investigation Report</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-mono">Case ID: {c.id}</p>
            <p className="text-xs text-gray-500 font-mono">Generated: {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>

      {/* Business */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl mb-1">{c.businessName}</h2>
        <p className="text-gray-500 text-sm font-mono">Submitted: {formatDate(c.submittedAt.toISOString())}</p>
      </div>

      {/* Recommendation stamp */}
      <div className="mb-6 p-4 border-2 border-black rounded-lg inline-block transform -rotate-1">
        <div className="font-display font-black text-lg tracking-widest uppercase">{rec.label}</div>
        <p className="text-sm text-gray-700 mt-1">{c.recommendationReason ?? 'Investigation complete.'}</p>
      </div>

      {/* Scores */}
      <div className="mb-6">
        <h3 className="font-display font-bold text-base mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
          Confidence Scores
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center gap-3 p-3 border border-gray-200 rounded">
            <div>
              <div className="text-xs text-gray-500 font-mono">Overall Business Authenticity</div>
              <div className="font-display font-black text-3xl">{c.overallScore ?? 'N/A'}<span className="text-base font-normal text-gray-400">/100</span></div>
            </div>
          </div>
          {c.dimensionScores.map(ds => (
            <div key={ds.dimension} className="p-3 border border-gray-200 rounded">
              <div className="text-xs text-gray-500 font-mono mb-1">{dimensionLabel(ds.dimension)}</div>
              <div className="font-display font-bold text-xl">{ds.score}<span className="text-sm text-gray-400">/100</span></div>
              <p className="text-xs text-gray-600 mt-1">{ds.driver}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Claims */}
      <div className="mb-6">
        <h3 className="font-display font-bold text-base mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
          Claims & Evidence
        </h3>
        <div className="space-y-4">
          {c.claims.map(claim => (
            <div key={claim.id} className="p-3 border border-gray-200 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display font-semibold text-sm">{claim.label}:</span>
                <span className="font-mono text-sm">{claim.value}</span>
                <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded ${
                  claim.status === "verified" ? "bg-green-100 text-green-700" :
                  claim.status === "contradicted" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                }`}>{claim.status}</span>
              </div>
              {claim.evidence.map(ev => (
                <div key={ev.id} className="ml-4 mt-1 text-xs text-gray-600">
                  <span className="font-mono text-gray-400">[{ev.relation}]</span>{" "}
                  <span className="font-semibold">{ev.source}:</span> {ev.snippet}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Missing evidence */}
      {c.missingEvidence.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display font-bold text-base mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Missing Evidence
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {c.missingEvidence.map((item, i) => (
              <li key={item.id ?? i} className="text-sm text-gray-700">{item.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-300 pt-4 mt-8 text-xs text-gray-400 font-mono">
        This report was generated by GeoTrust AI. All evidence is sourced from verified datasets.
        This report is for internal compliance use only.
      </div>
      <AutoPrint />
    </div>
  );
}
