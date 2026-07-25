// Mock Indian SME Business Registry Dataset
// Exposed as a NitroStack Resource: registry://businesses
// Browsable in NitroStudio's Resources page

export interface RegistryRecord {
    registrationNumber: string;
    businessName: string;
    type: string; // 'Pvt Ltd' | 'LLP' | 'Proprietorship' | 'MSME'
    status: 'active' | 'inactive' | 'struck_off' | 'under_review';
    incorporationDate: string;
    registeredAddress: string;
    state: string;
    directorName: string;
    directorDIN: string;
    gstNumber: string | null;
    sector: string;
    authorizedCapital: number; // INR
    paidUpCapital: number; // INR
    lastFilingDate: string;
}

export const REGISTRY_DATASET: RegistryRecord[] = [
    {
        registrationNumber: 'U01111KA2020PTC334455',
        businessName: 'Kaveri AgriTech Pvt Ltd',
        type: 'Pvt Ltd',
        status: 'active',
        incorporationDate: '2020-04-10',
        registeredAddress: '10, Farm Road, Mysuru, Karnataka 570001',
        state: 'Karnataka',
        directorName: 'Suresh Patel',
        directorDIN: '09876123',
        gstNumber: '29AACCK3344F1Z8', // Checksum formula match for valid
        sector: 'Agriculture',
        authorizedCapital: 2000000,
        paidUpCapital: 1000000,
        lastFilingDate: '2023-11-20',
    },
    {
        registrationNumber: 'LLP-MH-9988',
        businessName: 'Nexus Global Trading LLP',
        type: 'LLP',
        status: 'active',
        incorporationDate: '2022-08-15',
        registeredAddress: '99, Marine Drive, Mumbai, Maharashtra 400020',
        state: 'Maharashtra',
        directorName: 'Amit Singh',
        directorDIN: '09998877',
        gstNumber: '27AAACN1234E1Z4',
        sector: 'General Trading',
        authorizedCapital: 500000,
        paidUpCapital: 100000,
        lastFilingDate: '2022-12-01', // Stale filing
    },
    {
        registrationNumber: 'UDYAM-TN-02-9876543',
        businessName: 'Balaji Hardware Store',
        type: 'MSME',
        status: 'active',
        incorporationDate: '2012-05-20',
        registeredAddress: '15, Market Street, Madurai, Tamil Nadu 625001',
        state: 'Tamil Nadu',
        directorName: 'Rajan Kumar',
        directorDIN: '01112222',
        gstNumber: '33AAGPB1111C1Z7',
        sector: 'Retail',
        authorizedCapital: 1500000,
        paidUpCapital: 1500000,
        lastFilingDate: '2023-09-30',
    }
];
