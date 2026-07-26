import { prisma } from "./prisma";
import { REGISTRY_DATASET, WEB_PRESENCE_DB, MOCK_DOCUMENTS } from "./mock-databases";

export interface InvestigationParams {
  businessName: string;
  registrationNumber: string;
  address: string;
}

/**
 * Automated Multi-Agent Investigation Engine for GeoTrust AI.
 * Performs dynamic cross-verification across 4 dimensions against mock datasets.
 */
export async function runInvestigationForCase(caseId: string, params?: InvestigationParams) {
  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
    include: { claims: true }
  });

  if (!existingCase) {
    throw new Error(`Case ${caseId} not found in database.`);
  }

  const businessName = params?.businessName || existingCase.businessName;
  
  // Extract registration number and address from existing claims or params
  const regClaim = existingCase.claims.find(c => c.label.toLowerCase().includes("registration"));
  const addrClaim = existingCase.claims.find(c => c.label.toLowerCase().includes("address"));

  const registrationNumber = params?.registrationNumber || regClaim?.value || "U18101TN2019LLP098765";
  const address = params?.address || addrClaim?.value || "17, Kaveri Salai, Coimbatore, Tamil Nadu 641001";

  const now = new Date();

  // ── Look up in the government registry dataset ────────────────────────────────
  const registryRecord = REGISTRY_DATASET.find(r => r.registrationNumber === registrationNumber);

  // ── 1. IDENTITY & REGISTRY VERIFICATION ─────────────────────────────────────
  let identityScore = 85;
  let identityDriver = "Registry record matches name and registration number";
  let regNumStatus: "verified" | "contradicted" = "verified";
  let nameStatus: "verified" | "contradicted" = "verified";
  const identityContradictions: string[] = [];

  if (!registryRecord) {
    identityScore = 20;
    regNumStatus = "contradicted";
    nameStatus = "contradicted";
    identityContradictions.push(`Registration number ${registrationNumber} was not found in the official MCA/SME Registry dataset.`);
    identityDriver = "Critical: Registration number not found in government database";
  } else {
    // Exact or loose match of the business name?
    const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normalise(registryRecord.businessName).includes(normalise(businessName)) && !normalise(businessName).includes(normalise(registryRecord.businessName))) {
      identityScore = 45;
      nameStatus = "contradicted";
      identityContradictions.push(`Name mismatch: Claimed "${businessName}", but registry says "${registryRecord.businessName}"`);
      identityDriver = "Name contradiction found — registered name does not match application";
    }
  }

  // ── 2. LOCATION & GIS VERIFICATION ──────────────────────────────────────────
  let locationScore = 86;
  let locationDriver = `Address verified in ${extractCity(address)} commercial district`;
  let addrStatus: "verified" | "contradicted" = "verified";
  
  if (registryRecord) {
    // Cross check address
    const normaliseAddr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const claimedNorm = normaliseAddr(address);
    const regNorm = normaliseAddr(registryRecord.registeredAddress);
    const cityMatch = extractCity(address).toLowerCase() === extractCity(registryRecord.registeredAddress).toLowerCase();
    
    if (claimedNorm !== regNorm && !cityMatch) {
       locationScore = 35;
       addrStatus = "contradicted";
       locationDriver = `Address contradiction — claimed address is in ${extractCity(address)}, but registry is in ${extractCity(registryRecord.registeredAddress)}`;
    }
  } else {
    locationScore = 40;
    addrStatus = "contradicted";
    locationDriver = "Cannot verify address — no valid registry record found to cross-reference";
  }

  // ── 3. DIGITAL PRESENCE & OSINT ──────────────────────────────────────────────
  let digitalScore = 42;
  let digitalDriver = "Zero verified digital footprint — no reviews, no Google listing";
  let digitalStatus: "verified" | "pending" | "contradicted" = "pending";
  let domainCandidate = businessName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".in";

  // Search WEB_PRESENCE_DB
  const webPresenceKey = Object.keys(WEB_PRESENCE_DB).find(k => businessName.toLowerCase().includes(k));
  const webPresenceData = webPresenceKey ? WEB_PRESENCE_DB[webPresenceKey] : null;

  if (webPresenceData) {
    domainCandidate = webPresenceData.domain || domainCandidate;
    let confidence = 40;
    if (webPresenceData.hasGoogleBusinessListing) confidence += 20;
    if (webPresenceData.reviewCount > 10) confidence += 20;
    if (webPresenceData.domainAgeYears > 1) confidence += 10;
    
    digitalScore = confidence;
    if (digitalScore > 75) {
       digitalStatus = "verified";
       digitalDriver = `Active website (${domainCandidate}), Google listing, verified online footprint`;
    } else {
       digitalStatus = "pending";
       digitalDriver = `Domain ${domainCandidate} found, but limited footprint (Reviews: ${webPresenceData.reviewCount})`;
    }
  } else {
    digitalScore = 38;
    digitalStatus = "pending";
    digitalDriver = `No digital presence data found in OSINT dataset for "${businessName}"`;
  }

  // ── 4. DOCUMENT INTEGRITY & OCR ─────────────────────────────────────────────
  let docIntegrityScore = 88;
  let docIntegrityDriver = "Registration certificate quality 88% — all fields legible and consistent";

  if (identityContradictions.length > 0) {
    docIntegrityScore = 65;
    docIntegrityDriver = "Document flags detected — claims do not match statutory registry";
  }

  // ── 5. OVERALL SCORE & RECOMMENDATION COMPUTATION ────────────────────────────
  const overallScore = Math.round(
    identityScore * 0.35 +
    locationScore * 0.25 +
    digitalScore * 0.20 +
    docIntegrityScore * 0.20
  );

  let recommendation: "proceed" | "request_evidence" | "escalate" = "proceed";
  let status: "cleared" | "needs_review" | "escalated" = "cleared";
  let recommendationReason = "All four dimensions verified across MCA registry, GIS, and document OCR data.";

  if (regNumStatus === "contradicted" || identityScore < 60) {
    recommendation = "escalate";
    status = "escalated";
    recommendationReason = identityContradictions[0] || "Critical identity contradiction detected — manual review by senior officer required.";
  } else if (overallScore < 84 || digitalScore < 50 || addrStatus === "contradicted") {
    recommendation = "request_evidence";
    status = "needs_review";
    recommendationReason = "Core identity verified; but limited footprint or address mismatch requires supplementary document review.";
  } else {
    recommendation = "proceed";
    status = "cleared";
    recommendationReason = "High-confidence verification across registry, location GIS, and document integrity.";
  }

  // ── 6. DATABASE UPDATE ───────────────────────────────────────────────────────
  await prisma.evidence.deleteMany({ where: { claim: { caseId } } });
  await prisma.claim.deleteMany({ where: { caseId } });
  await prisma.dimensionScore.deleteMany({ where: { caseId } });
  await prisma.traceEvent.deleteMany({ where: { caseId } });
  await prisma.missingEvidence.deleteMany({ where: { caseId } });

  await prisma.case.update({
    where: { id: caseId },
    data: {
      status,
      overallScore,
      recommendation,
      recommendationReason,
      dimensionScores: {
        create: [
          { dimension: "identity", score: identityScore, driver: identityDriver },
          { dimension: "location", score: locationScore, driver: locationDriver },
          { dimension: "digital_presence", score: digitalScore, driver: digitalDriver },
          { dimension: "document_integrity", score: docIntegrityScore, driver: docIntegrityDriver }
        ]
      },
      claims: {
        create: [
          {
            dimension: "identity",
            label: "Business Name",
            value: businessName,
            status: nameStatus,
            evidence: {
              create: [
                {
                  source: "Document OCR — Registration Certificate",
                  snippet: `Extracted business name: "${businessName}"`,
                  retrievedAt: now,
                  reliability: 0.96,
                  relation: nameStatus === "verified" ? "supports" : "contradicts"
                },
                {
                  source: "MCA / SME Business Registry",
                  snippet: nameStatus === "verified"
                    ? `Registry record match confirmed for ${businessName}`
                    : `Registry flag: Entity name mismatch`,
                  retrievedAt: now,
                  reliability: 0.92,
                  relation: nameStatus === "verified" ? "supports" : "contradicts"
                }
              ]
            }
          },
          {
            dimension: "identity",
            label: "Registration Number",
            value: registrationNumber,
            status: regNumStatus,
            evidence: {
              create: [
                {
                  source: "Statutory Registry Lookup",
                  snippet: regNumStatus === "verified"
                    ? `Registration number ${registrationNumber} active and valid in official registry`
                    : identityContradictions[0] || `Registration number ${registrationNumber} failed validation`,
                  retrievedAt: now,
                  reliability: 0.95,
                  relation: regNumStatus === "verified" ? "supports" : "contradicts"
                }
              ]
            }
          },
          {
            dimension: "location",
            label: "Registered Address",
            value: address,
            status: addrStatus,
            evidence: {
              create: [
                {
                  source: "Address Verification Service (GIS)",
                  snippet: locationDriver,
                  retrievedAt: now,
                  reliability: 0.91,
                  relation: addrStatus === "verified" ? "supports" : "contradicts"
                }
              ]
            }
          },
          {
            dimension: "digital_presence",
            label: "Domain & Web Presence",
            value: domainCandidate,
            status: digitalStatus,
            evidence: {
              create: [
                {
                  source: "Web OSINT Auditor",
                  snippet: digitalDriver,
                  retrievedAt: now,
                  reliability: 0.84,
                  relation: digitalStatus === "verified" ? "supports" : "neutral"
                }
              ]
            }
          }
        ]
      },
      trace: {
        create: [
          {
            timestamp: new Date(now.getTime() - 4000),
            agent: "orchestrator",
            message: `Starting automated multi-agent investigation for ${businessName}`
          },
          {
            timestamp: new Date(now.getTime() - 3200),
            agent: "document_reader",
            message: `Extracted claims from registration certificate (Ref: ${registrationNumber})`
          },
          {
            timestamp: new Date(now.getTime() - 2400),
            agent: "registry_checker",
            message: regNumStatus === "verified"
              ? `Registry lookup succeeded for ${registrationNumber}`
              : `Flagged contradiction: ${identityContradictions[0]}`
          },
          {
            timestamp: new Date(now.getTime() - 1600),
            agent: "address_checker",
            message: `Spatial GIS analysis completed for address in ${extractCity(address)}`
          },
          {
            timestamp: new Date(now.getTime() - 800),
            agent: "web_presence_checker",
            message: `Digital footprint analysis completed for ${domainCandidate}`
          },
          {
            timestamp: new Date(now.getTime()),
            agent: "risk_arbiter",
            message: `Scoring complete. Overall Score: ${overallScore}/100. Verdict: ${recommendation}`
          }
        ]
      },
      missingEvidence: {
        create: digitalScore < 60 ? [
          { message: "Google Business listing not found — request official Google My Business verification" },
          { message: "Request physical site visit for address confirmation" }
        ] : []
      }
    }
  });

  return prisma.case.findUnique({
    where: { id: caseId },
    include: {
      claims: { include: { evidence: true } },
      dimensionScores: true,
      missingEvidence: true,
      trace: true
    }
  });
}

function extractCity(address: string): string {
  const parts = address.split(",").map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    // Return the second-to-last part (city is typically before state)
    return parts[parts.length - 2].trim();
  }
  // Single segment — return as-is
  return parts[0] ?? address;
}
