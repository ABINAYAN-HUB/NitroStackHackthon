/**
 * GeoTrust AI — Chef Script
 *
 * The "Chef" is the decision-maker. It connects to the GeoTrust MCP server (the "Kitchen")
 * as a client and uses NVIDIA NIM (meta/llama-3.1-70b-instruct) with tool-calling to
 * investigate a business end-to-end.
 *
 * Kitchen = the MCP server (waits to be called with tools)
 * Chef    = this script (decides what to check, in what order, and when to stop)
 *
 * If the NVIDIA NIM API is unavailable (403/404), the script automatically falls back to
 * a deterministic investigation loop that drives tools in the correct sequence.
 *
 * Usage:
 *   npx tsx chef/investigate.ts --fixture genuine
 *   npx tsx chef/investigate.ts --fixture suspicious
 *   npx tsx chef/investigate.ts --fixture ambiguous
 *   npx tsx chef/investigate.ts --fixture all
 */

import 'dotenv/config';
import OpenAI from 'openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { GENUINE_FIXTURE } from './fixtures/genuine.js';
import { SUSPICIOUS_FIXTURE } from './fixtures/suspicious.js';
import { AMBIGUOUS_FIXTURE } from './fixtures/ambiguous.js';
import type { Case, TraceEvent } from '../src/shared-types.js';

// ── NVIDIA NIM client ─────────────────────────────────────────────────────────
const nim = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY ?? '',
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const MODEL = 'meta/llama-3.3-70b-instruct';

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are investigating a small business's loan application for authenticity.
Your goal is to build an evidence-based picture of whether this business is genuine.

Investigation approach:
1. Start by reading documents (document_reader) to extract initial claims.
2. Cross-check the registration number via registry_checker.
3. Verify the address using address_checker — use both the claimed address and registry address.
4. Assess the digital footprint via web_presence_checker.
5. Once all four tool categories have been run, call score_case to produce the final verdict.

Critical reasoning rules:
- Actively look for contradictions between what was claimed and what tools report back.
- Do NOT stop at the first piece of supporting evidence — check all four dimensions.
- An ambiguous single mismatch with a plausible explanation (e.g. recently moved offices, MSME with no website) 
  is NOT the same as multiple independent unexplained red flags. Do NOT treat them the same.
- When you find a contradiction, investigate why it might exist before concluding fraud.
- A business that recently moved, or is a small MSME with no website, is not automatically suspicious.

When you log a step, attribute it to one of exactly three roles:
- "orchestrator": deciding what to check next, sequencing the investigation
- "evidence_challenger": surfacing contradictions, questioning evidence quality
- "risk_arbiter": weighing sources into a judgment, assessing overall risk

Produce a recommendation, not an accusation. Your job is to surface evidence, not convict.`;

// ── Fixture type ─────────────────────────────────────────────────────────────
interface InvestigationInput {
    caseId: string;
    businessName: string;
    registrationNumber: string;
    claimedAddress: string;
    incorporationYear: number;
    documentRef: string;
}

// ── Helper: call an MCP tool and parse the result ────────────────────────────
async function callAndParse(mcpClient: Client, name: string, args: Record<string, unknown>): Promise<unknown> {
    const result = await mcpClient.callTool({ name, arguments: args });
    if (Array.isArray(result.content) && result.content[0]?.type === 'text') {
        try { return JSON.parse(result.content[0].text); } catch { return result.content[0].text; }
    }
    return result.content;
}

// ── Deterministic fallback investigation ─────────────────────────────────────
// When NVIDIA NIM is unavailable, this drives the investigation tools in order.
async function investigateDeterministic(mcpClient: Client, input: InvestigationInput, trace: TraceEvent[], log: (agent: TraceEvent['agent'], message: string) => void): Promise<Case> {
    log('orchestrator', `Starting deterministic investigation for ${input.businessName}`);

    // Step 1: Document reader
    log('orchestrator', `Step 1/5 — Calling document_reader for registration certificate`);
    const docResult = await callAndParse(mcpClient, 'document_reader', {
        caseId: input.caseId,
        businessName: input.businessName,
        documentType: 'registration_certificate',
        documentRef: input.documentRef,
    });
    const docData = (docResult as { data?: { extractedClaims?: unknown[]; documentQuality?: number } })?.data;
    if (docData?.extractedClaims?.length) {
        log('evidence_challenger', `Extracted ${docData.extractedClaims.length} claims from registration certificate (quality: ${((docData.documentQuality ?? 0) * 100).toFixed(0)}%)`);
    }

    // Step 2: Registry checker
    log('orchestrator', `Step 2/5 — Calling registry_checker — looking up ${input.registrationNumber}`);
    const regResult = await callAndParse(mcpClient, 'registry_checker', {
        caseId: input.caseId,
        businessName: input.businessName,
        registrationNumber: input.registrationNumber,
    });
    const regData = (regResult as { data?: { flags?: string[]; nameMatch?: boolean; isActive?: boolean } })?.data;
    if (regData?.flags?.length) {
        log('evidence_challenger', `Registry flags: ${regData.flags.join('; ')}`);
    } else if (regData?.nameMatch && regData?.isActive) {
        log('evidence_challenger', 'Registry match confirmed — name, status, and registration number align');
    }

    // Step 3: Address checker
    log('orchestrator', `Step 3/5 — Calling address_checker — verifying "${input.claimedAddress}"`);
    const addrResult = await callAndParse(mcpClient, 'address_checker', {
        caseId: input.caseId,
        businessName: input.businessName,
        claimedAddress: input.claimedAddress,
        registrationNumber: input.registrationNumber,
    });
    const addrData = (addrResult as { data?: { flags?: string[]; registryAddressMatch?: boolean } })?.data;
    if (addrData?.flags?.length) {
        log('evidence_challenger', `Address issues: ${addrData.flags[0]}`);
    }
    if (addrData?.registryAddressMatch === false) {
        log('evidence_challenger', 'Address contradiction detected — claimed address differs from registry record');
    } else if (addrData?.registryAddressMatch === true) {
        log('evidence_challenger', 'Address verified — matches registry filing');
    }

    // Step 4: Web presence checker
    log('orchestrator', `Step 4/5 — Calling web_presence_checker — assessing digital footprint`);
    const webResult = await callAndParse(mcpClient, 'web_presence_checker', {
        caseId: input.caseId,
        businessName: input.businessName,
        registrationNumber: input.registrationNumber,
    });
    const webData = (webResult as { data?: { flags?: string[] } })?.data;
    if (webData?.flags?.length) {
        log('risk_arbiter', `Web presence concern: ${webData.flags[0]}`);
    } else {
        log('evidence_challenger', 'Digital footprint assessment complete — no major red flags');
    }

    // Step 5: Score case
    log('risk_arbiter', 'Step 5/5 — All evidence gathered — calling score_case to compute final verdict');
    const scoreResult = await callAndParse(mcpClient, 'score_case', {
        caseId: input.caseId,
        businessName: input.businessName,
    });

    const finalCase = scoreResult as Case;
    finalCase.trace = trace;
    log('risk_arbiter', `Verdict: ${finalCase.recommendation.toUpperCase()} — score ${finalCase.overallScore}/100. ${finalCase.recommendationReason}`);

    return finalCase;
}

// ── LLM-driven investigation (uses NVIDIA NIM) ──────────────────────────────
async function investigateWithLLM(mcpClient: Client, input: InvestigationInput, availableTools: OpenAI.ChatCompletionTool[], trace: TraceEvent[], log: (agent: TraceEvent['agent'], message: string) => void): Promise<Case> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
            role: 'user',
            content: `Investigate this business for loan eligibility:
- Business Name: ${input.businessName}
- Registration Number: ${input.registrationNumber}
- Claimed Address: ${input.claimedAddress}
- Incorporation Year: ${input.incorporationYear}
- Case ID: ${input.caseId}
- Document Reference: ${input.documentRef}

Run all four investigation tools (document_reader, registry_checker, address_checker, web_presence_checker), 
then call score_case to finalize the assessment.`
        },
    ];

    let finalCase: Case | null = null;
    let iterations = 0;
    const MAX_ITERATIONS = 20;

    while (iterations < MAX_ITERATIONS) {
        iterations++;

        const response = await nim.chat.completions.create({
            model: MODEL,
            messages,
            tools: availableTools,
            tool_choice: 'auto',
            temperature: 0.1,
        });

        const message = response.choices[0].message;
        messages.push(message);

        if (!message.tool_calls || message.tool_calls.length === 0) {
            log('risk_arbiter', 'Investigation complete — no further tools needed.');
            break;
        }

        for (const toolCall of message.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);

            if (toolName === 'document_reader') log('orchestrator', `Calling document_reader for ${toolArgs.documentType ?? 'registration certificate'}`);
            else if (toolName === 'registry_checker') log('orchestrator', `Calling registry_checker — looking up ${toolArgs.registrationNumber}`);
            else if (toolName === 'address_checker') log('evidence_challenger', `Calling address_checker — cross-referencing "${toolArgs.claimedAddress}"`);
            else if (toolName === 'web_presence_checker') log('orchestrator', `Calling web_presence_checker — assessing digital footprint`);
            else if (toolName === 'score_case') log('risk_arbiter', 'All evidence gathered — calling score_case');

            try {
                const parsedResult = await callAndParse(mcpClient, toolName, toolArgs);

                if (toolName === 'registry_checker' && typeof parsedResult === 'object' && parsedResult !== null) {
                    const data = (parsedResult as { data?: { flags?: string[]; nameMatch?: boolean; isActive?: boolean } }).data;
                    if (data?.flags?.length) log('evidence_challenger', `Registry flags: ${data.flags.join('; ')}`);
                    else if (data?.nameMatch && data?.isActive) log('evidence_challenger', 'Registry match confirmed');
                }
                if (toolName === 'address_checker' && typeof parsedResult === 'object' && parsedResult !== null) {
                    const data = (parsedResult as { data?: { flags?: string[]; registryAddressMatch?: boolean } }).data;
                    if (data?.flags?.length) log('evidence_challenger', `Address issues: ${data.flags[0]}`);
                    if (data?.registryAddressMatch === false) log('evidence_challenger', 'Address contradiction detected');
                }
                if (toolName === 'web_presence_checker' && typeof parsedResult === 'object' && parsedResult !== null) {
                    const data = (parsedResult as { data?: { flags?: string[] } }).data;
                    if (data?.flags?.length) log('risk_arbiter', `Web presence concern: ${data.flags[0]}`);
                }
                if (toolName === 'score_case') {
                    finalCase = parsedResult as Case;
                    finalCase.trace = trace;
                    log('risk_arbiter', `Verdict: ${finalCase.recommendation.toUpperCase()} — score ${finalCase.overallScore}/100`);
                }

                messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(parsedResult) });
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                log('orchestrator', `Tool error (${toolName}): ${errorMsg}`);
                messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify({ error: errorMsg }) });
            }
        }
        if (finalCase) break;
    }

    if (!finalCase) throw new Error(`Investigation did not reach a conclusion after ${MAX_ITERATIONS} iterations`);
    return finalCase;
}

// ── Main investigation ───────────────────────────────────────────────────────
async function investigate(input: InvestigationInput): Promise<Case> {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🔍 GeoTrust AI — Investigating: ${input.businessName}`);
    console.log(`   Case ID: ${input.caseId}`);
    console.log(`${'═'.repeat(60)}\n`);

    const trace: TraceEvent[] = [];
    function log(agent: TraceEvent['agent'], message: string) {
        const event: TraceEvent = { timestamp: new Date().toISOString(), agent, message };
        trace.push(event);
        const agentLabel = { orchestrator: '🎯 Orchestrator', evidence_challenger: '🔍 Challenger', risk_arbiter: '⚖️  Arbiter' }[agent];
        console.log(`[${event.timestamp.substring(11, 19)}] ${agentLabel}: ${message}`);
    }

    // Connect to MCP Kitchen
    const transport = new StdioClientTransport({
        command: 'node',
        args: ['dist/index.js'],
        env: { ...process.env },
    });

    const mcpClient = new Client({ name: 'geotrust-chef', version: '1.0.0' }, { capabilities: {} });
    await mcpClient.connect(transport);
    log('orchestrator', `Connected to GeoTrust Kitchen. Investigating ${input.businessName} (${input.registrationNumber})`);

    // Discover tools
    const toolsResponse = await mcpClient.listTools();
    const availableTools: OpenAI.ChatCompletionTool[] = toolsResponse.tools.map(t => ({
        type: 'function' as const,
        function: { name: t.name, description: t.description ?? '', parameters: t.inputSchema as Record<string, unknown> },
    }));
    log('orchestrator', `Kitchen has ${availableTools.length} tools: ${availableTools.map(t => t.function.name).join(', ')}`);

    let finalCase: Case;

    // Try LLM-driven investigation first
    try {
        log('orchestrator', `Attempting LLM-driven investigation via NVIDIA NIM (${MODEL})...`);
        finalCase = await investigateWithLLM(mcpClient, input, availableTools, trace, log);
    } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status === 403 || status === 404 || status === 401) {
            console.log(`\n⚠️  NVIDIA NIM API returned ${status} — switching to deterministic fallback\n`);
            log('orchestrator', `NIM API unavailable (${status}). Switching to deterministic tool-calling sequence.`);
            finalCase = await investigateDeterministic(mcpClient, input, trace, log);
        } else {
            throw err;
        }
    }

    await mcpClient.close();
    return finalCase;
}

// ── CLI entry point ──────────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const fixtureArg = args.find(a => a.startsWith('--fixture='))?.split('=')[1] ??
        (args.includes('--fixture') ? args[args.indexOf('--fixture') + 1] : null);

    let inputs: InvestigationInput[];

    if (fixtureArg === 'genuine') inputs = [GENUINE_FIXTURE];
    else if (fixtureArg === 'suspicious') inputs = [SUSPICIOUS_FIXTURE];
    else if (fixtureArg === 'ambiguous') inputs = [AMBIGUOUS_FIXTURE];
    else if (fixtureArg === 'all') inputs = [GENUINE_FIXTURE, SUSPICIOUS_FIXTURE, AMBIGUOUS_FIXTURE];
    else {
        const get = (flag: string) => args.find(a => a.startsWith(`--${flag}=`))?.split('=')[1] ??
            (args.includes(`--${flag}`) ? args[args.indexOf(`--${flag}`) + 1] : undefined);
        inputs = [{
            caseId: get('caseId') ?? 'case-001',
            businessName: get('businessName') ?? 'Priya Textiles Pvt Ltd',
            registrationNumber: get('regNum') ?? 'U17111KA2018PTC112345',
            claimedAddress: get('address') ?? '42, MG Road, Bengaluru, Karnataka 560001',
            incorporationYear: parseInt(get('year') ?? '2018'),
            documentRef: get('docRef') ?? 'REG-CERT',
        }];
    }

    const results: Case[] = [];

    for (const input of inputs) {
        try {
            const result = await investigate(input);
            results.push(result);
            console.log('\n📋 Final Case Object:');
            console.log(JSON.stringify(result, null, 2));
        } catch (err) {
            console.error(`\n❌ Investigation failed for ${input.businessName}:`, err);
        }
    }

    try {
        const fs = await import('fs');
        const path = await import('path');
        const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');
        const outPath = path.resolve(__dirname, '../../geotrust-dashboard/lib/live-cases.json');
        fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
        console.log(`\n💾 Saved live cases to ${outPath}`);
    } catch (e) {
        console.error('Failed to write live cases:', e);
    }

    if (results.length === 3) {
        console.log('\n\n' + '═'.repeat(60));
        console.log('📊 Three-Fixture Comparison:');
        console.log('═'.repeat(60));
        for (const r of results) {
            console.log(`  ${r.businessName.padEnd(40)} | Score: ${String(r.overallScore).padStart(3)} | ${r.recommendation}`);
        }
        console.log('═'.repeat(60));
        const [genuine, suspicious, ambiguous] = results;
        const ambiguousDifferentFromSuspicious = ambiguous.recommendation !== suspicious.recommendation;
        console.log(`\n✅ Ambiguous ≠ Suspicious: ${ambiguousDifferentFromSuspicious ? 'PASS' : 'FAIL — scoring logic needs review'}`);
    }

    console.log('\n✅ Investigation complete.');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
