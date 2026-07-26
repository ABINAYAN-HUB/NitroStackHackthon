"use client";
import { useState } from "react";
import { Upload, FileText, Building2, Hash, MapPin, ChevronRight, ArrowLeft, Sparkles, Check, Shield } from "lucide-react";

import { createInvestigation } from "../../actions";

export default function NewCasePage() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const newCaseId = await createInvestigation(formData);
    window.location.href = `/cases/${newCaseId}`;
  };

  const steps = [
    { num: 1, label: "Business Identity", active: true },
    { num: 2, label: "Documents", active: files.length > 0 },
    { num: 3, label: "Review & Submit", active: false },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative border-b border-border/30 bg-paper/60 backdrop-blur-sm px-8 py-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-verified to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
            <a href="/" className="hover:text-text transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Queue
            </a>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span className="text-text-secondary">New Investigation</span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display font-bold text-2xl text-text tracking-tight">Start Investigation</h1>
            <div className="px-2.5 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </div>
          </div>
          <p className="text-text-muted text-sm">
            Submit a business application for automated authenticity verification across 4 dimensions
          </p>

          {/* Progress steps */}
          <div className="flex items-center gap-4 mt-5">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-bold ${
                  step.active ? "bg-accent/15 text-accent border border-accent/25" : "bg-paper-raised text-text-muted border border-border"
                }`}>
                  {step.active ? step.num : step.num}
                </div>
                <span className={`text-xs font-medium ${step.active ? "text-text" : "text-text-muted"}`}>{step.label}</span>
                {i < steps.length - 1 && <div className="w-8 h-px bg-border ml-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Identity */}
          <div className="glass-card p-6 animate-fade-in-up stagger-1">
            <h2 className="font-display font-semibold text-text text-base mb-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-verified/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-verified" />
              </div>
              Business Identity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-2 uppercase tracking-wider">
                  Business Name *
                </label>
                <input
                  required
                  name="businessName"
                  type="text"
                  placeholder="e.g. Priya Textiles Pvt Ltd"
                  className="w-full bg-ink/50 border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-text-muted/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-2 uppercase tracking-wider">
                  Registration / CIN / UDYAM Number *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                  <input
                    required
                    name="registrationNumber"
                    type="text"
                    placeholder="e.g. U17111KA2018PTC112345"
                    className="w-full bg-ink/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-text placeholder-text-muted/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-muted mb-2 uppercase tracking-wider">
                  Claimed Business Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted/50" />
                  <textarea
                    required
                    name="address"
                    rows={2}
                    placeholder="e.g. 42, MG Road, Bengaluru, Karnataka 560001"
                    className="w-full bg-ink/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text placeholder-text-muted/50 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="glass-card p-6 animate-fade-in-up stagger-2">
            <h2 className="font-display font-semibold text-text text-base mb-1 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-caution/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-caution" />
              </div>
              Documents
            </h2>
            <p className="text-text-muted text-xs mb-5 ml-[42px]">
              Upload registration certificate, director ID, and utility bill for cross-verification
            </p>

            {/* Dropzone */}
            <div
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                dragging
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-border-light hover:bg-paper-hover/20"
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-5 h-5 text-accent" />
                </div>
                <p className="text-text text-sm font-medium mb-1">
                  Drop files here or <span className="text-accent">browse</span>
                </p>
                <p className="text-text-muted text-xs">
                  PDF, JPG, PNG, DOCX · Max 10MB per file
                </p>
              </label>
            </div>

            {/* Uploaded files */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-ink/30 rounded-xl border border-border/50">
                    <FileText className="w-4 h-4 text-caution shrink-0" />
                    <span className="text-sm text-text flex-1 truncate">{f.name}</span>
                    <span className="text-[11px] font-mono text-text-muted">{(f.size / 1024).toFixed(0)} KB</span>
                    <Check className="w-4 h-4 text-verified" />
                  </div>
                ))}
              </div>
            )}

            {/* Document checklist */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Registration Certificate", "Director ID (Aadhaar/PAN)", "Utility Bill"].map((doc) => (
                <div key={doc} className="text-[11px] text-text-muted px-3 py-2 border border-border/40 rounded-lg flex items-center gap-2 bg-ink/20">
                  <div className={`w-2 h-2 rounded-full ${files.length > 0 ? "bg-verified" : "bg-border"}`} />
                  {doc}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-verified to-emerald-500 text-ink font-display font-bold text-base rounded-xl hover:shadow-xl hover:shadow-verified/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 hover:-translate-y-0.5 animate-fade-in-up stagger-3"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                Starting AI investigation...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Start Investigation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
