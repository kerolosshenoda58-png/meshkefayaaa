import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Search, 
  Mail, 
  Send, 
  Trash2, 
  Plus, 
  LogOut, 
  RefreshCw, 
  AlertCircle, 
  Inbox, 
  Sparkles, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Loader2, 
  ChevronRight,
  Star,
  FileText,
  User,
  X,
  ArrowRight,
  CornerUpLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "../components/AuthProvider";
import { connectGmail, getGmailToken, disconnectGmail } from "../lib/googleAuth";
import { 
  listGmailMessages, 
  getGmailMessageDetails, 
  sendGmailEmail, 
  trashGmailMessage, 
  getGmailProfile,
  GmailMessage,
  GmailUserProfile
} from "../lib/gmailService";
import A2UIWorkspace from "../components/ui/A2UIWorkspace";

export default function Messages() {
  const { userData, role } = useAuth();
  
  // App view toggle: "app" vs "gmail"
  const [activeMode, setActiveMode] = useState<"app" | "gmail">("gmail");
  
  // Gmail States
  const [gmailToken, setGmailToken] = useState<string | null>(null);
  const [gmailProfile, setGmailProfile] = useState<GmailUserProfile | null>(null);
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [activeLabel, setActiveLabel] = useState<string>("INBOX");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingEmails, setLoadingEmails] = useState<boolean>(false);
  const [activeMessage, setActiveMessage] = useState<GmailMessage | null>(null);
  const [loadingMessageDetails, setLoadingMessageDetails] = useState<boolean>(false);
  
  // Compose modal/panel state
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState<string>("");
  const [composeBody, setComposeBody] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);

  // AI draft composer state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiRecipientName, setAiRecipientName] = useState<string>("");
  const [aiCampaignName, setAiCampaignName] = useState<string>("");
  const [generatingAiDraft, setGeneratingAiDraft] = useState<boolean>(false);
  const [showAiHelper, setShowAiHelper] = useState<boolean>(false);

  // Check stored Gmail token on mount
  useEffect(() => {
    const token = getGmailToken();
    if (token) {
      setGmailToken(token);
      loadGmailProfileAndEmails(token, activeLabel);
    }
  }, []);

  // Fetch emails and profile when label or token changes
  const loadGmailProfileAndEmails = async (token: string, label: string, search: string = "") => {
    setLoadingEmails(true);
    try {
      // 1. Fetch user profile
      try {
        const profile = await getGmailProfile(token);
        setGmailProfile(profile);
      } catch (pErr) {
        console.warn("Could not fetch Gmail profile details, continuing with message fetch:", pErr);
      }

      // 2. Fetch messages list
      const q = search ? search : `label:${label}`;
      const messageList = await listGmailMessages(token, q, 15);
      
      if (messageList.length === 0) {
        setEmails([]);
        setLoadingEmails(false);
        return;
      }

      // 3. Fetch detailed metadata for the top messages in parallel
      const detailPromises = messageList.map(msg => 
        getGmailMessageDetails(token, msg.id).catch(err => {
          console.error(`Error loading message details for ${msg.id}:`, err);
          return null;
        })
      );
      
      const details = await Promise.all(detailPromises);
      const validDetails = details.filter((d): d is GmailMessage => d !== null);
      
      setEmails(validDetails);
    } catch (err: any) {
      console.error("Gmail load error:", err);
      // If unauthorized, clear cached tokens
      if (err.message?.includes("401") || err.message?.includes("unauthorized") || err.message?.includes("Unauthorized")) {
        toast.error("Gmail session expired. Please connect again.");
        handleDisconnectGmail();
      } else {
        toast.error("Failed to sync emails from Gmail.");
      }
    } finally {
      setLoadingEmails(false);
    }
  };

  // Trigger connect Gmail account
  const handleConnectGmail = async () => {
    const loader = toast.loading("Connecting your Gmail account...");
    try {
      const token = await connectGmail();
      setGmailToken(token);
      toast.dismiss(loader);
      toast.success("Successfully integrated Gmail with CRYOVA!");
      loadGmailProfileAndEmails(token, "INBOX");
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error(err.message || "Failed to authorize Google integration.");
    }
  };

  // Disconnect Gmail integration
  const handleDisconnectGmail = () => {
    disconnectGmail();
    setGmailToken(null);
    setGmailProfile(null);
    setEmails([]);
    setActiveMessage(null);
    toast.success("Disconnected Gmail account.");
  };

  // Refresh current view
  const handleRefresh = () => {
    if (gmailToken) {
      loadGmailProfileAndEmails(gmailToken, activeLabel, searchQuery);
    }
  };

  // Fetch individual email thread on click
  const handleSelectMessage = async (msg: GmailMessage) => {
    setActiveMessage(msg);
  };

  // Trash message with validation/confirmation dialog (CRITICAL USER CONFIRMATION REQUIRED)
  const handleTrashMessage = async (msgId: string) => {
    if (!gmailToken) return;
    
    // Explicit confirmation dialg per instructions
    const confirmed = window.confirm("Are you sure you want to move this email to the trash? This action can be undone in your Gmail Trash folder.");
    if (!confirmed) return;

    const loader = toast.loading("Moving email to trash...");
    try {
      await trashGmailMessage(gmailToken, msgId);
      toast.dismiss(loader);
      toast.success("Message moved to trash successfully.");
      
      // Update local state
      setEmails(prev => prev.filter(e => e.id !== msgId));
      if (activeMessage?.id === msgId) {
        setActiveMessage(null);
      }
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error("Failed to trash email.");
    }
  };

  // Compose / Send Email (CRITICAL USER CONFIRMATION REQUIRED)
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailToken) return;

    if (!composeTo || !composeSubject || !composeBody) {
      toast.error("Please fill in all email fields.");
      return;
    }

    // Explicit confirmation dialg per instructions
    const confirmed = window.confirm(`Send email to ${composeTo}? This will be sent immediately from your connected Google account.`);
    if (!confirmed) return;

    setSendingEmail(true);
    const loader = toast.loading("Sending email via Gmail...");
    try {
      await sendGmailEmail(gmailToken, composeTo, composeSubject, composeBody);
      toast.dismiss(loader);
      toast.success("Email sent successfully!");
      setIsComposeOpen(false);
      
      // Reset form
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      
      // Refresh Sent folder
      if (activeLabel === "SENT") {
        loadGmailProfileAndEmails(gmailToken, "SENT");
      }
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error(err.message || "Failed to send email. Please check coordinates and retry.");
    } finally {
      setSendingEmail(false);
    }
  };

  // Use Gemini to write a custom UGC pitch or review email draft
  const handleGenerateAiDraft = async () => {
    if (!aiPrompt) {
      toast.error("Please explain what you want the AI to write.");
      return;
    }
    setGeneratingAiDraft(true);
    const loader = toast.loading("Gemini is composing your campaign draft...");
    try {
      const response = await fetch("/api/gemini/compose-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          role: userData?.role || role || "creator",
          recipientName: aiRecipientName || "Brand Partner",
          campaignName: aiCampaignName || "UGC Sponsorship"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI email copy");
      }

      const data = await response.json();
      toast.dismiss(loader);
      
      // Populate composer
      setComposeSubject(data.subject);
      setComposeBody(data.body);
      toast.success("AI draft composed successfully! Review and edit below.");
      setShowAiHelper(false);
    } catch (err: any) {
      toast.dismiss(loader);
      toast.error(err.message || "Failed to generate AI draft. Please configure your GEMINI_API_KEY.");
    } finally {
      setGeneratingAiDraft(false);
    }
  };

  // Quick reply handler
  const handleQuickReply = () => {
    if (!activeMessage) return;
    
    // Extract actual sender email address from "Sender Name <email@example.com>"
    let replyTo = activeMessage.from;
    const match = activeMessage.from.match(/<([^>]+)>/);
    if (match && match[1]) {
      replyTo = match[1];
    }

    setComposeTo(replyTo);
    setComposeSubject(activeMessage.subject.startsWith("Re:") ? activeMessage.subject : `Re: ${activeMessage.subject}`);
    setComposeBody(`<br/><br/><blockquote>On ${activeMessage.date}, ${activeMessage.from} wrote:<br/>${activeMessage.body}</blockquote>`);
    setIsComposeOpen(true);
  };

  // Handle Label selection
  const handleLabelChange = (label: string) => {
    setActiveLabel(label);
    setSearchQuery("");
    if (gmailToken) {
      loadGmailProfileAndEmails(gmailToken, label);
    }
  };

  // Search handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gmailToken && searchQuery) {
      loadGmailProfileAndEmails(gmailToken, "", searchQuery);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-[#141414] font-sans overflow-hidden">
      
      {/* Top Header Controls with Sliding Tab Mode Selector */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            COMMUNICATION CENTER
            <span className="w-2 h-2 rounded-full bg-[#BEF264] shadow-[0_0_8px_#BEF264]" />
          </h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Manage UGC Campaigns and Pitch Inboxes</p>
        </div>

        {/* Dynamic Mode Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto border border-gray-200 shadow-inner">
          <button 
            onClick={() => setActiveMode("gmail")}
            className={cn(
              "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
              activeMode === "gmail" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
            )}
          >
            Gmail Inbox (Verified API)
          </button>
          <button 
            onClick={() => setActiveMode("app")}
            className={cn(
              "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
              activeMode === "app" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
            )}
          >
            Internal Chats
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ==================== MODE 1: APP INTERNAL CHATS ==================== */}
        {activeMode === "app" && (
          <A2UIWorkspace />
        )}

        {/* ==================== MODE 2: GMAIL INTEGRATION CLIENT ==================== */}
        {activeMode === "gmail" && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* If NOT connected, show OAuth Launcher Panel */}
            {!gmailToken ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#BEF264]/10 rounded-full filter blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#A855F7]/10 rounded-full filter blur-3xl pointer-events-none" />
                
                <div className="max-w-lg text-center z-10 p-6 bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-[#BEF264] mb-6 shadow-md">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-3">Sync Your Campaign Inbox</h2>
                  <p className="text-gray-600 text-sm mb-8 leading-relaxed max-w-md mx-auto">
                    Pitch directly to elite brands, review sponsorship contracts, and receive content feedback instantly using your actual Gmail account. Highly secure, OAuth authenticated, and powered by Gemini.
                  </p>
                  
                  {/* Styled GSI Button */}
                  <button 
                    onClick={handleConnectGmail}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 border-2 border-black bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-black/10 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>Connect Gmail with Google</span>
                  </button>
                  
                  <div className="mt-6 flex justify-center items-center gap-1.5 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5 text-[#BEF264] stroke-[3]" /> Secure OAuth 2.0 Integration
                  </div>
                </div>
              </div>
            ) : (
              
              /* Gmail Layout: Left Navigation, Middle List, Right Details Panel */
              <div className="flex-1 flex overflow-hidden">
                
                {/* 1. Gmail Left Navigation Panel */}
                <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0 p-4">
                  
                  {/* Account Identity */}
                  {gmailProfile && (
                    <div className="mb-6 p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#141414] text-[#BEF264] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {gmailProfile.emailAddress.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#141414] truncate uppercase tracking-tight">{gmailProfile.emailAddress.split("@")[0]}</p>
                        <p className="text-[9px] text-gray-400 truncate tracking-wide">{gmailProfile.emailAddress}</p>
                      </div>
                    </div>
                  )}

                  {/* Compose Action Trigger */}
                  <button 
                    onClick={() => {
                      setComposeTo("");
                      setComposeSubject("");
                      setComposeBody("");
                      setIsComposeOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#BEF264] hover:bg-[#a9db4f] text-[#141414] font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all mb-6"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Compose Email
                  </button>

                  {/* Folders List */}
                  <div className="space-y-1 mb-6">
                    <span className="text-[10px] text-gray-400 font-black tracking-widest px-3 block mb-2 uppercase">Folders</span>
                    
                    <button 
                      onClick={() => handleLabelChange("INBOX")}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                        activeLabel === "INBOX" ? "bg-black text-white" : "text-gray-500 hover:text-black hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Inbox className="w-4 h-4" />
                        <span>Inbox</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleLabelChange("SENT")}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                        activeLabel === "SENT" ? "bg-black text-white" : "text-gray-500 hover:text-black hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Send className="w-4 h-4" />
                        <span>Sent Mail</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleLabelChange("DRAFT")}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                        activeLabel === "DRAFT" ? "bg-black text-white" : "text-gray-500 hover:text-black hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4" />
                        <span>Drafts</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleLabelChange("STARRED")}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
                        activeLabel === "STARRED" ? "bg-black text-white" : "text-gray-500 hover:text-black hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Star className="w-4 h-4" />
                        <span>Starred</span>
                      </div>
                    </button>
                  </div>

                  {/* Disconnect Option */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <button 
                      onClick={handleDisconnectGmail}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect Gmail</span>
                    </button>
                  </div>
                </div>

                {/* 2. Middle Message List Panel */}
                <div className={cn(
                  "w-full md:w-96 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden",
                  activeMessage && "hidden md:flex"
                )}>
                  {/* Search and Refresh bar */}
                  <div className="p-4 border-b border-gray-200">
                    <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search in mail..." 
                          className="pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#BEF264]/40 w-full font-medium text-gray-800 transition-all border border-transparent focus:bg-white focus:border-gray-200"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleRefresh}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-black transition-colors"
                        title="Sync mails"
                      >
                        <RefreshCw className={cn("w-4 h-4", loadingEmails && "animate-spin")} />
                      </button>
                    </form>

                    {/* Quick filter labels for mobile (under active label) */}
                    <div className="lg:hidden flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
                      {["INBOX", "SENT", "DRAFT", "STARRED"].map(lbl => (
                        <button 
                          key={lbl} 
                          onClick={() => handleLabelChange(lbl)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all shrink-0",
                            activeLabel === lbl 
                              ? "bg-black text-white border-black" 
                              : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                          )}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List Container */}
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {loadingEmails ? (
                      <div className="p-10 flex flex-col items-center justify-center text-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin text-[#BEF264] mb-3" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Syncing CRM emails...</span>
                      </div>
                    ) : emails.length === 0 ? (
                      <div className="p-10 text-center flex flex-col items-center">
                        <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="text-sm font-bold text-gray-800">No emails found</p>
                        <p className="text-xs text-gray-400 mt-1">Try changing folders or custom keyword search</p>
                      </div>
                    ) : (
                      emails.map(email => {
                        const isSelected = activeMessage?.id === email.id;
                        const isUnread = email.labels.includes("UNREAD");
                        
                        return (
                          <button
                            key={email.id}
                            onClick={() => handleSelectMessage(email)}
                            className={cn(
                              "w-full text-left p-4 flex flex-col gap-1.5 transition-all relative border-l-4 hover:bg-gray-50/50",
                              isSelected ? "bg-gray-50 border-black" : "border-transparent",
                              isUnread && !isSelected && "bg-[#BEF264]/5"
                            )}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className={cn(
                                "text-xs truncate max-w-[150px] uppercase tracking-wide",
                                isUnread ? "font-black text-black" : "font-bold text-gray-500"
                              )}>
                                {email.from.split("<")[0].trim() || email.from}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                                {email.date ? email.date.split(",")[1]?.trim()?.slice(0, 11) || email.date.slice(0, 16) : ""}
                              </span>
                            </div>
                            
                            <h3 className={cn(
                              "text-xs truncate w-full",
                              isUnread ? "font-black text-black" : "font-semibold text-gray-700"
                            )}>
                              {email.subject}
                            </h3>
                            
                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                              {email.snippet}
                            </p>
                            
                            {/* Unread indicator */}
                            {isUnread && (
                              <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#BEF264] rounded-full shadow-[0_0_6px_#BEF264]" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 3. Right Message Thread Panel */}
                <div className={cn(
                  "flex-1 flex flex-col overflow-hidden bg-white",
                  !activeMessage && "hidden md:flex"
                )}>
                  {!activeMessage ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50/50">
                      <Mail className="w-12 h-12 text-gray-300 mb-4 animate-bounce" />
                      <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Campaign Thread Manager</p>
                      <p className="text-xs text-gray-400 mt-1">Select an email to view campaign coordinates, pitch history, or reply.</p>
                    </div>
                  ) : (
                    <>
                      {/* Thread Control Bar */}
                      <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between shrink-0 bg-white shadow-sm z-10">
                        <button 
                          onClick={() => setActiveMessage(null)}
                          className="md:hidden flex items-center gap-1 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-black"
                        >
                          <X className="w-4 h-4" /> Back
                        </button>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleQuickReply}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" /> Reply
                          </button>
                          
                          {/* Trash button (MUTATING ACTION - prompts user with explicit confirmation dialog) */}
                          <button 
                            onClick={() => handleTrashMessage(activeMessage.id)}
                            className="p-2 border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Trash message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Header metadata */}
                      <div className="p-6 border-b border-gray-100 bg-[#FAFAFA]/50">
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <h2 className="text-lg font-black tracking-tight text-gray-900 leading-tight">
                            {activeMessage.subject}
                          </h2>
                          <div className="flex gap-1.5 shrink-0">
                            {activeMessage.labels.map(lbl => (
                              <span key={lbl} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[8px] font-black uppercase tracking-wider rounded">
                                {lbl}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-black text-[#BEF264] flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {activeMessage.from.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-gray-800 truncate leading-none mb-1">
                              FROM: {activeMessage.from}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium truncate">
                              TO: {activeMessage.to}
                            </p>
                          </div>
                          <div className="text-right text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {activeMessage.date}
                          </div>
                        </div>
                      </div>

                      {/* Decoded body display container */}
                      <div className="flex-1 overflow-y-auto p-6 bg-white">
                        {activeMessage.body ? (
                          <div className="prose max-w-none text-xs text-gray-700 leading-relaxed space-y-4">
                            {/* Render decrypted rich body inside iframe or safe div */}
                            {activeMessage.body.includes("<html") || activeMessage.body.includes("<div") || activeMessage.body.includes("<p") ? (
                              <div 
                                className="gmail-html-content bg-white p-2"
                                dangerouslySetInnerHTML={{ __html: activeMessage.body }} 
                              />
                            ) : (
                              <pre className="whitespace-pre-wrap font-sans text-xs break-words text-gray-700">
                                {activeMessage.body}
                              </pre>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs italic">This message does not contain any body text.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== COMPOSE AND DRAFT EMAIL MODAL ==================== */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden border border-gray-100 shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-[#141414] text-white p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BEF264] shadow-[0_0_8px_#BEF264]" />
                  <span className="font-black text-xs uppercase tracking-widest">COMPOSE NEW OUTREACH</span>
                </div>
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sliding UI for AI writer helper */}
              <div className="bg-gradient-to-r from-purple-500/10 to-[#BEF264]/10 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A855F7] animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider">AI Campaign Pitch Writer</span>
                  </div>
                  <button
                    onClick={() => setShowAiHelper(!showAiHelper)}
                    className="px-3 py-1 bg-white border border-gray-200 hover:border-[#BEF264] text-black text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                  >
                    {showAiHelper ? "Hide AI Helper" : "Use AI Draft Assistant"}
                  </button>
                </div>

                {/* AI Composer Inputs */}
                {showAiHelper && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-4 space-y-3 bg-white p-4 border border-gray-100 rounded-2xl shadow-inner"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Brand or Creator Name</label>
                        <input 
                          type="text"
                          value={aiRecipientName}
                          onChange={(e) => setAiRecipientName(e.target.value)}
                          placeholder="e.g. Nike / Alex UGC"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#BEF264]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Campaign/Asset Name</label>
                        <input 
                          type="text"
                          value={aiCampaignName}
                          onChange={(e) => setAiCampaignName(e.target.value)}
                          placeholder="e.g. Summer Fitness Pitch"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#BEF264]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">What are the specific pitch coordinates?</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Request 1 video on TikTok for fitness wear sponsorship, charging $500, with a fast 5-day turnaround."
                        className="w-full h-20 p-3 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#BEF264] resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={generatingAiDraft}
                      onClick={handleGenerateAiDraft}
                      className="w-full py-2.5 bg-black hover:bg-gray-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {generatingAiDraft ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#BEF264]" />
                          <span>Generating Draft...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#BEF264]" />
                          <span>Generate Premium Copy Draft</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Compose Form */}
              <form onSubmit={handleSendEmail} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  
                  {/* Recipient Input */}
                  <div>
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Recipient Email (To)</label>
                    <input 
                      type="email"
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      placeholder="partner@company.com"
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#BEF264]/40 font-semibold"
                    />
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                    <input 
                      type="text"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder="UGC Partnership Opportunity - CRYOVA"
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#BEF264]/40 font-semibold"
                    />
                  </div>

                  {/* Body Textarea Editor */}
                  <div className="flex-1 flex flex-col min-h-[220px]">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Email Body (HTML/Rich-Text Support)</label>
                    <textarea
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      placeholder="Describe your pitch, coordinates, or campaign requirements here..."
                      required
                      className="w-full flex-1 p-4 border border-gray-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-[#BEF264]/40 font-medium resize-none"
                    />
                  </div>
                </div>

                {/* Footer buttons (Triggers user confirm dialg inside handler) */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={sendingEmail}
                    className="px-5 py-2.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
                  >
                    {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Email</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
