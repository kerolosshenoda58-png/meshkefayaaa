export interface SpreadsheetFile {
  id: string;
  name: string;
  createdTime?: string;
  webViewLink?: string;
}

export interface SheetMetadata {
  title: string;
  sheets: {
    properties: {
      sheetId: number;
      title: string;
      index: number;
    };
  }[];
}

export interface SheetValues {
  range: string;
  majorDimension: string;
  values?: string[][];
}

// 1. List Spreadsheet Files from Google Drive
export async function listSpreadsheets(token: string): Promise<SpreadsheetFile[]> {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  url.searchParams.set("fields", "files(id, name, createdTime, webViewLink)");
  url.searchParams.set("pageSize", "40");
  url.searchParams.set("orderBy", "name");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list spreadsheets: ${errText || res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

// 2. Get Spreadsheet metadata (sheets list, title)
export async function getSpreadsheetMetadata(token: string, spreadsheetId: string): Promise<SheetMetadata> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch spreadsheet metadata: ${errText || res.statusText}`);
  }

  return res.json();
}

// 3. Get Sheet Cell Values
export async function getSheetValues(token: string, spreadsheetId: string, range: string): Promise<SheetValues> {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to read sheet cells: ${errText || res.statusText}`);
  }

  return res.json();
}

// 4. Append row to spreadsheet
export async function appendSheetRow(
  token: string,
  spreadsheetId: string,
  range: string,
  rowValues: string[]
): Promise<any> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to add campaign row to Google Sheet: ${errText || res.statusText}`);
  }

  return res.json();
}

// 5. Create a brand-new CRYOVA Campaign Sheet Tracker
export async function createCampaignSpreadsheet(token: string, title: string): Promise<any> {
  const initialHeaders = [
    "Campaign ID",
    "Campaign Name",
    "Creator / Partner",
    "Deliverable Type",
    "Status",
    "Budget ($)",
    "Revenue / ROI ($)",
    "Date Tracked"
  ];

  const defaultSampleRow = [
    "CAMP-101",
    "Summer Spark UGC Campaign",
    "Jane Miller",
    "Video (Reels)",
    "Active",
    "1500",
    "2400",
    new Date().toISOString().split("T")[0]
  ];

  // Step A: Create spreadsheet
  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: "CRYOVA Campaign Tracker",
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create spreadsheet: ${errText || res.statusText}`);
  }

  const sheetData = await res.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Step B: Append initial headers and a sample row to the new sheet
  await appendSheetRow(token, spreadsheetId, "CRYOVA Campaign Tracker!A1", initialHeaders);
  await appendSheetRow(token, spreadsheetId, "CRYOVA Campaign Tracker!A2", defaultSampleRow);

  return sheetData;
}
