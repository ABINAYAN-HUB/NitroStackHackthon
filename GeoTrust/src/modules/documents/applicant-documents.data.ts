// ═══════════════════════════════════════════════════════════════════════════════
// APPLICANT DOCUMENTS — Mock data representing what applicants submit
// This is SEPARATE from the Registry (ground truth). These two sources are
// ALLOWED to disagree — that's the whole point of verification.
// ═══════════════════════════════════════════════════════════════════════════════

export interface MockDocument {
    /** Reference key for this document bundle */
    refKey: string;
    /** Business name as written on the document */
    businessName: string;
    /** Registration/CIN number as written on the document */
    registrationNumber: string;
    /** Address as written on the document */
    address: string;
    /** Incorporation date as written on the document */
    incorporationDate: string;
    /** Director name as written on the document */
    directorName: string;
    /** Simulated OCR confidence (0-1) */
    documentQuality: number;
    /** PAN as written on the PAN card */
    pan?: string;
    /** GSTIN as written on the GST certificate */
    gstNumber?: string;
    /** Udyam number as written on the MSME certificate */
    udyamNumber?: string;
    /** Trade license number */
    tradeLicenseNumber?: string;
    /** Ownership type from property documents */
    ownershipType?: 'owned' | 'rented';
    /** GPS coordinates embedded in premises photo EXIF */
    photoLocation?: { lat: number; lng: number };
    /** Utility bill address (may differ from registration address!) */
    utilityBillAddress?: string;
    /** Bank account holder name */
    bankAccountName?: string;
    /** Bank account number */
    bankAccountNumber?: string;
    /** IFSC code */
    ifscCode?: string;
    /** Monthly transaction count (from bank statement) */
    monthlyTransactions?: number;
    /** Average monthly balance (INR) */
    avgMonthlyBalance?: number;
    /** Last transaction date */
    lastTransactionDate?: string;
    /** Annual turnover from ITR (INR) */
    annualTurnover?: number;
    /** ITR filing year */
    itrFilingYear?: string;
    /** Entity type as claimed */
    entityType?: string;
}

/**
 * APPLICANT-SUBMITTED DOCUMENTS
 * These represent what the applicant uploads. Some data deliberately
 * DISAGREES with the Registry to test contradiction detection.
 */
export const APPLICANT_DOCUMENTS: Record<string, MockDocument> = {
    // ─── Case 1: Genuine (should pass) ───────────────────────────────────
    'REG-CERT': {
        refKey: 'REG-CERT',
        businessName: 'Priya Textiles Pvt Ltd',
        registrationNumber: 'U17111KA2018PTC112345',
        address: '42, MG Road, Bengaluru, Karnataka 560001',
        incorporationDate: '2018-03-15',
        directorName: 'Priya Venkataraman',
        documentQuality: 0.97,
        pan: 'AACPP1234F',       // Valid PAN: 4th char P = Person (but company should be C)
        gstNumber: '29AACPP1234F1Z5', // Real GSTIN format: 29(state) + PAN + 1Z5
        tradeLicenseNumber: 'TL/BLR/2018/4521',
        ownershipType: 'owned',
        photoLocation: { lat: 12.9715, lng: 77.5945 },
        utilityBillAddress: '42, MG Road, Bengaluru, Karnataka 560001', // Matches
        bankAccountName: 'Priya Textiles Pvt Ltd',
        bankAccountNumber: '1234567890123456',
        ifscCode: 'SBIN0001234',
        monthlyTransactions: 45,
        avgMonthlyBalance: 850000,
        lastTransactionDate: '2024-01-10',
        annualTurnover: 12000000,
        itrFilingYear: '2023-24',
        entityType: 'Pvt Ltd',
        udyamNumber: undefined, // Not an MSME
    },

    // ─── Case 2: Suspicious (should flag) ────────────────────────────────
    'STEEL-REG-CERT': {
        refKey: 'STEEL-REG-CERT',
        businessName: 'Coimbatore Steels & Alloys Pvt Ltd',
        registrationNumber: 'U27100TN2015PTC098765',
        address: '15, SIDCO Industrial Estate, Coimbatore, Tamil Nadu 641021',
        incorporationDate: '2015-07-20',
        directorName: 'Rajesh Murugesan',
        documentQuality: 0.91,
        pan: 'INVALID123',       // INVALID PAN format — should be caught
        gstNumber: '33AAACP9876A1Z1', // PAN portion doesn't match claimed PAN
        tradeLicenseNumber: 'TL/CBE/2015/098',
        ownershipType: 'rented',
        photoLocation: { lat: 11.0100, lng: 76.9500 }, // Slight mismatch from claimed address
        utilityBillAddress: '8, Anna Nagar, Coimbatore, Tamil Nadu 641002', // MISMATCH!
        bankAccountName: 'Coimbatore Steel Works',  // Name mismatch with business name!
        bankAccountNumber: '9876543210987654',
        ifscCode: 'ICIC0001234',
        monthlyTransactions: 3,    // Very low activity
        avgMonthlyBalance: 25000,  // Very low balance
        lastTransactionDate: '2023-06-15', // 7 months ago — stale
        annualTurnover: 500000,    // Very low for a steel company
        itrFilingYear: '2022-23',
        entityType: 'Pvt Ltd',
    },

    // ─── Case 3: Ambiguous (needs more evidence) ─────────────────────────
    'APEX-REG-CERT': {
        refKey: 'APEX-REG-CERT',
        businessName: 'Apex Micro Enterprises',
        registrationNumber: 'UDYAM-TN-06-0012345',
        address: '22, Kamaraj Nagar, Tiruppur, Tamil Nadu 641604',
        incorporationDate: '2019-05-10',
        directorName: 'Senthil Krishnamurthy',
        documentQuality: 0.88,
        pan: 'PLMKO6789J',       // Valid PAN format
        udyamNumber: 'UDYAM-TN-06-0012345', // Valid Udyam format
        gstNumber: '33AAGPA5678B1Z9',
        tradeLicenseNumber: 'TL/TPR/2019/332',
        ownershipType: 'owned',
        photoLocation: { lat: 11.1085, lng: 77.3411 },
        utilityBillAddress: '22, Kamaraj Nagar, Tiruppur, Tamil Nadu 641604', // Matches
        bankAccountName: 'Apex Micro Enterprises',
        bankAccountNumber: '5678901234567890',
        ifscCode: 'HDFC0002345',
        monthlyTransactions: 18,
        avgMonthlyBalance: 320000,
        lastTransactionDate: '2024-01-08',
        annualTurnover: 4500000,
        itrFilingYear: '2023-24',
        entityType: 'MSME',
    },

    // ─── Case 4: Digital-only (no physical presence) ─────────────────────
    'DIGITAL-REG-CERT': {
        refKey: 'DIGITAL-REG-CERT',
        businessName: 'Namma Digital Solutions LLP',
        registrationNumber: 'AAH-2345',
        address: '78, 5th Block, Koramangala, Bengaluru, Karnataka 560095',
        incorporationDate: '2021-11-01',
        directorName: 'Arun Kumar Pillai',
        documentQuality: 0.43,    // Very poor quality documents
        pan: 'MNBVC3456K',       // Valid PAN format but low quality scan
        ownershipType: 'rented',
        utilityBillAddress: '78, 5th Block, Koramangala, Bengaluru, Karnataka 560095',
        bankAccountName: 'Namma Digital Solutions',  // Missing "LLP"
        bankAccountNumber: '1111222233334444',
        ifscCode: 'UTIB0003456',
        monthlyTransactions: 8,
        avgMonthlyBalance: 150000,
        lastTransactionDate: '2024-01-05',
        annualTurnover: 1800000,
        itrFilingYear: '2023-24',
        entityType: 'LLP',
    },

    // ─── Case 5: Export business ──────────────────────────────────────────
    'VENKATESWARA-REG-CERT': {
        refKey: 'VENKATESWARA-REG-CERT',
        businessName: 'Sri Venkateswara Exports',
        registrationNumber: 'IEC-0316054321',
        address: '9, Beach Road, Visakhapatnam, Andhra Pradesh 530001',
        incorporationDate: '2016-09-22',
        directorName: 'Hari Prasad Rao',
        documentQuality: 0.82,
        pan: 'QWERT1122P',       // Valid PAN format
        gstNumber: '37AATHR7654C1Z3',
        ownershipType: 'owned',
        bankAccountName: 'Sri Venkateswara Exports',
        bankAccountNumber: '7890123456789012',
        ifscCode: 'SBIN0004567',
        monthlyTransactions: 25,
        avgMonthlyBalance: 520000,
        lastTransactionDate: '2024-01-12',
        annualTurnover: 8500000,
        itrFilingYear: '2023-24',
        entityType: 'Proprietorship',
    },
};
