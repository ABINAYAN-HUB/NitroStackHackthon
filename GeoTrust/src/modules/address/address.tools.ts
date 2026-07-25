import { ToolDecorator as Tool, Injectable, z } from '@nitrostack/core';
import { CaseStoreService } from '../case-store/case-store.service.js';
import type { ToolResult, Evidence } from '../../shared-types.js';

// Mock address verification database
// Maps normalised city/locality strings to GPS-verified coordinates and known business zones
const ADDRESS_DB: Array<{
    keywords: string[];
    lat: number;
    lng: number;
    zone: string;
    isCommercial: boolean;
    isResidential: boolean;
    isIndustrial: boolean;
}> = [
    { keywords: ['mg road', 'bengaluru', 'bangalore', 'karnataka', '560001'], lat: 12.9716, lng: 77.5946, zone: 'CBD — Bengaluru', isCommercial: true, isResidential: false, isIndustrial: false },
    { keywords: ['sidco', 'coimbatore', 'tamil nadu', '641021'], lat: 11.0168, lng: 76.9558, zone: 'SIDCO Industrial — Coimbatore', isCommercial: false, isResidential: false, isIndustrial: true },
    { keywords: ['anna nagar', 'coimbatore', '641002'], lat: 11.0240, lng: 76.9754, zone: 'Residential — Coimbatore', isCommercial: false, isResidential: true, isIndustrial: false },
    { keywords: ['koramangala', 'bengaluru', '560095'], lat: 12.9352, lng: 77.6245, zone: 'Tech Hub — Bengaluru', isCommercial: true, isResidential: true, isIndustrial: false },
    { keywords: ['kamaraj nagar', 'tiruppur', '641604'], lat: 11.1085, lng: 77.3411, zone: 'Textile Zone — Tiruppur', isCommercial: true, isResidential: false, isIndustrial: true },
    { keywords: ['beach road', 'visakhapatnam', 'vizag', '530001'], lat: 17.7125, lng: 83.2972, zone: 'Port District — Visakhapatnam', isCommercial: true, isResidential: false, isIndustrial: false },
    { keywords: ['bandra kurla', 'bkc', 'mumbai', '400051'], lat: 19.0596, lng: 72.8656, zone: 'BKC Financial District — Mumbai', isCommercial: true, isResidential: false, isIndustrial: false },
];

const AddressCheckerSchema = z.object({
    caseId: z.string().describe('Unique case identifier'),
    businessName: z.string().describe('Business name'),
    claimedAddress: z.string().describe('Address claimed by the business on their application'),
    registryAddress: z.string().optional().describe('Address from the business registry (if already retrieved) for cross-checking'),
    utilityBillAddress: z.string().optional().describe('Address from utility bill (if extracted) for cross-checking'),
});

@Injectable({ deps: [CaseStoreService] })
export class AddressTools {
    constructor(private readonly caseStore: CaseStoreService) { }

    @Tool({
        name: 'address_checker',
        description: 'Verify a claimed business address against mock map/GIS data. Checks if the address is a real commercial/industrial zone, compares it against registry and utility bill addresses, and returns a match/mismatch with reliability weight.',
        inputSchema: AddressCheckerSchema,
        examples: {
            request: {
                caseId: 'case-001',
                businessName: 'Priya Textiles Pvt Ltd',
                claimedAddress: '42, MG Road, Bengaluru, Karnataka 560001',
            },
            response: {
                ok: true,
                source: 'Address Verification Service (Mock GIS)',
                confidence: 0.92,
                matchesClaim: true,
                retrievedAt: '2024-01-15T10:32:00Z',
                data: {
                    addressFound: true,
                    zone: 'CBD — Bengaluru',
                    isCommercialZone: true,
                    lat: 12.9716,
                    lng: 77.5946,
                    registryAddressMatch: true,
                    utilityBillAddressMatch: null,
                    flags: [],
                }
            }
        }
    })
    async addressChecker(args: z.infer<typeof AddressCheckerSchema>) {
        const state = this.caseStore.getOrCreate(args.caseId, args.businessName);
        const now = new Date().toISOString();

        // Normalise and look up the claimed address
        const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
        const claimedTokens = normalise(args.claimedAddress);

        let matchedZone: typeof ADDRESS_DB[0] | undefined;
        let bestScore = 0;
        for (const zone of ADDRESS_DB) {
            const score = zone.keywords.filter(k => claimedTokens.includes(k) ||
                claimedTokens.some(t => k.includes(t) || t.includes(k))).length;
            if (score > bestScore) { bestScore = score; matchedZone = zone; }
        }

        const addressFound = bestScore >= 1;
        const flags: string[] = [];
        let confidence = 0.4;

        if (addressFound && matchedZone) {
            confidence = 0.7 + (Math.min(bestScore, 4) / 4) * 0.25;
            if (matchedZone.isResidential && !matchedZone.isCommercial && !matchedZone.isIndustrial) {
                flags.push(`Address appears to be a residential zone (${matchedZone.zone}) — unusual for a manufacturing/trading business`);
                confidence -= 0.15;
            }
        } else {
            flags.push(`Address "${args.claimedAddress}" could not be verified against known commercial/industrial zones`);
            confidence = 0.35;
        }

        // Cross-check registry address
        let registryAddressMatch: boolean | null = null;
        if (args.registryAddress) {
            const regTokens = normalise(args.registryAddress);
            const overlap = claimedTokens.filter(t => regTokens.includes(t)).length;
            registryAddressMatch = overlap >= 2;
            if (!registryAddressMatch) {
                flags.push(`Claimed address doesn't match registry: claimed "${args.claimedAddress}", registry has "${args.registryAddress}"`);
                confidence -= 0.2;
            }
        }

        // Cross-check utility bill address
        let utilityBillAddressMatch: boolean | null = null;
        if (args.utilityBillAddress) {
            const utilTokens = normalise(args.utilityBillAddress);
            const overlap = claimedTokens.filter(t => utilTokens.includes(t)).length;
            utilityBillAddressMatch = overlap >= 2;
            if (!utilityBillAddressMatch) {
                flags.push(`Utility bill address doesn't match claimed address: utility shows "${args.utilityBillAddress}", claimed "${args.claimedAddress}"`);
                confidence -= 0.2;
            }
        }

        confidence = Math.max(0, Math.min(1, confidence));

        const result: ToolResult<{
            addressFound: boolean;
            zone: string | null;
            isCommercialZone: boolean;
            lat: number | null;
            lng: number | null;
            registryAddressMatch: boolean | null;
            utilityBillAddressMatch: boolean | null;
            flags: string[];
        }> = {
            status: 'success',
            ok: addressFound,
            source: 'Address Verification Service (Mock GIS Data)',
            data: {
                addressFound,
                zone: matchedZone?.zone ?? null,
                isCommercialZone: matchedZone?.isCommercial ?? false,
                lat: matchedZone?.lat ?? null,
                lng: matchedZone?.lng ?? null,
                registryAddressMatch,
                utilityBillAddressMatch,
                flags,
            },
            matchesClaim: addressFound && registryAddressMatch !== false && utilityBillAddressMatch !== false,
            confidence,
            retrievedAt: now,
        };

        this.caseStore.addToolResult(args.caseId, result as ToolResult);

        // Update location claims
        const currentClaims = state.claims;
        const addrEvidence: Evidence = {
            id: `ev-addr-${Date.now()}`,
            source: 'Address Verification Service (Mock GIS Data)',
            snippet: addressFound
                ? `Address verified in ${matchedZone!.zone}. ${flags.length ? 'Issues: ' + flags.join('; ') : 'No issues.'}`
                : `Address "${args.claimedAddress}" not found in GIS database.`,
            retrievedAt: now,
            reliability: confidence,
            relation: addressFound && flags.length === 0 ? 'supports' : flags.length > 0 ? 'contradicts' : 'missing',
        };

        const updated = currentClaims.map(c => {
            if (c.dimension === 'location') {
                return { ...c, status: (addressFound && registryAddressMatch !== false && utilityBillAddressMatch !== false ? 'verified' : 'contradicted') as typeof c.status, evidence: [...c.evidence, addrEvidence] };
            }
            return c;
        });

        if (!updated.some(c => c.dimension === 'location')) {
            updated.push({
                id: `${args.caseId}-addr-verified`,
                dimension: 'location',
                label: 'Registered Address',
                value: args.claimedAddress,
                status: addressFound && registryAddressMatch !== false && utilityBillAddressMatch !== false ? 'verified' : 'contradicted',
                evidence: [addrEvidence],
            });
        }

        this.caseStore.updateClaims(args.caseId, updated);
        return result;
    }
}
