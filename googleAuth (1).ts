import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";

export const GMAIL_SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify"
];

export const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata"
];

export const SHEETS_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/spreadsheets.readonly"
];

export const DOCS_SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly"
];

let cachedAccessToken: string | null = null;
let cachedDriveToken: string | null = null;
let cachedSheetsToken: string | null = null;
let cachedDocsToken: string | null = null;

export const connectGmail = async (): Promise<string> => {
  const provider = new GoogleAuthProvider();
  GMAIL_SCOPES.forEach(scope => provider.addScope(scope));
  
  // Prompt account selection
  provider.setCustomParameters({
    prompt: "select_account"
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error("Failed to obtain access token from Google Sign-In.");
  }
  
  cachedAccessToken = credential.accessToken;
  // Cache in sessionStorage to persist across hot reloads or route changes safely
  sessionStorage.setItem("gmail_access_token", cachedAccessToken);
  return cachedAccessToken;
};

export const getGmailToken = (): string | null => {
  if (!cachedAccessToken) {
    cachedAccessToken = sessionStorage.getItem("gmail_access_token");
  }
  return cachedAccessToken;
};

export const disconnectGmail = () => {
  cachedAccessToken = null;
  sessionStorage.removeItem("gmail_access_token");
};

// Google Drive Auth Integration
export const connectDrive = async (): Promise<string> => {
  const provider = new GoogleAuthProvider();
  DRIVE_SCOPES.forEach(scope => provider.addScope(scope));
  
  provider.setCustomParameters({
    prompt: "select_account"
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error("Failed to obtain Google Drive access token from Google Sign-In.");
  }
  
  cachedDriveToken = credential.accessToken;
  sessionStorage.setItem("drive_access_token", cachedDriveToken);
  return cachedDriveToken;
};

export const getDriveToken = (): string | null => {
  if (!cachedDriveToken) {
    cachedDriveToken = sessionStorage.getItem("drive_access_token");
  }
  return cachedDriveToken;
};

export const disconnectDrive = () => {
  cachedDriveToken = null;
  sessionStorage.removeItem("drive_access_token");
};

export const connectSheets = async (): Promise<string> => {
  const provider = new GoogleAuthProvider();
  SHEETS_SCOPES.forEach(scope => provider.addScope(scope));
  
  provider.setCustomParameters({
    prompt: "select_account"
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error("Failed to obtain Google Sheets access token from Google Sign-In.");
  }
  
  cachedSheetsToken = credential.accessToken;
  sessionStorage.setItem("sheets_access_token", cachedSheetsToken);
  return cachedSheetsToken;
};

export const getSheetsToken = (): string | null => {
  if (!cachedSheetsToken) {
    cachedSheetsToken = sessionStorage.getItem("sheets_access_token");
  }
  return cachedSheetsToken;
};

export const disconnectSheets = () => {
  cachedSheetsToken = null;
  sessionStorage.removeItem("sheets_access_token");
};

export const connectDocs = async (): Promise<string> => {
  const provider = new GoogleAuthProvider();
  DOCS_SCOPES.forEach(scope => provider.addScope(scope));
  
  provider.setCustomParameters({
    prompt: "select_account"
  });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) {
    throw new Error("Failed to obtain Google Docs access token from Google Sign-In.");
  }
  
  cachedDocsToken = credential.accessToken;
  sessionStorage.setItem("docs_access_token", cachedDocsToken);
  return cachedDocsToken;
};

export const getDocsToken = (): string | null => {
  if (!cachedDocsToken) {
    cachedDocsToken = sessionStorage.getItem("docs_access_token");
  }
  return cachedDocsToken;
};

export const disconnectDocs = () => {
  cachedDocsToken = null;
  sessionStorage.removeItem("docs_access_token");
};

