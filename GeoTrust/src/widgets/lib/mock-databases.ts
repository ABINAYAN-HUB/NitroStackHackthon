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
    authorizedCapital: number;
    paidUpCapital: number;
    lastFilingDate: string;
}

export const REGISTRY_DATASET: RegistryRecord[] = [
    {
        registrationNumber: 'U17111KA2018PTC112345',
        businessName: 'Priya Textiles Pvt Ltd',
        type: 'Pvt Ltd',
        status: 'active',
        incorporationDate: '2018-03-15',
        registeredAddress: '42, MG Road, Bengaluru, Karnataka 560001',
        state: 'Karnataka',
        directorName: 'Priya Venkataraman',
        directorDIN: '09876123',
        gstNumber: '29AAAPP1234F1Z5',
        sector: 'Manufacturing',
        authorizedCapital: 5000000,
        paidUpCapital: 2000000,
        lastFilingDate: '2023-11-20',
    },
    {
        registrationNumber: 'U27100TN2015PTC098765',
        businessName: 'Coimbatore Steels & Alloys Pvt Ltd',
        type: 'Pvt Ltd',
        status: 'active',
        incorporationDate: '2015-07-20',
        registeredAddress: '15, SIDCO Industrial Estate, Coimbatore, Tamil Nadu 641021',
        state: 'Tamil Nadu',
        directorName: 'Rajesh Murugesan',
        directorDIN: '09876124',
        gstNumber: '33AAACP9876A1Z1',
        sector: 'Manufacturing',
        authorizedCapital: 2000000,
        paidUpCapital: 1000000,
        lastFilingDate: '2023-11-20',
    },
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
        gstNumber: '29AACCK3344F1Z8',
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
        lastFilingDate: '2022-12-01',
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

export const WEB_PRESENCE_DB: Record<string, any> = {
    'priya textiles': {
        domain: 'priyatextiles.in',
        domainAgeYears: 5.8,
        hasSocialMedia: true,
        hasGoogleBusinessListing: true,
        hasNewsOrPR: false,
        reviewCount: 47,
        averageRating: 4.2,
        websiteActive: true,
        sslValid: true,
        lastCrawled: '2024-01-10T00:00:00Z',
    },
    'coimbatore steels': {
        domain: 'cbsteels.in',
        domainAgeYears: 0.3, 
        hasSocialMedia: false,
        hasGoogleBusinessListing: false,
        hasNewsOrPR: false,
        reviewCount: 0,
        averageRating: null,
        websiteActive: true,
        sslValid: false,
        lastCrawled: '2024-01-12T00:00:00Z',
    },
    'namma digital': {
        domain: 'nammadigital.io',
        domainAgeYears: 0.1,
        hasSocialMedia: true, 
        hasGoogleBusinessListing: false,
        hasNewsOrPR: false,
        reviewCount: 0,
        averageRating: null,
        websiteActive: false,
        sslValid: false,
        lastCrawled: '2024-01-13T00:00:00Z',
    },
    'apex micro': {
        domain: null, 
        domainAgeYears: 0,
        hasSocialMedia: false,
        hasGoogleBusinessListing: true, 
        hasNewsOrPR: false,
        reviewCount: 12,
        averageRating: 3.8,
        websiteActive: false,
        sslValid: false,
        lastCrawled: '2024-01-14T00:00:00Z',
    },
    'sri venkateswara': {
        domain: 'srivenkatesh-exports.com',
        domainAgeYears: 6.2,
        hasSocialMedia: false,
        hasGoogleBusinessListing: true,
        hasNewsOrPR: true, 
        reviewCount: 31,
        averageRating: 4.0,
        websiteActive: true,
        sslValid: true,
        lastCrawled: '2024-01-11T00:00:00Z',
    },
    'nilgiri coffee traders': {
        domain: 'nilgiricoffeetraders.com',
        domainAgeYears: 4.5,
        hasSocialMedia: true,
        hasGoogleBusinessListing: true,
        hasNewsOrPR: false,
        reviewCount: 42,
        averageRating: 4.5,
        websiteActive: true,
        sslValid: true,
        lastCrawled: '2024-01-16T00:00:00Z',
    },
};

export const MOCK_DOCUMENTS: Record<string, any> = {
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
        documentQuality: 0.91,
    },
    'DIGITAL-REG-CERT': {
        name: 'Namma Digital Solutions LLP',
        registrationNumber: 'AAH-2345',
        address: '78, 5th Block, Koramangala, Bengaluru, Karnataka 560095',
        documentQuality: 0.43,
    },
    'APEX-REG-CERT': {
        name: 'Apex Micro Enterprises',
        registrationNumber: 'UDYAM-TN-06-0012345',
        address: '22, Kamaraj Nagar, Tiruppur, Tamil Nadu 641604',
        documentQuality: 0.88,
    },
    'VENKATESWARA-REG-CERT': {
        name: 'Sri Venkateswara Exports',
        registrationNumber: 'IEC-0316054321',
        address: '9, Beach Road, Visakhapatnam, Andhra Pradesh 530001',
        documentQuality: 0.82,
    },
};
