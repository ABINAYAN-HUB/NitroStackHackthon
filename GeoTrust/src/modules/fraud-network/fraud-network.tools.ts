import { ToolDecorator as Tool, Injectable, z } from '@nitrostack/core';
import { CaseStoreService } from '../case-store/case-store.service.js';
import type { ToolResult, Evidence } from '../../shared-types.js';

const FraudNetworkSchema = z.object({
    caseId: z.string(),
    businessName: z.string(),
    directorName: z.string().optional(),
    registrationNumber: z.string().optional(),
});

// Mock Graph DB of known fraud rings and bad actors
const FRAUD_GRAPH_DB = [
    {
        name: 'Amit Desai',
        linkedEntities: ['Vibrant Logistics Pvt Ltd', 'Desai Shell Corp (Struck Off)', 'Ocean Freight Fraud Ring'],
        riskLevel: 'HIGH',
        reason: 'Director is associated with 2 struck-off shell companies and a known freight fraud ring.'
    },
    {
        name: 'Hari Prasad Rao',
        linkedEntities: ['Sri Venkateswara Exports', 'Rao Fisheries (Defunct)', 'Coastal Trade Syndicate'],
        riskLevel: 'MEDIUM',
        reason: 'Director is associated with multiple defunct companies in the same sector.'
    }
];

@Injectable({ deps: [CaseStoreService] })
export class FraudNetworkTools {
    constructor(private readonly caseStore: CaseStoreService) { }

    @Tool({
        name: 'fraud_network_checker',
        description: 'Cross-reference directors and business entities against a real-time graph database of known bad actors and fraud rings.',
        inputSchema: FraudNetworkSchema,
    })
    async checkFraudNetwork(args: z.infer<typeof FraudNetworkSchema>): Promise<ToolResult> {
        const state = this.caseStore.get(args.caseId);
        if (!state) throw new Error(`Case ${args.caseId} not found.`);

        const now = new Date().toISOString();
        let match = null;

        if (args.directorName) {
            match = FRAUD_GRAPH_DB.find(f => args.directorName!.toLowerCase().includes(f.name.toLowerCase()));
        }

        const found = !!match;
        const confidence = found && match ? (match.riskLevel === 'HIGH' ? 0.9 : 0.6) : 0.6;

        const result: ToolResult = {
            ok: true,
            source: 'GraphDB Fraud Network',
            data: { matchFound: found, details: match },
            confidence,
            retrievedAt: now,
        };

        this.caseStore.addToolResult(args.caseId, result);

        if (found && match) {
            const fraudEvidence: Evidence = {
                id: `ev-fraud-${Date.now()}`,
                source: 'Fraud Network Graph Analysis',
                snippet: `🚨 Fraud Ring Match: ${match.reason} Linked Entities: ${match.linkedEntities.join(', ')}`,
                retrievedAt: now,
                reliability: confidence,
                relation: 'contradicts',
            };

            // We add this evidence directly as a new "Identity" claim or append to existing director name claim
            const currentClaims = state.claims;
            const updated = currentClaims.map(c => {
                if (c.dimension === 'identity' && c.label === 'Director Name') {
                    return { ...c, status: 'contradicted' as const, evidence: [...c.evidence, fraudEvidence] };
                }
                return c;
            });

            // If no director name claim existed, create a standalone network claim
            if (!currentClaims.some(c => c.label === 'Director Name')) {
                updated.push({
                    id: `${args.caseId}-network-risk`,
                    dimension: 'identity',
                    label: 'Network Risk',
                    value: 'High Risk Entity',
                    status: 'contradicted',
                    evidence: [fraudEvidence],
                });
            }

            this.caseStore.updateClaims(args.caseId, updated);
        }

        return result;
    }
}
