import { ToolDecorator as Tool, Injectable, z } from '@nitrostack/core';
import { CaseStoreService } from '../case-store/case-store.service.js';
import type { ToolResult, Claim, Evidence } from '../../shared-types.js';

// Mock document library — simulates OCR/extraction results from uploaded files
const MOCK_DOCUMENTS: Record<string, {
    name: string;
    registrationNumber: string;
    address: string;
    incorporationDate: string;
    directorName: string;
    documentQuality: number; // 0-1
}> = {
    'REG-CERT': {
        name: 'Priya Textiles Pvt Ltd',
        registrationNumber: 'U17111KA2018PTC112345',
        address: '42, MG Road, Bengaluru, Karnataka 560001',
        incorporationDate: '2018-03-15',
        directorName: 'Priya Venkataraman',
        documentQuality: 0.97,
    },
    'STEEL-REG-CERT': {
        name: 'Coimbatore Steels & Alloys Pvt Ltd',
        registrationNumber: 'U27100TN2015PTC098765',
        address: '15, SIDCO Industrial Estate, Coimbatore, Tamil Nadu 641021',
        incorporationDate: '2015-07-20',
        directorName: 'Rajesh Murugesan',
        documentQuality: 0.91,
    },
    'DIGITAL-REG-CERT': {
        name: 'Namma Digital Solutions LLP',
        registrationNumber: 'AAH-2345',
        address: '78, 5th Block, Koramangala, Bengaluru, Karnataka 560095',
        incorporationDate: '2021-11-01',
        directorName: 'Arun Kumar Pillai',
        documentQuality: 0.43, // poor quality — blurry scan
    },
    'APEX-REG-CERT': {
        name: 'Apex Micro Enterprises',
        registrationNumber: 'UDYAM-TN-06-0012345',
        address: '22, Kamaraj Nagar, Tiruppur, Tamil Nadu 641604',
        incorporationDate: '2019-05-10',
        directorName: 'Senthil Krishnamurthy',
        documentQuality: 0.88,
    },
    'VENKATESWARA-REG-CERT': {
        name: 'Sri Venkateswara Exports',
        registrationNumber: 'IEC-0316054321',
        address: '9, Beach Road, Visakhapatnam, Andhra Pradesh 530001',
        incorporationDate: '2016-09-22',
        directorName: 'Hari Prasad Rao',
        documentQuality: 0.82,
    },
};

const DocumentReaderSchema = z.object({
    caseId: z.string().describe('Unique case identifier'),
    businessName: z.string().describe('Business name to investigate'),
    documentType: z.enum(['registration_certificate', 'identity_document', 'utility_bill']).describe('Type of document to extract from'),
    documentRef: z.string().optional().describe('Reference key for the mock document (e.g. REG-CERT)'),
});

@Injectable({ deps: [CaseStoreService] })
export class DocumentsTools {
    constructor(private readonly caseStore: CaseStoreService) { }

    @Tool({
        name: 'document_reader',
        description: 'Extract structured claims (business name, registration number, address, incorporation date, director) from an uploaded document. Returns partial Claim objects with status "pending" until cross-checked by other tools.',
        inputSchema: DocumentReaderSchema,
        examples: {
            request: {
                caseId: 'case-001',
                businessName: 'Priya Textiles Pvt Ltd',
                documentType: 'registration_certificate',
                documentRef: 'REG-CERT',
            },
            response: {
                ok: true,
                source: 'Document OCR — Registration Certificate',
                confidence: 0.97,
                matchesClaim: true,
                retrievedAt: '2024-01-15T10:30:00Z',
                data: {
                    extractedClaims: [
                        { dimension: 'identity', label: 'Business Name', value: 'Priya Textiles Pvt Ltd', status: 'pending' },
                        { dimension: 'identity', label: 'Registration Number', value: 'U17111KA2018PTC112345', status: 'pending' },
                        { dimension: 'location', label: 'Registered Address', value: '42, MG Road, Bengaluru, Karnataka 560001', status: 'pending' },
                    ],
                    documentQuality: 0.97,
                    documentType: 'registration_certificate',
                }
            }
        }
    })
    async documentReader(args: z.infer<typeof DocumentReaderSchema>) {
        const state = this.caseStore.getOrCreate(args.caseId, args.businessName);
        const now = new Date().toISOString();

        // Look up mock document — fall back to a generic result if no ref
        const docKey = args.documentRef ?? Object.keys(MOCK_DOCUMENTS).find(k =>
            MOCK_DOCUMENTS[k].name.toLowerCase().includes(args.businessName.toLowerCase().split(' ')[0])
        ) ?? 'REG-CERT';

        const doc = MOCK_DOCUMENTS[docKey];
        const quality = doc?.documentQuality ?? 0.6;

        let extractedClaims: Partial<Claim>[] = [];
        let sourceLabel = '';

        if (args.documentType === 'registration_certificate' && doc) {
            sourceLabel = 'Document OCR — Registration Certificate';
            extractedClaims = [
                {
                    id: `${args.caseId}-doc-name`,
                    dimension: 'identity',
                    label: 'Business Name',
                    value: doc.name,
                    status: 'pending',
                    evidence: [{
                        id: `ev-doc-name-${Date.now()}`,
                        source: sourceLabel,
                        snippet: `Name extracted from registration certificate: "${doc.name}"`,
                        retrievedAt: now,
                        reliability: quality,
                        relation: 'supports',
                    }],
                },
                {
                    id: `${args.caseId}-doc-regnum`,
                    dimension: 'identity',
                    label: 'Registration Number',
                    value: doc.registrationNumber,
                    status: 'pending',
                    evidence: [{
                        id: `ev-doc-regnum-${Date.now()}`,
                        source: sourceLabel,
                        snippet: `Registration number: ${doc.registrationNumber}`,
                        retrievedAt: now,
                        reliability: quality,
                        relation: 'supports',
                    }],
                },
                {
                    id: `${args.caseId}-doc-address`,
                    dimension: 'location',
                    label: 'Registered Address',
                    value: doc.address,
                    status: 'pending',
                    evidence: [{
                        id: `ev-doc-addr-${Date.now()}`,
                        source: sourceLabel,
                        snippet: `Address on certificate: "${doc.address}"`,
                        retrievedAt: now,
                        reliability: quality,
                        relation: 'supports',
                    }],
                },
                {
                    id: `${args.caseId}-doc-director`,
                    dimension: 'identity',
                    label: 'Director Name',
                    value: doc.directorName,
                    status: 'pending',
                    evidence: [{
                        id: `ev-doc-dir-${Date.now()}`,
                        source: sourceLabel,
                        snippet: `Director: ${doc.directorName}`,
                        retrievedAt: now,
                        reliability: quality,
                        relation: 'supports',
                    }],
                },
            ];
        } else if (args.documentType === 'utility_bill') {
            sourceLabel = 'Document OCR — Utility Bill';
            // Utility bill address might differ (simulates the contradiction in case-002)
            const utilityAddress = docKey === 'STEEL-REG-CERT'
                ? '8, Anna Nagar, Coimbatore, Tamil Nadu 641002'  // MISMATCH — different from reg cert
                : doc?.address ?? 'Address not legible';
            extractedClaims = [{
                id: `${args.caseId}-util-address`,
                dimension: 'location',
                label: 'Utility Bill Address',
                value: utilityAddress,
                status: 'pending',
                evidence: [{
                    id: `ev-util-addr-${Date.now()}`,
                    source: sourceLabel,
                    snippet: `Address on utility bill: "${utilityAddress}"`,
                    retrievedAt: now,
                    reliability: quality * 0.9,
                    relation: 'supports',
                }],
            }];
        } else if (args.documentType === 'identity_document') {
            sourceLabel = 'Document OCR — Identity Document';
            extractedClaims = [{
                id: `${args.caseId}-id-director`,
                dimension: 'identity',
                label: 'Director Name (ID)',
                value: doc?.directorName ?? 'Not legible',
                status: 'pending',
                evidence: [{
                    id: `ev-id-${Date.now()}`,
                    source: sourceLabel,
                    snippet: `Director name from Aadhaar/PAN: ${doc?.directorName ?? 'Not legible'}`,
                    retrievedAt: now,
                    reliability: quality,
                    relation: 'supports',
                }],
            }];
        }

        const result: ToolResult<{
            extractedClaims: Partial<Claim>[];
            documentQuality: number;
            documentType: string;
        }> = {
            ok: true,
            source: sourceLabel || 'Document OCR',
            data: {
                extractedClaims,
                documentQuality: quality,
                documentType: args.documentType,
            },
            confidence: quality,
            retrievedAt: now,
        };

        this.caseStore.addToolResult(args.caseId, result as ToolResult);

        // Merge claims into state
        const existing = state.claims;
        const merged = [...existing];
        for (const ec of extractedClaims) {
            const idx = merged.findIndex(c => c.id === ec.id);
            if (idx === -1) merged.push(ec as Claim);
            else merged[idx] = { ...merged[idx], ...ec };
        }
        this.caseStore.updateClaims(args.caseId, merged);

        return result;
    }
}
