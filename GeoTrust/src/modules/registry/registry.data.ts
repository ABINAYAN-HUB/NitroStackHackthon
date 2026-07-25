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
        registrationNumber: 'U17111KA2018PTC112345',
        businessName: 'Priya Textiles Pvt Ltd',
        type: 'Pvt Ltd',
        status: 'active',
        incorporationDate: '2018-03-15',
        registeredAddress: '42, MG Road, Bengaluru, Karnataka 560001',
        state: 'Karnataka',
        directorName: 'Priya Venkataraman',
        directorDIN: '08234567',
        gstNumber: '29AAAPP1234F1Z5',
        sector: 'Textiles & Garments',
        authorizedCapital: 5000000,
        paidUpCapital: 3000000,
        lastFilingDate: '2023-10-31',
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
        directorDIN: '07654321',
        gstNumber: '33AAACP9876A1Z1',
        sector: 'Steel & Metal Products',
        authorizedCapital: 10000000,
        paidUpCapital: 7500000,
        lastFilingDate: '2022-08-15', // outdated filing — red flag
    },
    {
        registrationNumber: 'AAH-2345',
        businessName: 'Namma Digital Solutions LLP',
        type: 'LLP',
        status: 'under_review', // compliance issue
        incorporationDate: '2021-11-01',
        registeredAddress: '78, 5th Block, Koramangala, Bengaluru, Karnataka 560095',
        state: 'Karnataka',
        directorName: 'Arun Kumar Pillai',
        directorDIN: '09123456',
        gstNumber: null, // not registered for GST — red flag
        sector: 'IT Services',
        authorizedCapital: 1000000,
        paidUpCapital: 500000,
        lastFilingDate: '2023-01-20',
    },
    {
        registrationNumber: 'UDYAM-TN-06-0012345',
        businessName: 'Apex Micro Enterprises',
        type: 'MSME',
        status: 'active',
        incorporationDate: '2019-05-10',
        registeredAddress: '22, Kamaraj Nagar, Tiruppur, Tamil Nadu 641604',
        state: 'Tamil Nadu',
        directorName: 'Senthil Krishnamurthy',
        directorDIN: '08765432',
        gstNumber: '33AAGPA5678B1Z9',
        sector: 'Hosiery & Knitwear',
        authorizedCapital: 2500000,
        paidUpCapital: 2000000,
        lastFilingDate: '2023-09-30',
    },
    {
        registrationNumber: 'IEC-0316054321',
        businessName: 'Sri Venkateswara Exports',
        type: 'Proprietorship',
        status: 'active',
        incorporationDate: '2016-09-22',
        registeredAddress: '9, Beach Road, Visakhapatnam, Andhra Pradesh 530001',
        state: 'Andhra Pradesh',
        directorName: 'Hari Prasad Rao',
        directorDIN: '07890123',
        gstNumber: '37AATHR7654C1Z3',
        sector: 'Export — Seafood & Marine Products',
        authorizedCapital: 3000000,
        paidUpCapital: 2200000,
        lastFilingDate: '2023-07-31',
    },
    // Additional decoy records to make the registry browsable
    {
        registrationNumber: 'U74999MH2020PTC345678',
        businessName: 'Mumbai Tech Ventures Pvt Ltd',
        type: 'Pvt Ltd',
        status: 'active',
        incorporationDate: '2020-01-10',
        registeredAddress: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
        state: 'Maharashtra',
        directorName: 'Vikram Nair',
        directorDIN: '09543210',
        gstNumber: '27AAACM4321D1Z2',
        sector: 'Technology Services',
        authorizedCapital: 20000000,
        paidUpCapital: 15000000,
        lastFilingDate: '2023-11-15',
    },
    {
        registrationNumber: 'U45200KL2017PLC223344',
        businessName: 'Kerala Spices Trading Co Pvt Ltd',
        type: 'Pvt Ltd',
        status: 'active',
        incorporationDate: '2017-04-12',
        registeredAddress: '33, SM Street, Kozhikode, Kerala 673001',
        state: 'Kerala',
        directorName: 'Thomas Mathew',
        directorDIN: '07123098',
        gstNumber: '32AAACK8901E1Z8',
        sector: 'Agricultural Commodities',
        authorizedCapital: 4000000,
        paidUpCapital: 2800000,
        lastFilingDate: '2023-08-20',
    },
    {
        registrationNumber: 'U55200WB2014PTC112233',
        businessName: 'Kolkata Jute Mills Pvt Ltd',
        type: 'Pvt Ltd',
        status: 'struck_off', // no longer active
        incorporationDate: '2014-06-01',
        registeredAddress: '12, Strand Road, Kolkata, West Bengal 700001',
        state: 'West Bengal',
        directorName: 'Debabrata Ghosh',
        directorDIN: '06987654',
        gstNumber: null,
        sector: 'Jute & Textiles',
        authorizedCapital: 5000000,
        paidUpCapital: 1000000,
        lastFilingDate: '2019-03-15',
    },
];
