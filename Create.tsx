import React, { useState, useEffect, useRef } from "react";
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  File, 
  Video, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Search, 
  ArrowLeft, 
  ExternalLink, 
  LogOut, 
  RefreshCw, 
  Loader2, 
  Sparkles, 
  Plus, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useAuth } from "../components/AuthProvider";
import { connectDrive, getDriveToken, disconnectDrive } from "../lib/googleAuth";
import { 
  listDriveFiles, 
  createDriveFolder, 
  uploadDriveFile, 
  deleteDriveFile, 
  getDriveAbout, 
  DriveFile, 
  DriveAbout 
} from "../lib/driveService";

interface Breadcrumb {
  id: string;
  name: string;
}

export default function Create() {
  const { userData } = useAuth();
  const role = userData?.role || "creator";

  // State Management
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveAbout, setDriveAbout] = useState<DriveAbout | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentFolder, setCurrentFolder] = useState<string>("root");
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: "root", name: "Root" }]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Create Folder Dialog State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [creatingFolder, setCreatingFolder] = useState<boolean>(false);

  // File Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check stored Drive token on mount
  useEffect(() => {
    const token = getDriveToken();
    if (token) {
      setDriveToken(token);
      loadDriveData(token, "root");
    }
  }, []);

  // Fetch file list and profile/about information
  const loadDriveData = async (token: string, folderId: string, search: string = "") => {
    setLoading(true);
    try {
      // 1. Fetch about info in background
      getDriveAbout(token).then(setDriveAbout).catch(err => {
        console.warn("Failed to fetch Drive quota info:", err);
      });

      // 2. Fetch files
      const fileList = await listDriveFiles(token, folderId, search);
      setFiles(fileList);
    } catch (err: any) {
      console.error("Google Drive load error:", err);
      if (err.message?.includes("401") || err.message?.includes("unauthorized") || err.message?.includes("Unauthorized")) {
        toast.error("Drive session expired. Please connect again.");
        handleDisconnect();
      } else {
        toast.error("Failed to fetch contents from Google Drive.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In / Scope Connection
  const handleConnect = async () => {
    const loader = toast.loading("Connecting your Google Drive account...");
    try {
      const token = await connectDrive();
      setDriveToken(token);
      toast.dismiss(loader);
      toast.success("Successfully integrated Google Drive with CRYOVA!");
      loadDriveData(token, "root");
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error(err.message || "Failed to authorize Google Drive integration.");
    }
  };

  const handleDisconnect = () => {
    disconnectDrive();
    setDriveToken(null);
    setDriveAbout(null);
    setFiles([]);
    setBreadcrumbs([{ id: "root", name: "Root" }]);
    setCurrentFolder("root");
    toast.success("Disconnected Google Drive");
  };

  // Navigation handlers
  const navigateToFolder = (folderId: string, folderName: string) => {
    const index = breadcrumbs.findIndex(b => b.id === folderId);
    let newBreadcrumbs = [...breadcrumbs];

    if (index !== -1) {
      // Navigating back via breadcrumbs
      newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    } else {
      // Navigating deeper
      newBreadcrumbs.push({ id: folderId, name: folderName });
    }

    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolder(folderId);
    setSearchQuery("");
    if (driveToken) {
      loadDriveData(driveToken, folderId);
    }
  };

  // Search trigger
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (driveToken) {
      loadDriveData(driveToken, currentFolder, searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (driveToken) {
      loadDriveData(driveToken, currentFolder, "");
    }
  };

  // Create folder operation
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !driveToken) return;

    setCreatingFolder(true);
    try {
      await createDriveFolder(driveToken, newFolderName.trim(), currentFolder);
      toast.success(`Folder '${newFolderName}' created successfully!`);
      setNewFolderName("");
      setIsFolderModalOpen(false);
      // Reload current folder contents
      loadDriveData(driveToken, currentFolder);
    } catch (err: any) {
      toast.error(err.message || "Failed to create folder.");
    } finally {
      setCreatingFolder(false);
    }
  };

  // File Upload operations
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !driveToken) return;

    setIsUploading(true);
    setUploadProgress("Reading asset content...");
    try {
      await uploadDriveFile(
        driveToken,
        selectedFile.name,
        selectedFile.type || "application/octet-stream",
        selectedFile,
        currentFolder
      );
      toast.success(`Successfully uploaded '${selectedFile.name}' to Drive!`);
      loadDriveData(driveToken, currentFolder);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete file operation (Includes the required User Confirmation dialog!)
  const handleDelete = async (file: DriveFile) => {
    const isFolder = file.mimeType === "application/vnd.google-apps.folder";
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the ${isFolder ? "folder" : "file"} '${file.name}'? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    const loader = toast.loading(`Deleting ${file.name}...`);
    try {
      if (!driveToken) return;
      await deleteDriveFile(driveToken, file.id);
      toast.dismiss(loader);
      toast.success(`${isFolder ? "Folder" : "File"} deleted successfully.`);
      loadDriveData(driveToken, currentFolder);
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error(err.message || "Failed to delete item.");
    }
  };

  // Render proper icon based on mimeType
  const renderFileIcon = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder") {
      return <Folder className="w-8 h-8 text-amber-400 fill-amber-100" />;
    }
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8 text-emerald-500 fill-emerald-50" />;
    }
    if (mimeType.startsWith("video/")) {
      return <Video className="w-8 h-8 text-rose-500 fill-rose-50" />;
    }
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) {
      return <FileText className="w-8 h-8 text-blue-500 fill-blue-50" />;
    }
    return <File className="w-8 h-8 text-gray-500 fill-gray-50" />;
  };

  // Helper to format bytes to readable strings
  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return "N/A";
    const bytes = parseInt(bytesStr);
    if (isNaN(bytes)) return "N/A";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#141414] uppercase">
            {role === "creator" ? "Creator Portfolio Studio" : "Brand Creative briefs"}
          </h1>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
            Cloud asset hub powered by Google Drive
          </p>
        </div>

        {driveToken && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button 
              onClick={() => loadDriveData(driveToken, currentFolder)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-all hover:rotate-45"
              title="Refresh files"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
            >
              <LogOut className="w-3 h-3" /> Disconnect
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!driveToken ? (
            /* DISCONNECTED / HERO SCREEN */
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto my-12"
            >
              <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200/60 shadow-xl relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#BEF264] opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500 opacity-10 blur-3xl"></div>
                
                <div className="w-16 h-16 bg-gradient-to-tr from-[#141414] to-gray-700 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <HardDrive className="w-8 h-8" />
                </div>

                <span className="px-3 py-1 bg-purple-100 text-[#A855F7] text-[9px] font-black uppercase tracking-widest rounded-full">
                  Cloud Workspace
                </span>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#141414] mt-4 mb-3 uppercase">
                  Bring Your Google Drive Portfolio
                </h2>

                <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto mb-8 font-medium">
                  Securely link your Google Drive workspace to seamlessly manage video deliverables, image assets, contracts, and creative briefs directly inside the CRYOVA control panel.
                </p>

                {/* Sign in with Google Button (Styled properly per constraints) */}
                <button 
                  onClick={handleConnect}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#141414] text-white hover:bg-gray-800 transition-all rounded-2xl shadow-lg hover:shadow-xl font-black text-xs uppercase tracking-widest"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  Connect Google Drive
                </button>

                <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#141414]">100%</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-black">Secure OAuth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#141414]">No Storage</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-black">Limits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#141414]">UGC</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-black">Optimized</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* CONNECTED EXPLORER SCREEN */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* CLOUD STORAGE QUOTA INFO BAR */}
              {driveAbout && (
                <div className="bg-white rounded-3xl p-4 md:p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                      {driveAbout.user.photoLink ? (
                        <img referrerPolicy="no-referrer" src={driveAbout.user.photoLink} alt={driveAbout.user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#141414] flex items-center justify-center text-white text-xs font-serif italic">
                          {driveAbout.user.displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#141414]">{driveAbout.user.displayName}</h4>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">{driveAbout.user.emailAddress}</p>
                    </div>
                  </div>

                  {driveAbout.storageQuota.limit && (
                    <div className="flex-1 max-w-xs w-full text-right">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">
                        <span>Drive Storage Used</span>
                        <span>
                          {formatBytes(driveAbout.storageQuota.usage)} / {formatBytes(driveAbout.storageQuota.limit)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, (parseInt(driveAbout.storageQuota.usage) / parseInt(driveAbout.storageQuota.limit)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ACTION TOOLBAR */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search / Filter input */}
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search files/folders in current view..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-8 py-2 w-full bg-white border border-gray-200 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#A855F7]/20 transition-all font-medium"
                    />
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-[#141414]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#141414] hover:bg-gray-800 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Search
                  </button>
                </form>

                {/* Create/Upload Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => setIsFolderModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-[#141414] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> New Folder
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#A855F7] hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" /> Upload File
                      </>
                    )}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </div>
              </div>

              {/* UPLOAD STATUS IN PROGRESS */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-[#A855F7] animate-spin" />
                        <div>
                          <p className="text-xs font-bold text-[#141414] uppercase tracking-wider">Uploading content asset</p>
                          <p className="text-[10px] text-gray-500 font-medium">{uploadProgress}</p>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 bg-purple-100 text-[#A855F7] uppercase tracking-widest font-black rounded-md">
                        In Progress
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BREADCRUMBS NAVIGATION */}
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 overflow-x-auto pb-1">
                <HardDrive className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.id}>
                    {idx > 0 && <span className="text-gray-300">/</span>}
                    <button 
                      onClick={() => navigateToFolder(crumb.id, crumb.name)}
                      disabled={idx === breadcrumbs.length - 1}
                      className={cn(
                        "hover:text-[#141414] transition-colors whitespace-nowrap",
                        idx === breadcrumbs.length - 1 ? "text-[#141414] cursor-default font-black" : ""
                      )}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* FILE EXPLORER LIST */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#A855F7]" />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Syncing Folder Contents...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-16 text-center max-w-sm mx-auto">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-sm text-[#141414] mb-1">Folder is Empty</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium mb-6">
                      This Drive workspace has no files here. Tap "Upload File" to add your media assets or create folders.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-100 text-[#141414] hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Upload media
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 px-6 py-3.5 bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <div className="col-span-6 sm:col-span-7">Name</div>
                      <div className="col-span-3 sm:col-span-2 text-right">Size</div>
                      <div className="col-span-3 text-right">Actions</div>
                    </div>

                    {/* Files Loop */}
                    {files.map((file) => {
                      const isFolder = file.mimeType === "application/vnd.google-apps.folder";
                      return (
                        <div 
                          key={file.id} 
                          className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
                        >
                          {/* File Name & Icon */}
                          <div className="col-span-6 sm:col-span-7 flex items-center gap-3.5 min-w-0">
                            <div className="flex-shrink-0">
                              {renderFileIcon(file.mimeType)}
                            </div>
                            <div className="min-w-0">
                              {isFolder ? (
                                <button 
                                  onClick={() => navigateToFolder(file.id, file.name)}
                                  className="font-bold text-sm text-[#141414] hover:text-[#A855F7] transition-all text-left truncate block w-full focus:outline-none"
                                >
                                  {file.name}
                                </button>
                              ) : (
                                <span className="font-bold text-sm text-[#141414] truncate block">
                                  {file.name}
                                </span>
                              )}
                              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest block mt-0.5">
                                {isFolder ? "Folder" : file.mimeType.split("/")[1]?.toUpperCase() || "File"}
                              </span>
                            </div>
                          </div>

                          {/* File Size */}
                          <div className="col-span-3 sm:col-span-2 text-right text-xs font-semibold text-gray-500">
                            {isFolder ? "—" : formatBytes(file.size)}
                          </div>

                          {/* Actions */}
                          <div className="col-span-3 flex items-center justify-end gap-2.5">
                            {!isFolder && file.webViewLink && (
                              <a 
                                href={file.webViewLink} 
                                target="_blank" 
                                rel="referrer noopener"
                                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button 
                              onClick={() => handleDelete(file)}
                              className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CREATE FOLDER DIALOG MODAL */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 relative"
          >
            <h3 className="font-bold text-lg text-[#141414] mb-2 uppercase tracking-tight">Create New Folder</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">Organize your campaign deliverables and briefing documents.</p>
            
            <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Folder Name (e.g., Summer UGC Campaign)"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#A855F7]/20 transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creatingFolder || !newFolderName.trim()}
                  className="px-5 py-2 bg-[#A855F7] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {creatingFolder ? "Creating..." : "Create Folder"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
