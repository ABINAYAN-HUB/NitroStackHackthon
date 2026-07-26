import { prisma } from '../lib/prisma';
import { runInvestigationForCase } from '../lib/investigation-engine';

async function runTests() {
  const testCases = [
    {
      name: "1. Perfect Match (Priya Textiles)",
      businessName: "Priya Textiles Pvt Ltd",
      registrationNumber: "U17111KA2018PTC112345",
      address: "42, MG Road, Bengaluru, Karnataka 560001"
    },
    {
      name: "2. Registry Match, No Web Presence (Kaveri AgriTech)",
      businessName: "Kaveri AgriTech Pvt Ltd",
      registrationNumber: "U01111KA2020PTC334455",
      address: "10, Farm Road, Mysuru, Karnataka 570001"
    },
    {
      name: "3. Address Mismatch (Nexus Global)",
      businessName: "Nexus Global Trading LLP",
      registrationNumber: "LLP-MH-9988",
      address: "15, Market Street, Madurai, Tamil Nadu 625001" // Wrong address
    },
    {
      name: "4. Total Fake / Invalid Registry (Coastal Marine)",
      businessName: "Coastal Marine Exports Pvt Ltd",
      registrationNumber: "INVALID-000",
      address: "12, Beach Road, Visakhapatnam, Andhra Pradesh 530001"
    },
    {
      name: "5. Perfect Match (Coimbatore Steels)",
      businessName: "Coimbatore Steels & Alloys Pvt Ltd",
      registrationNumber: "U27100TN2015PTC098765",
      address: "15, SIDCO Industrial Estate, Coimbatore, Tamil Nadu 641021"
    },
    {
      name: "6. Perfect Match (Balaji Hardware)",
      businessName: "Balaji Hardware Store",
      registrationNumber: "UDYAM-TN-02-9876543",
      address: "15, Market Street, Madurai, Tamil Nadu 625001"
    },
    {
      name: "7. Fraud Ring / Invalid Registry (Global Tech Solutions)",
      businessName: "Global Tech Solutions LLP",
      registrationNumber: "FAKE-REG-8899",
      address: "42, MG Road, Bengaluru, Karnataka 560001"
    }
  ];

  for (const tc of testCases) {
    console.log(`\n==========================================`);
    console.log(`Running Test Case: ${tc.name}`);
    console.log(`==========================================`);
    
    // Create dummy case
    const c = await prisma.case.create({
      data: {
        businessName: tc.businessName,
        status: 'investigating',
        claims: {
          create: [
            { dimension: 'identity', label: 'Registration Number', value: tc.registrationNumber, status: 'pending' },
            { dimension: 'location', label: 'Registered Address', value: tc.address, status: 'pending' }
          ]
        }
      }
    });

    try {
      const result = await runInvestigationForCase(c.id, tc);
      if (result) {
        console.log(`Verdict: ${result.recommendation?.toUpperCase() || "NONE"} (${result.status})`);
        console.log(`Overall Score: ${result.overallScore}`);
        console.log(`Reason: ${result.recommendationReason}`);
        console.log(`\nDimension Scores:`);
        result.dimensionScores.forEach(ds => {
          console.log(`  - ${ds.dimension.toUpperCase()}: ${ds.score}/100 -> ${ds.driver}`);
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  console.log("\nDone!");
}

runTests().finally(() => prisma.$disconnect());
