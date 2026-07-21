export interface DocumentFile {
  id: string;
  name: string;
  createdTime?: string;
  webViewLink?: string;
}

export interface GoogleDoc {
  documentId: string;
  title: string;
  body?: {
    content: any[];
  };
}

// 1. List Document Files from Google Drive
export async function listDocuments(token: string): Promise<DocumentFile[]> {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", "mimeType = 'application/vnd.google-apps.document' and trashed = false");
  url.searchParams.set("fields", "files(id, name, createdTime, webViewLink)");
  url.searchParams.set("pageSize", "40");
  url.searchParams.set("orderBy", "name");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list documents: ${errText || res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

// 2. Fetch Google Doc structured content
export async function getGoogleDoc(token: string, documentId: string): Promise<GoogleDoc> {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch document content: ${errText || res.statusText}`);
  }

  return res.json();
}

// 3. Helper to extract plain text from Google Doc structure
export function extractDocumentText(doc: GoogleDoc): string {
  if (!doc || !doc.body || !doc.body.content) return "";
  let text = "";
  for (const element of doc.body.content) {
    if (element.paragraph && element.paragraph.elements) {
      for (const el of element.paragraph.elements) {
        if (el.textRun && el.textRun.content) {
          text += el.textRun.content;
        }
      }
    }
  }
  return text;
}

// 4. Create a new Google Doc
export async function createGoogleDoc(token: string, title: string): Promise<GoogleDoc> {
  const res = await fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Google Doc: ${errText || res.statusText}`);
  }

  return res.json();
}

// 5. Update/Append text to document
export async function appendDocumentText(token: string, documentId: string, text: string): Promise<any> {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            text: text,
            endOfSegmentLocation: {} // Appends to the end of the document
          }
        }
      ]
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update Google Doc text: ${errText || res.statusText}`);
  }

  return res.json();
}

// 6. Generate a Professional CRYOVA Creative Campaign Brief Doc
export async function createCampaignBriefDocument(
  token: string, 
  title: string, 
  campaignData: {
    campaignName: string;
    targetAudience: string;
    keyDeliverables: string;
    budget: string;
    timeline: string;
    moodboardDescription: string;
  }
): Promise<GoogleDoc> {
  // Step A: Create Document
  const doc = await createGoogleDoc(token, title);
  const documentId = doc.documentId;

  // Step B: Build dynamic structured brief text
  const briefContent = `=====================================================
CRYOVA CREATIVE BRIEF & DIGITAL CAMPAIGN PLAN
=====================================================

CAMPAIGN DETAILS
-----------------------------------------------------
Campaign Name: ${campaignData.campaignName || "Summer Spark UGC Campaign"}
Creation Date: ${new Date().toLocaleDateString()}
Total Allocated Budget: $${campaignData.budget || "1,500.00"}
Key Timeline: ${campaignData.timeline || "Next 4 Weeks"}

TARGET AUDIENCE & VIBE
-----------------------------------------------------
Target Audience: ${campaignData.targetAudience || "Tech-forward, creator-centric professionals"}
Brand Aesthetic & Moodboard: ${campaignData.moodboardDescription || "Minimalist, sleek, high-contrast, modern display colors."}

KEY CAMPAIGN DELIVERABLES
-----------------------------------------------------
${campaignData.keyDeliverables || "- 3x vertical video shortform deliverables\n- 1x static aesthetic product shot\n- Full license ownership of visual assets"}

NEXT STEP REVIEW CHECKLIST
-----------------------------------------------------
[ ] Connect assets in CRYOVA Studio Portfolio
[ ] Link performance tracking spreadsheet
[ ] Send content to brand coordinator via Messages
[ ] Final contract approval and payout trigger

-----------------------------------------------------
Document powered by Google Workspace and CRYOVA Engine.
`;

  // Step C: Batch update document to append the full brief content
  await appendDocumentText(token, documentId, briefContent);

  return doc;
}
