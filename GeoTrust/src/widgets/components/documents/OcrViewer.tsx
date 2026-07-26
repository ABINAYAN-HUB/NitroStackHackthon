"use client";

import type { Case } from "@/shared-types";
import { FileText, Maximize2, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper component for the OCR bounding box
function BoundingBox({ children, confidence = 98, extractedText, isContradicted = false }: { children: React.ReactNode, confidence?: number, extractedText: string, isContradicted?: boolean }) {
  return (
    <div className="relative group inline-block w-full">
      {/* The glowing box */}
      <div className={cn(
        "absolute -inset-1 rounded border-2 z-10 pointer-events-none transition-colors",
        isContradicted ? "border-contradiction bg-contradiction/10 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : "border-yellow-400 bg-yellow-400/10 shadow-[0_0_10px_rgba(250,204,21,0.3)]"
      )} />
      
      {/* The actual text */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Tooltip */}
      <div className="absolute left-1/2 -top-12 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
        <div className="bg-ink border border-border/50 shadow-2xl rounded-lg p-2 text-xs w-48 text-center">
          <div className="flex items-center justify-center gap-1.5 text-text-muted mb-1 text-[10px] uppercase font-mono tracking-wider">
            <ScanLine className="w-3 h-3" />
            AI Extraction
          </div>
          <div className="font-semibold text-text truncate">"{extractedText}"</div>
          <div className="text-[10px] text-accent mt-0.5">Confidence: {confidence}%</div>
        </div>
        {/* Tooltip caret */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-ink border-b border-r border-border/50 rotate-45" />
      </div>
    </div>
  );
}

export function OcrViewer({ caseData }: { caseData: Case }) {
  const addressClaim = caseData.claims.find(c => c.label.toLowerCase().includes("address"));
  const regClaim = caseData.claims.find(c => c.label.toLowerCase().includes("registration"));
  
  const isAddressContradicted = addressClaim?.status === "contradicted";
  const isRegContradicted = regClaim?.status === "contradicted";

  return (
    <div className="w-full h-full bg-[#0B0E14] overflow-y-auto p-8 flex justify-center items-start">
      
      {/* Document Container */}
      <div className="relative w-full max-w-2xl bg-white text-slate-800 shadow-2xl rounded-sm min-h-[800px] p-12 overflow-hidden shrink-0">
        
        {/* Fake watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <div className="w-96 h-96 rounded-full border-[20px] border-slate-900 flex items-center justify-center">
            <span className="text-8xl font-serif font-bold text-slate-900">GOVT</span>
          </div>
        </div>

        {/* Header */}
        <div className="border-b-2 border-slate-300 pb-6 mb-8 text-center relative z-10">
          <h1 className="text-3xl font-serif font-bold text-slate-900 uppercase tracking-widest mb-2">
            Government of India
          </h1>
          <h2 className="text-xl font-serif text-slate-600">
            Form GST REG-06
          </h2>
          <p className="text-sm font-sans text-slate-500 mt-2">
            [See Rule 10(1)]
          </p>
          <h3 className="text-2xl font-bold font-sans mt-4 text-slate-800">
            Registration Certificate
          </h3>
        </div>

        {/* Data Fields */}
        <div className="space-y-8 relative z-10 font-sans text-sm">
          
          <div className="grid grid-cols-[200px_1fr] items-start gap-4 border-b border-slate-200 pb-4">
            <div className="font-semibold text-slate-600">1. Registration Number</div>
            <div>
              <BoundingBox extractedText={regClaim?.value || "N/A"} isContradicted={isRegContradicted}>
                <span className="font-mono text-lg font-bold text-slate-900 tracking-wider">
                  {regClaim?.value || "N/A"}
                </span>
              </BoundingBox>
            </div>
          </div>

          <div className="grid grid-cols-[200px_1fr] items-start gap-4 border-b border-slate-200 pb-4">
            <div className="font-semibold text-slate-600">2. Legal Name</div>
            <div>
              <BoundingBox extractedText={caseData.businessName}>
                <span className="font-bold text-lg text-slate-900 uppercase">
                  {caseData.businessName}
                </span>
              </BoundingBox>
            </div>
          </div>

          <div className="grid grid-cols-[200px_1fr] items-start gap-4 border-b border-slate-200 pb-4">
            <div className="font-semibold text-slate-600">3. Trade Name (if any)</div>
            <div className="text-slate-900">{caseData.businessName}</div>
          </div>

          <div className="grid grid-cols-[200px_1fr] items-start gap-4 border-b border-slate-200 pb-4">
            <div className="font-semibold text-slate-600">4. Constitution of Business</div>
            <div className="text-slate-900">Private Limited Company</div>
          </div>

          <div className="grid grid-cols-[200px_1fr] items-start gap-4 border-b border-slate-200 pb-4">
            <div className="font-semibold text-slate-600">5. Address of Principal Place of Business</div>
            <div className="text-slate-900 leading-relaxed">
              <BoundingBox extractedText={addressClaim?.value || ""} isContradicted={isAddressContradicted}>
                <span>{addressClaim?.value || "N/A"}</span>
              </BoundingBox>
            </div>
          </div>

          <div className="grid grid-cols-[200px_1fr] items-start gap-4 border-b border-slate-200 pb-4">
            <div className="font-semibold text-slate-600">6. Date of Liability</div>
            <div className="text-slate-900">14/08/2021</div>
          </div>

          <div className="grid grid-cols-[200px_1fr] items-start gap-4 pb-4">
            <div className="font-semibold text-slate-600">7. Period of Validity</div>
            <div className="text-slate-900">From: 14/08/2021 To: Regular</div>
          </div>
        </div>

        {/* Footer / Signatures */}
        <div className="mt-20 pt-8 border-t border-slate-300 relative z-10 flex justify-between items-end">
          <div>
            <div className="w-24 h-24 border-2 border-slate-800 rounded-sm flex items-center justify-center p-2">
              {/* Fake QR code using squares */}
            <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full bg-slate-900/10 p-1">
               {[1,0,1,0, 0,1,0,1, 1,1,0,0, 0,0,1,1].map((v, i) => (
                 <div key={i} className={v ? "bg-slate-900" : "bg-transparent"} />
               ))}
            </div>
            </div>
            <div className="text-xs text-slate-500 mt-2 text-center w-24">DS DSC</div>
          </div>
          
          <div className="text-right text-sm">
            <div className="font-serif italic text-lg text-slate-700 mb-2">Digitally Signed</div>
            <div className="font-semibold text-slate-800">Signature valid</div>
            <div className="text-slate-600">Name: S. K. Sharma</div>
            <div className="text-slate-600">Designation: State Tax Officer</div>
            <div className="text-slate-600">Date: 14/08/2021</div>
          </div>
        </div>

        {/* Simulated scanning scanline overlay */}
        <div className="absolute inset-0 pointer-events-none z-50">
           <div className="w-full h-1 bg-accent/30 shadow-[0_0_20px_rgba(45,212,191,0.5)] animate-[scan_4s_ease-in-out_infinite]" />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(800px); opacity: 0; }
        }
      ` }} />
    </div>
  );
}
