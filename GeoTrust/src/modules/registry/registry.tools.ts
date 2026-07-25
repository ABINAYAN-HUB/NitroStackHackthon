import { ToolDecorator as Tool, Injectable, z } from '@nitrostack/core';
import { CaseStoreService } from '../case-store/case-store.service.js';
import { REGISTRY_DATASET } from './registry.data.js';
import type { ToolResult, Evidence } from '../../shared-types.js';

const RegistryCheckerSchema = z.object({
    caseId: z.string().describe('Unique case identifier'),
    businessName: z.string().describe('Business name to look up'),
    registrationNumber: z.string().describe('Registration/CIN/UDYAM number to verify'),
    claimedAddress: z.string().optional().describe('Address claimed by the applicant for cross-check'),
});

@Injectable({ deps: [CaseStoreService] })
export class RegistryTools {
    constructor(private readonly caseStore: CaseStoreService) { }

    @Tool({
        name: 'registry_checker',
        description: 'Look up a business registration/tax ID against the practice Indian SME registry dataset. Returns match/mismatch on name, address, incorporation date, director, and active status.',
        inputSchema: RegistryCheckerSchema,
        examples: {
            request: {
                caseId: 'case-001',
                businessName: 'Priya Textiles Pvt Ltd',
                registrationNumber: 'U17111KA2018PTC112345',
            },
            response: {
                ok: true,
                source: 'Karnataka State Business Registry',
                confidence: 0.95,
                matchesClaim: true,
                retrievedAt: '2024-01-15T10:31:00Z',
                data: {
                    found: true,
                    record: { registrationNumber: 'U17111KA2018PTC112345', businessName: 'Priya Textiles Pvt Ltd', status: 'active' },
                    nameMatch: true,
                    addressMatch: true,
                    isActive: true,
                    flags: [],
                }
            }
        }
    })
    async registryChecker(args: z.infer<typeof RegistryCheckerSchema>) {
        const state = this.caseStore.getOrCreate(args.caseId, args.businessName);
        const now = new Date().toISOString();

        // Find in registry
        const record = REGISTRY_DATASET.find(r =>
            r.registrationNumber.toLowerCase() === args.registrationNumber.toLowerCase()
        );

        const found = !!record;
        let nameMatch = false;
        let addressMatch = false;
        let isActive = false;
        const flags: string[] = [];
        let confidence = 0.3;

        if (record) {
            nameMatch = record.businessName.toLowerCase().trim() === args.businessName.toLowerCase().trim();
            isActive = record.status === 'active';
            confidence = 0.9;

            if (!nameMatch) {
                flags.push(`Name mismatch: registry shows "${record.businessName}", applicant claims "${args.businessName}"`);
                confidence -= 0.2;
            }

            if (args.claimedAddress) {
                // Simple fuzzy match on city/locality
                const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
                const regTokens = new Set(normalise(record.registeredAddress));
                const claimedTokens = normalise(args.claimedAddress);
                const overlap = claimedTokens.filter(t => regTokens.has(t)).length;
                addressMatch = overlap >= 2;
                if (!addressMatch) {
                    flags.push(`Address mismatch: registry shows "${record.registeredAddress}", claimed "${args.claimedAddress}"`);
                    confidence -= 0.15;
                }
            }

            if (!isActive) {
                flags.push(`Business status: "${record.status}" — not in good standing`);
                confidence -= 0.25;
            }

            if (!record.gstNumber) {
                flags.push('No GST registration found — unusual for a trading business');
                confidence -= 0.1;
            }

            // Check filing recency
            const lastFiling = new Date(record.lastFilingDate);
            const monthsSinceFiling = (Date.now() - lastFiling.getTime()) / (1000 * 60 * 60 * 24 * 30);
            if (monthsSinceFiling > 18) {
                flags.push(`Annual filing overdue — last filed ${record.lastFilingDate} (${Math.round(monthsSinceFiling)} months ago)`);
                confidence -= 0.1;
            }
        } else {
            flags.push(`Registration number "${args.registrationNumber}" not found in registry — possible shell company or data entry error`);
        }

        confidence = Math.max(0, Math.min(1, confidence));

        const result: ToolResult<{
            found: boolean;
            record: typeof record | null;
            nameMatch: boolean;
            addressMatch: boolean;
            isActive: boolean;
            flags: string[];
        }> = {
            ok: found,
            source: 'Indian SME Business Registry (Practice Dataset)',
            data: { found, record: record ?? null, nameMatch, addressMatch, isActive, flags },
            matchesClaim: found && nameMatch && isActive,
            confidence,
            retrievedAt: now,
        };

        this.caseStore.addToolResult(args.caseId, result as ToolResult);

        // Update claims based on registry findings
        const currentClaims = state.claims;
        const registryEvidence: Evidence = {
            id: `ev-reg-${Date.now()}`,
            source: 'Indian SME Business Registry (Practice Dataset)',
            snippet: found
                ? `Registry record found: ${record!.businessName} — Status: ${record!.status}. ${flags.length ? 'Flags: ' + flags.join('; ') : 'No flags.'}`
                : `No registry record for registration number: ${args.registrationNumber}`,
            retrievedAt: now,
            reliability: confidence,
            relation: found && nameMatch && isActive ? 'supports' : found ? 'contradicts' : 'missing',
        };

        // Attach to identity claims
        const updated = currentClaims.map(c => {
            if (c.dimension === 'identity' && (c.label === 'Business Name' || c.label === 'Registration Number')) {
                const newStatus = found && nameMatch ? 'verified' : found ? 'contradicted' : 'pending';
                return { ...c, status: newStatus as typeof c.status, evidence: [...c.evidence, registryEvidence] };
            }
            return c;
        });

        if (updated.length === 0) {
            // No prior claims — create minimal registry claim
            updated.push({
                id: `${args.caseId}-reg-status`,
                dimension: 'identity',
                label: 'Registry Status',
                value: found ? record!.status : 'not_found',
                status: found && isActive ? 'verified' : 'contradicted',
                evidence: [registryEvidence],
            });
        }

        this.caseStore.updateClaims(args.caseId, updated);
        return result;
    }
}
