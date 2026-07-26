"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, Cpu, Database, Network } from "lucide-react";
import type { Case, TraceEvent } from "@/shared-types";

interface Props {
  caseData: Case;
}

interface McpCall {
  id: string;
  timestamp: Date;
  method: string;
  params: any;
  result?: any;
  status: "pending" | "success" | "error";
}

export function McpConsole({ caseData }: Props) {
  const [calls, setCalls] = useState<McpCall[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate simulated MCP tool calls based on the case trace
    const simulatedCalls: McpCall[] = caseData.trace.map((t, i) => {
      let method = "tools/call";
      let params = {};
      let result = {};

      if (t.message.includes("document_reader")) {
        params = { name: "document_reader", arguments: { uri: "file:///docs/reg-cert.pdf" } };
        result = { claimsExtracted: 4 };
      } else if (t.message.includes("registry_checker")) {
        params = { name: "registry_checker", arguments: { registration_number: caseData.claims.find(c => c.label === "Registration Number")?.value || "unknown" } };
        result = { status: "active", flags: ["overdue"] };
      } else if (t.message.includes("address_checker")) {
        params = { name: "address_checker", arguments: { address: caseData.claims.find(c => c.label === "Registered Address")?.value || "unknown" } };
        result = { verified: true, zone: "CBD" };
      } else if (t.message.includes("web_presence_checker")) {
        params = { name: "web_presence_checker", arguments: { query: caseData.businessName } };
        result = { domainFound: true, reviews: 47 };
      } else {
        method = "prompts/get";
        params = { name: "score_case" };
        result = { score: caseData.overallScore };
      }

      return {
        id: `mcp-${i}`,
        timestamp: new Date(t.timestamp),
        method,
        params,
        result,
        status: "success"
      };
    });

    setCalls(simulatedCalls);
  }, [caseData]);

  return (
    <div className="h-full flex flex-col bg-[#0F1115] font-mono text-[13px] text-emerald-400/90 overflow-hidden relative">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-black/40 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider text-emerald-400">NitroStack MCP Server Connection</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-400/50">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Agent Live</span>
          <span className="flex items-center gap-1"><Network className="w-3 h-3" /> JSON-RPC 2.0</span>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        <div className="text-emerald-400/50 mb-4">
          <p>{`> Initializing Model Context Protocol connection to NitroStack Server...`}</p>
          <p>{`> Handshake complete. Supported capabilities: tools, prompts, resources.`}</p>
          <p>{`> Beginning autonomous tool execution for case ${caseData.id}`}</p>
        </div>

        {calls.map((call) => (
          <div key={call.id} className="space-y-1.5 border border-emerald-900/30 bg-emerald-900/10 rounded p-3">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="font-bold">→ JSON-RPC Request</span>
              <span className="text-emerald-400/40 text-[11px]">{new Date(call.timestamp).toISOString()}</span>
            </div>
            <pre className="text-emerald-200/70 ml-4 overflow-x-auto">
              {JSON.stringify({
                jsonrpc: "2.0",
                id: call.id,
                method: call.method,
                params: call.params
              }, null, 2)}
            </pre>
            
            <div className="flex items-center justify-between text-emerald-300 mt-2">
              <span className="font-bold">← JSON-RPC Response</span>
            </div>
            <pre className="text-emerald-200/70 ml-4 overflow-x-auto">
              {JSON.stringify({
                jsonrpc: "2.0",
                id: call.id,
                result: call.result
              }, null, 2)}
            </pre>
          </div>
        ))}
        <div className="text-emerald-400/50 mt-4 animate-pulse">
          {`> Server awaiting next instruction...`}
          <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 align-middle" />
        </div>
      </div>
    </div>
  );
}
