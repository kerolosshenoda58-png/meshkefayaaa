import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  RefreshCw, 
  LogOut, 
  Loader2, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  PenTool, 
  FileEdit, 
  FilePlus2,
  Bookmark,
  Send,
  CheckCircle2,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useAuth } from "../components/AuthProvider";
import { connectDocs, getDocsToken, disconnectDocs } from "../lib/googleAuth";
import { 
  listDocuments, 
  getGoogleDoc, 
  extractDocumentText, 
  appendDocumentText, 
  createCampaignBriefDocument, 
  DocumentFile, 
  GoogleDoc 
} from "../lib/docsService";
import { deleteDriveFile } from "../lib/driveService";

export default function CampaignDocs() {
  const { userData } = useAuth();
  const role = userData?.role || "creator";

  // Auth State
  const [token, setToken] = useState<string | null>(null);
  
  // Document Lists State
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selected Doc Detail View (Reader / Editor Mode)
  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null);
  const [docContent, setDocContent] = useState<GoogleDoc | null>(null);
  const [docPlainText, setDocPlainText] = useState<string>("");
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);

  // Quick Append/Update State
  const [notesToAppend, setNotesToAppend] = useState<string>("");
  const [submittingNote, setSubmittingNote] = useState<boolean>(false);

  // Create Campaign Brief Dialog State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [creatingBrief, setCreatingBrief] = useState<boolean>(false);
  const [briefForm, setBriefForm] = useState({
    campaignName: "",
    targetAudience: "",
    keyDeliverables: "",
    budget: "",
    timeline: "",
    moodboardDescription: ""
  });

  // Load token on mount
  useEffect(() => {
    const cached = getDocsToken();
    if (cached) {
      setToken(cached);
      loadDocumentList(cached);
    }
  }, []);

  // Fetch list of docs
  const loadDocumentList = async (accessToken: string) => {
    setLoadingList(true);
    try {
      const files = await listDocuments(accessToken);
      setDocuments(files);
    } catch (err: any) {
      console.error("Error fetching Google Docs:", err);
      if (err.message?.includes("401") || err.message?.includes("unauthorized") || err.message?.includes("Unauthorized")) {
        toast.error("Google Docs session expired. Please connect again.");
        handleDisconnect();
      } else {
        toast.error("Failed to load documents from Google Drive.");
      }
    } finally {
      setLoadingList(false);
    }
  };

  const handleConnect = async () => {
    const loader = toast.loading("Connecting with Google Docs...");
    try {
      const accessToken = await connectDocs();
      setToken(accessToken);
      toast.dismiss(loader);
      toast.success("Successfully integrated Google Docs workspace!");
      loadDocumentList(accessToken);
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error(err.message || "Failed to authorize Google Docs integration.");
    }
  };

  const handleDisconnect = () => {
    disconnectDocs();
    setToken(null);
    setDocuments([]);
    setSelectedDoc(null);
    setDocContent(null);
    setDocPlainText("");
    toast.success("Disconnected Google Docs integration.");
  };

  // Open specific Document & fetch contents
  const handleOpenDoc = async (docFile: DocumentFile) => {
    if (!token) return;
    setSelectedDoc(docFile);
    setLoadingDoc(true);
    setDocContent(null);
    setDocPlainText("");
    
    try {
      const doc = await getGoogleDoc(token, docFile.id);
      setDocContent(doc);
      setDocPlainText(extractDocumentText(doc));
    } catch (err: any) {
      toast.error("Failed to load Google Doc content.");
      setSelectedDoc(null);
    } finally {
      setLoadingDoc(false);
    }
  };

  // Append Quick Note to document
  const handleAppendNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedDoc || !notesToAppend.trim()) return;

    setSubmittingNote(true);
    const textToWrite = `\n\n[Addendum - ${new Date().toLocaleString()}]\n${notesToAppend.trim()}\n`;
    
    try {
      await appendDocumentText(token, selectedDoc.id, textToWrite);
      toast.success("Successfully appended notes to Google Doc!");
      setNotesToAppend("");
      // Refresh content
      handleOpenDoc(selectedDoc);
    } catch (err: any) {
      toast.error("Failed to append content to Google Doc.");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Create Campaign Brief Document Submission
  const handleCreateBriefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !briefForm.campaignName.trim()) return;

    setCreatingBrief(true);
    const docTitle = `CRYOVA Brief: ${briefForm.campaignName.trim()}`;
    const loader = toast.loading(`Generating '${docTitle}' in Google Docs...`);

    try {
      const created = await createCampaignBriefDocument(token, docTitle, briefForm);
      toast.dismiss(loader);
      toast.success("Creative brief successfully generated and styled!");
      setIsCreateModalOpen(false);
      
      // Reset Brief form
      setBriefForm({
        campaignName: "",
        targetAudience: "",
        keyDeliverables: "",
        budget: "",
        timeline: "",
        moodboardDescription: ""
      });

      // Reload files & open the newly created document
      await loadDocumentList(token);
      handleOpenDoc({
        id: created.documentId,
        name: created.title
      });
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error(err.message || "Failed to create campaign brief Google Doc.");
    } finally {
      setCreatingBrief(false);
    }
  };

  // Delete Doc File (WITH MANDATORY User Confirmation Dialog per guidelines!)
  const handleDeleteDoc = async (docFile: DocumentFile, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering Row Click / Open Doc
    
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the Google Document '${docFile.name}' from your Drive? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    const loader = toast.loading(`Deleting document '${docFile.name}'...`);
    try {
      if (!token) return;
      await deleteDriveFile(token, docFile.id);
      toast.dismiss(loader);
      toast.success("Google Document deleted successfully.");
      
      // If deleted doc is currently open, go back
      if (selectedDoc?.id === docFile.id) {
        setSelectedDoc(null);
        setDocContent(null);
        setDocPlainText("");
      }
      
      loadDocumentList(token);
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error(err.message || "Failed to delete Google Document.");
    }
  };

  // Filter lists
  const filteredDocsList = documents.filter(doc => {
    if (!searchQuery) return true;
    return doc.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#141414] uppercase">
              Creative Brief Docs
            </h1>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
              Draft & manage campaign agreements in Google Docs
            </p>
          </div>
        </div>

        {token && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!selectedDoc ? (
              <button 
                onClick={() => loadDocumentList(token)}
                className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-all hover:rotate-45"
                title="Refresh documents"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => handleOpenDoc(selectedDoc)}
                className="p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-all hover:rotate-45"
                title="Refresh document text"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" /> Disconnect
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!token ? (
            /* HERO AUTH HUB */
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto my-12"
            >
              <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200/60 shadow-xl relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/10 opacity-10 blur-3xl"></div>
                
                <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <FileText className="w-8 h-8" />
                </div>

                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                  Google Docs Integration
                </span>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#141414] mt-4 mb-3 uppercase">
                  Campaign Creative Briefs
                </h2>

                <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto mb-8 font-medium">
                  Connect your brand or creator account with Google Docs. Seamlessly author dynamic briefings, review creative moodboards, write performance descriptions, and sync agreements live.
                </p>

                {/* Secure Sign-In button conforming to layout parameters */}
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
                  Connect Google Docs
                </button>

                <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#141414]">1-Click</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-black">Brief Builder</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#141414]">Rich</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-black">Styled Previews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#141414]">Append</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-black">Live Notes</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !selectedDoc ? (
            /* DOCUMENTS DIRECTORY GRID VIEW */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search documents in your Drive..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 rounded-full text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:brightness-110 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md w-full md:w-auto justify-center"
                >
                  <FilePlus2 className="w-4 h-4" /> Create Creative Brief
                </button>
              </div>

              {/* LIST DISPLAY */}
              {loadingList ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-24 text-center shadow-sm">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Fetching Google Documents...</p>
                </div>
              ) : filteredDocsList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center max-w-sm mx-auto shadow-sm">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-bold text-sm text-[#141414] mb-1">No Documents Found</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium mb-6">
                    We couldn't find any documents in your Google Drive. Launch a fully structured campaign-ready brief to start.
                  </p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#141414] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Build New Brief Doc
                  </button>
                </div>
              ) : (
                /* Grid cards layout for beautiful visual balance */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocsList.map((doc) => (
                    <motion.div 
                      key={doc.id}
                      whileHover={{ y: -4 }}
                      onClick={() => handleOpenDoc(doc)}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group h-48 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                      
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="pr-4">
                          <h4 className="font-bold text-sm text-[#141414] line-clamp-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                            {doc.name}
                          </h4>
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                            Updated {doc.createdTime ? new Date(doc.createdTime).toLocaleDateString() : "Today"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Open Reader Mode &rarr;
                        </span>
                        
                        <button 
                          onClick={(e) => handleDeleteDoc(doc, e)}
                          className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all"
                          title="Delete file permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* DETAILED DOCUMENT VIEWER / READER MODE */
            <motion.div 
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Main Document Content Column */}
              <div className="lg:col-span-8 space-y-6">
                {/* Back button and outer actions */}
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => {
                      setSelectedDoc(null);
                      setDocContent(null);
                      setDocPlainText("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Briefs
                  </button>

                  {selectedDoc.webViewLink && (
                    <a 
                      href={selectedDoc.webViewLink} 
                      target="_blank" 
                      rel="noreferrer noopener"
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                      Edit in Google Docs <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Real-time stylized viewer */}
                <div className="bg-white border border-gray-150 rounded-3xl p-8 md:p-12 shadow-md relative min-h-[500px]">
                  {loadingDoc ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Streaming Document Content...</p>
                    </div>
                  ) : (
                    <article className="prose prose-slate max-w-none">
                      {/* Document Meta Header */}
                      <div className="border-b border-gray-100 pb-6 mb-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-widest">
                            Reader Mode
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-[#141414] uppercase tracking-tight leading-snug">
                          {docContent?.title || selectedDoc.name}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Document ID: {selectedDoc.id}
                        </p>
                      </div>

                      {/* Actual plain-text styled beautifully */}
                      <div className="whitespace-pre-wrap text-gray-700 text-sm font-medium leading-relaxed font-mono bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        {docPlainText || (
                          <span className="text-gray-400 italic font-sans block text-center py-12">
                            This Google Document is blank. Use the "Append Notes" panel to insert some content.
                          </span>
                        )}
                      </div>
                    </article>
                  )}
                </div>
              </div>

              {/* Sidebar Panel Column (Interactive Quick Edit/Append and History) */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. Append notes live form */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#141414]">
                      Append Document Notes
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium mb-4">
                    Instantly append updates, creator notes, or performance results directly into Google Docs.
                  </p>

                  <form onSubmit={handleAppendNotes} className="space-y-3">
                    <textarea
                      placeholder="Write your brief addendum, creative timeline adjustment, or contract approvals here..."
                      value={notesToAppend}
                      onChange={(e) => setNotesToAppend(e.target.value)}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-gray-400"
                    />

                    <button
                      type="submit"
                      disabled={submittingNote || !notesToAppend.trim() || loadingDoc}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:brightness-110 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                      {submittingNote ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Appending...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Send to Google Doc
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* 2. Workspace Status checklist */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#141414] flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-400" /> Integration Checklist
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#141414]">Live Synced with Google</p>
                        <p className="text-[10px] text-gray-400 font-medium">Changes propagate immediately</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#141414]">OAuth 2.0 Security</p>
                        <p className="text-[10px] text-gray-400 font-medium">Verified by Firebase & Google API</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-bold text-[#141414]">Campaign Linking</p>
                        <p className="text-[10px] text-gray-400 font-medium">Link spreadsheet metrics with this text brief</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CREATE CAMPAIGN BRIEF DOC MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 my-8"
          >
            <div className="flex items-center gap-2.5 mb-1">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg text-[#141414] uppercase tracking-tight">Create Campaign Brief</h3>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-5">Generates a highly-stylized, professional layout brief right inside your Google Docs folder.</p>
            
            <form onSubmit={handleCreateBriefSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Campaign Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Summer Refresh Lip Gloss"
                    required
                    value={briefForm.campaignName}
                    onChange={(e) => setBriefForm({ ...briefForm, campaignName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Total Budget ($)</label>
                  <input 
                    type="number" 
                    placeholder="e.g., 2500"
                    value={briefForm.budget}
                    onChange={(e) => setBriefForm({ ...briefForm, budget: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Timeline</label>
                  <input 
                    type="text" 
                    placeholder="e.g., August 1st - September 15th"
                    value={briefForm.timeline}
                    onChange={(e) => setBriefForm({ ...briefForm, timeline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Target Audience</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Gen-Z skincare enthusiasts on TikTok"
                    value={briefForm.targetAudience}
                    onChange={(e) => setBriefForm({ ...briefForm, targetAudience: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Campaign Deliverables</label>
                <textarea 
                  placeholder="e.g., - 2x vertical video Reels&#10;- 1x static photography grid post&#10;- 2x story slide series with swipe-up"
                  rows={3}
                  value={briefForm.keyDeliverables}
                  onChange={(e) => setBriefForm({ ...briefForm, keyDeliverables: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Moodboard & Vibe Description</label>
                <textarea 
                  placeholder="e.g., Neon sunset gradients, highly energetic jump cuts, outdoor golden hour shots, vibrant upbeat sound syncs."
                  rows={3}
                  value={briefForm.moodboardDescription}
                  onChange={(e) => setBriefForm({ ...briefForm, moodboardDescription: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creatingBrief || !briefForm.campaignName.trim()}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
                >
                  {creatingBrief ? "Syncing..." : "Generate Brief"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
