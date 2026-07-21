export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  size?: string;
  createdTime?: string;
  owners?: { displayName: string; emailAddress?: string; photoLink?: string }[];
}

export interface DriveAbout {
  user: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
  storageQuota: {
    limit: string;
    usage: string;
    usageInDrive: string;
    usageInDriveTrash: string;
  };
}

export async function getDriveAbout(token: string): Promise<DriveAbout> {
  const res = await fetch("https://www.googleapis.com/drive/v3/about?fields=user,storageQuota", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch Google Drive user details: ${errText || res.statusText}`);
  }

  return res.json();
}

export async function listDriveFiles(
  token: string,
  parentId: string = "root",
  searchQuery: string = ""
): Promise<DriveFile[]> {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  
  let q = "trashed = false";
  if (searchQuery) {
    q += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
  } else {
    q += ` and '${parentId}' in parents`;
  }
  
  url.searchParams.set("q", q);
  url.searchParams.set("fields", "files(id, name, mimeType, iconLink, webViewLink, thumbnailLink, size, createdTime, owners)");
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("orderBy", "folder,name");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list Drive files: ${errText || res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

export async function createDriveFolder(
  token: string,
  name: string,
  parentId?: string
): Promise<DriveFile> {
  const metadata: any = {
    name: name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId && parentId !== "root") {
    metadata.parents = [parentId];
  }

  const res = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,createdTime", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create folder: ${errText || res.statusText}`);
  }

  return res.json();
}

export async function uploadDriveFile(
  token: string,
  name: string,
  mimeType: string,
  file: File,
  parentId?: string
): Promise<DriveFile> {
  const metadata: any = {
    name: name,
    mimeType: mimeType,
  };
  if (parentId && parentId !== "root") {
    metadata.parents = [parentId];
  }

  const boundary = "314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const arrayBuffer = await fileDataPromise;

  const encoder = new TextEncoder();
  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const mediaHeader = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;
  const closingBoundary = `${closeDelimiter}`;

  const metadataBytes = encoder.encode(metadataPart);
  const mediaHeaderBytes = encoder.encode(mediaHeader);
  const closingBytes = encoder.encode(closingBoundary);

  const multipartBlob = new Blob([
    metadataBytes,
    mediaHeaderBytes,
    new Uint8Array(arrayBuffer),
    closingBytes
  ], { type: `multipart/related; boundary=${boundary}` });

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,thumbnailLink,size,createdTime", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartBlob,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload file to Google Drive: ${errText || res.statusText}`);
  }

  return res.json();
}

export async function deleteDriveFile(
  token: string,
  fileId: string
): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete file/folder: ${errText || res.statusText}`);
  }

  return true;
}
