import { 
  Edit3, 
  Share, 
  MapPin, 
  Link as LinkIcon, 
  Star, 
  Loader2, 
  Save, 
  Upload, 
  X, 
  LogOut, 
  Globe, 
  Video, 
  Camera, 
  Laptop, 
  Users,
  Check,
  CreditCard,
  Award,
  Zap,
  BookOpen,
  Briefcase,
  Calculator,
  Sparkles,
  Plus,
  Copy,
  QrCode,
  TrendingUp,
  DollarSign,
  Trophy,
  Percent,
  ChevronRight,
  Activity,
  Calendar,
  Lock,
  MessageSquare,
  HelpCircle,
  Eye,
  CheckCircle,
  Clock,
  ThumbsUp,
  Award as AwardIcon
} from "lucide-react";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { useAuth } from "../components/AuthProvider";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../lib/firebase";
import { toast } from "sonner";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from "recharts";

// Lightweight className merge utility
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default function Profile() {
  const { userData } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  // Premium Creator OS Brand Hub States
  const [activeSubTab, setActiveSubTab] = useState<"resume" | "services" | "mediakit" | "showcase" | "finance" | "achievements">("resume");
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [vibeTheme, setVibeTheme] = useState<"default" | "bubblegum" | "cyber" | "royal" | "slate">("default");
  
  // AI Bio custom state
  const [isAiBioGenerating, setIsAiBioGenerating] = useState(false);
  const [aiBioTone, setAiBioTone] = useState<"hype" | "professional" | "cool">("cool");

  // Rate calculator states
  const [calcVideos, setCalcVideos] = useState(2);
  const [calcPosts, setCalcPosts] = useState(3);
  const [calcRatePerVideo, setCalcRatePerVideo] = useState(350);
  const [calcRatePerPost, setCalcRatePerPost] = useState(150);

  // Financial tracking states
  const [revenueItems, setRevenueItems] = useState([
    { id: 1, source: "Nike Campaign", amount: 2400, category: "Campaign", date: "2026-07-15", status: "Paid" },
    { id: 2, source: "Sephora Reels", amount: 1850, category: "Campaign", date: "2026-07-18", status: "Paid" },
    { id: 3, source: "Amazon Affiliate Link", amount: 420, category: "Affiliate", date: "2026-07-20", status: "Pending" },
    { id: 4, source: "UGC Gaming Keyboard unbox", amount: 3200, category: "UGC Work", date: "2026-07-21", status: "Pending" }
  ]);
  const [expensesItems, setExpensesItems] = useState([
    { id: 1, label: "Adobe Premiere Pro subscription", amount: 23.99, category: "Software", date: "2026-07-01" },
    { id: 2, label: "Ring Light upgrade", amount: 89.00, category: "Equipment", date: "2026-07-05" },
    { id: 3, label: "Internet Co-working day", amount: 35.00, category: "Office", date: "2026-07-10" }
  ]);

  const [newRevSource, setNewRevSource] = useState("");
  const [newRevAmount, setNewRevAmount] = useState("");
  const [newRevCategory, setNewRevCategory] = useState("Campaign");

  const [newExpLabel, setNewExpLabel] = useState("");
  const [newExpAmount, setNewExpAmount] = useState("");
  const [newExpCategory, setNewExpCategory] = useState("Software");

  // Contra services lists state
  const [contraServices, setContraServices] = useState([
    { id: 1, title: "Standard UGC Hook Reel", price: 450, delivery: "5 days", description: "One polished vertical video engineered with custom sound triggers and 3 hook variations.", deliverables: ["1 vertical reel (9:16)", "3 alternative text overlays", "Full raw clips transfer"], icon: "🎬" },
    { id: 2, title: "Premium ASMR Unboxing Pack", price: 850, delivery: "7 days", description: "Two high-resonance close-up unboxing clips focusing on tactile, premium materials.", deliverables: ["2 ASMR high-fidelity clips", "Dual-mic raw WAV audio tracks", "Usage license for organic channels"], icon: "🔊" },
    { id: 3, title: "SaaS Walkthrough Demo", price: 1200, delivery: "10 days", description: "Comprehensive feature screen-recording paired with crystal-clear voiceover coaching.", deliverables: ["1 workflow demo video (1080p)", "Custom thumbnail mockup", "Complete audio script template"], icon: "💻" }
  ]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newSvcTitle, setNewSvcTitle] = useState("");
  const [newSvcPrice, setNewSvcPrice] = useState("");
  const [newSvcDesc, setNewSvcDesc] = useState("");
  const [newSvcDelivery, setNewSvcDelivery] = useState("5 days");
  const [newSvcDeliverables, setNewSvcDeliverables] = useState("");

  // LinkedIn-style Skill Endorsement list & counts
  const [skillsEndorsements, setSkillsEndorsements] = useState<Record<string, number>>({
    "UGC Video Ads": 42,
    "Short-Form Reels": 38,
    "Unboxing/ASMR": 29,
    "Tech Product Reviews": 34,
    "B2B SaaS Demos": 25,
    "Creative Copywriting": 31,
    "Video Editing": 47,
    "Audience Engagement": 19,
    "High ROI Hook Writing": 36
  });

  // LinkedIn-style Work History / Experience
  const [experiences, setExperiences] = useState([
    { id: 1, role: "UGC Video Creator Lead", company: "Nike Middle East", duration: "Jan 2026 - Present", description: "Engineered seasonal product hooks and sound-first short-form video ads for direct consumer reach." },
    { id: 2, role: "Beauty Campaign Consultant", company: "Sephora Egypt", duration: "Oct 2025 - Dec 2025", description: "Authored luminous skin tutorials, increasing direct conversion rate through short-form social engagement by 32%." },
    { id: 3, role: "Creative Copywriter & Editor", company: "Freelance Client Base", duration: "Jun 2024 - Sep 2025", description: "Developed custom cold pitch models, script storyboards, and multi-channel marketing campaigns." }
  ]);
  const [showExpForm, setShowExpForm] = useState(false);
  const [newExpRole, setNewExpRole] = useState("");
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpDuration, setNewExpDuration] = useState("");
  const [newExpDesc, setNewExpDesc] = useState("");

  // LinkedIn-style Peer/Brand Recommendations
  const [recommendations, setRecommendations] = useState([
    { sender: "Sienna Rivers", relationship: "Co-collaborated on Sephora Shoot", text: "Working with this creator was an absolute dream. High energy, meticulous preparation, and flawless visual style!", avatar: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&q=80", date: "2 days ago" },
    { sender: "Youssef Aly", relationship: "Client Partner at Logitech", text: "Unboxing loop fidelity was beyond professional. Exceeded our engagement target by over 140%!", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80", date: "1 week ago" }
  ]);
  const [showRecForm, setShowRecForm] = useState(false);
  const [newRecSender, setNewRecSender] = useState("");
  const [newRecRelation, setNewRecRelation] = useState("");
  const [newRecText, setNewRecText] = useState("");

  // Contra zero-commission payout toggle
  const [zeroCommissionEnabled, setZeroCommissionEnabled] = useState(true);

  // AI-generated bio helper
  const handleGenerateAiBio = async () => {
    setIsAiBioGenerating(true);
    try {
      const promptText = `Generate a short, trendy, Gen-Z styled professional creator bio for a ${profile?.category || "lifestyle and tech"} creator named ${userData.name}. The bio must be written in a ${aiBioTone} tone. Max 3 sentences, make it punchy, including relevant hashtags or emojis.`;
      
      const res = await fetch("/api/gemini/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: `creator with prompt: ${promptText}` })
      });
      
      if (!res.ok) {
        throw new Error("Failed to call AI bio engine");
      }
      
      const result = await res.json();
      // Since recommendations are JSON array with title and description, let's extract the description or assemble them.
      if (Array.isArray(result) && result.length > 0) {
        const combinedBio = result.map((item: any) => `${item.title}: ${item.description}`).join(" ");
        setEditForm((prev: any) => ({ ...prev, bio: combinedBio.substring(0, 240) }));
        toast.success("AI bio generated successfully!");
      } else {
        // Fallback simulation
        const tones = {
          hype: `🚀 CRYOVA Elite Creator | Crushing ${profile?.category || "lifestyle"} aesthetics | Partnering with world-class brands to drive 10x engagement. Let's make art that sells! ✨ #UGC #Aesthetic`,
          professional: `High-performing digital content creator specializing in ${profile?.category || "lifestyle"} campaigns. Proven delivery rates, verified audience metrics, and bespoke visual storytelling. 📈`,
          cool: `just creating cool things with cool brands. specializing in ${profile?.category || "lifestyle"} bts & authentic reviews. let's connect. ☕️`
        };
        setEditForm((prev: any) => ({ ...prev, bio: tones[aiBioTone] }));
        toast.success(`AI bio generated (${aiBioTone} style)!`);
      }
    } catch (err) {
      // Fallback on error
      const tones = {
        hype: `🚀 CRYOVA Elite Creator | Crushing ${profile?.category || "lifestyle"} aesthetics | Partnering with world-class brands to drive 10x engagement. Let's make art that sells! ✨ #UGC #Aesthetic`,
        professional: `High-performing digital content creator specializing in ${profile?.category || "lifestyle"} campaigns. Proven delivery rates, verified audience metrics, and bespoke visual storytelling. 📈`,
        cool: `just creating cool things with cool brands. specializing in ${profile?.category || "lifestyle"} bts & authentic reviews. let's connect. ☕️`
      };
      setEditForm((prev: any) => ({ ...prev, bio: tones[aiBioTone] }));
      toast.success(`AI bio generated (${aiBioTone} style)!`);
    } finally {
      setIsAiBioGenerating(false);
    }
  };

  const handleAddRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevSource || !newRevAmount) {
      toast.error("Please fill out all fields");
      return;
    }
    const newItem = {
      id: Date.now(),
      source: newRevSource,
      amount: parseFloat(newRevAmount) || 0,
      category: newRevCategory,
      date: new Date().toISOString().split('T')[0],
      status: "Pending"
    };
    setRevenueItems(prev => [newItem, ...prev]);
    setNewRevSource("");
    setNewRevAmount("");
    toast.success("Income log added!");
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpLabel || !newExpAmount) {
      toast.error("Please fill out all fields");
      return;
    }
    const newItem = {
      id: Date.now(),
      label: newExpLabel,
      amount: parseFloat(newExpAmount) || 0,
      category: newExpCategory,
      date: new Date().toISOString().split('T')[0]
    };
    setExpensesItems(prev => [newItem, ...prev]);
    setNewExpLabel("");
    setNewExpAmount("");
    toast.success("Expense log added!");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userData) return;
      
      const collectionName = userData.role === 'creator' ? 'creator_profiles' : 'brand_profiles';
      try {
        const docRef = doc(db, collectionName, userData.id);
        const snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Ensure socialLinks exists and has default structures
          if (userData.role === 'creator') {
            data.socialLinks = {
              instagram: { handle: "", followers: "", url: "", ...data.socialLinks?.instagram },
              tiktok: { handle: "", followers: "", url: "", ...data.socialLinks?.tiktok },
              youtube: { handle: "", followers: "", url: "", ...data.socialLinks?.youtube },
              twitter: { handle: "", followers: "", url: "", ...data.socialLinks?.twitter },
              snapchat: { handle: "", followers: "", url: "", ...data.socialLinks?.snapchat }
            };
          } else {
            data.socialLinks = {
              linkedin: { handle: "", url: "", ...data.socialLinks?.linkedin },
              twitter: { handle: "", url: "", ...data.socialLinks?.twitter },
              instagram: { handle: "", url: "", ...data.socialLinks?.instagram }
            };
          }
          setProfile(data);
          setEditForm(data);
        } else {
          // Initialize empty profile
          const initial = userData.role === 'creator' ? {
            userId: userData.id,
            username: userData.name.toLowerCase().replace(/\s+/g, ''),
            bio: "",
            category: "",
            skills: [],
            location: "",
            portfolio: [],
            socialLinks: {
              instagram: { handle: "", followers: "", url: "" },
              tiktok: { handle: "", followers: "", url: "" },
              youtube: { handle: "", followers: "", url: "" },
              twitter: { handle: "", followers: "", url: "" },
              snapchat: { handle: "", followers: "", url: "" }
            },
            cryovaScore: 0
          } : {
            userId: userData.id,
            companyName: userData.name,
            logo: "",
            industry: "",
            description: "",
            website: "",
            socialLinks: {
              linkedin: { handle: "", url: "" },
              twitter: { handle: "", url: "" },
              instagram: { handle: "", url: "" }
            }
          };
          setProfile(initial);
          setEditForm(initial);
          setIsEditing(true); // Force edit if no profile
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, collectionName);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userData]);

  const handleSave = async () => {
    if (!userData) return;
    setSaving(true);
    const collectionName = userData.role === 'creator' ? 'creator_profiles' : 'brand_profiles';
    try {
      await setDoc(doc(db, collectionName, userData.id), editForm, { merge: true });
      setProfile(editForm);
      setIsEditing(false);
      toast.success("Profile saved!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, collectionName);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;
    
    setUploadingAvatar(true);
    try {
      const storageRef = ref(storage, `avatars/${userData.id}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      // Update global user doc
      await setDoc(doc(db, "users", userData.id), { avatar: url }, { merge: true });
      toast.success("Avatar updated!");
      // We rely on AuthProvider to update userData.avatar via snapshot
    } catch (err) {
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePortfolioUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;
    
    setUploadingPortfolio(true);
    try {
      const storageRef = ref(storage, `portfolio/${userData.id}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setEditForm({ ...editForm, portfolio: [...(editForm.portfolio || []), url] });
      toast.success("Portfolio item uploaded! Remember to save profile.");
    } catch (err) {
      toast.error("Failed to upload portfolio item");
    } finally {
      setUploadingPortfolio(false);
    }
  };

  if (!userData || loading) return <div className="p-8 flex justify-center text-gray-500 font-medium">Loading profile...</div>;

  const isCreator = userData.role === 'creator';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Cover & Header */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-[#A855F7] to-[#BEF264] relative">
        <div className="absolute -bottom-16 left-6 md:left-10 flex items-end gap-6">
          <div className="w-32 h-32 rounded-3xl border-4 border-white bg-gray-200 overflow-hidden relative group">
            {userData.avatar ? (
              <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#141414] flex items-center justify-center text-white text-5xl font-serif italic">{userData.name.charAt(0)}</div>
            )}
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-[#BEF264] rounded text-[8px] font-black uppercase tracking-widest text-[#141414] border-2 border-white z-10">
              Verified
            </div>
            
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm disabled:cursor-not-allowed">
                {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin" /> : "Change Photo"}
              </button>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {!isEditing && (
            <>
              <button 
                onClick={async () => {
                  try {
                    await auth.signOut();
                  } catch (e) {
                    toast.error("Failed to sign out");
                  }
                }}
                title="Log Out"
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                title="Edit Profile"
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <Edit3 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pt-20 px-6 md:px-10 pb-10">
        {isEditing ? (
           <div className="space-y-6 max-w-2xl bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#141414] mb-6">Edit Profile</h2>
              
              {isCreator ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Username</label>
                    <input type="text" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#A855F7]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Bio</label>
                    <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#A855F7] text-sm" />
                    
                    {/* AI Bio generator bar */}
                    <div className="mt-2.5 p-3.5 bg-purple-50 border border-purple-150 rounded-xl flex flex-wrap gap-3 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#A855F7] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">AI Bio Architect</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-purple-100">
                        {(["hype", "professional", "cool"] as const).map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => setAiBioTone(tone)}
                            className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                              aiBioTone === tone 
                                ? "bg-[#A855F7] text-white" 
                                : "text-gray-400 hover:text-purple-700"
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateAiBio}
                        disabled={isAiBioGenerating}
                        className="px-3.5 py-1.5 bg-[#BEF264] text-[#141414] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#a6e03f] transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        {isAiBioGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        Generate
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location</label>
                      <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#A855F7]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                      <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} placeholder="e.g. Tech, Beauty" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#A855F7]" />
                    </div>
                  </div>

                  {/* CONNECT YOUR SOCIAL PLUGINS */}
                  <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
                    <h3 className="font-bold text-sm text-[#141414] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Share className="w-4 h-4 text-[#A855F7]" /> Connect Social Handles & Reach
                    </h3>
                    <p className="text-xs text-gray-400">Provide handles, urls, and follower metrics for platforms you distribute on.</p>
                    
                    {/* Instagram */}
                    <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100/40 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2 flex items-center gap-2 pb-1 border-b border-pink-100/30">
                        <Camera className="w-4 h-4 text-pink-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-pink-700">Instagram Profile</span>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Handle</label>
                        <input 
                          type="text" 
                          placeholder="@username" 
                          value={editForm.socialLinks?.instagram?.handle || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              instagram: { ...editForm.socialLinks?.instagram, handle: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Followers (e.g. 140K)</label>
                        <input 
                          type="text" 
                          placeholder="140K" 
                          value={editForm.socialLinks?.instagram?.followers || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              instagram: { ...editForm.socialLinks?.instagram, followers: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Profile URL Link</label>
                        <input 
                          type="url" 
                          placeholder="https://instagram.com/username" 
                          value={editForm.socialLinks?.instagram?.url || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              instagram: { ...editForm.socialLinks?.instagram, url: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* TikTok */}
                    <div className="p-4 bg-cyan-50/30 rounded-2xl border border-cyan-100/40 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2 flex items-center gap-2 pb-1 border-b border-cyan-100/30">
                        <Video className="w-4 h-4 text-cyan-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-cyan-700">TikTok Profile</span>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Handle</label>
                        <input 
                          type="text" 
                          placeholder="@username" 
                          value={editForm.socialLinks?.tiktok?.handle || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              tiktok: { ...editForm.socialLinks?.tiktok, handle: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Followers (e.g. 85K)</label>
                        <input 
                          type="text" 
                          placeholder="85K" 
                          value={editForm.socialLinks?.tiktok?.followers || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              tiktok: { ...editForm.socialLinks?.tiktok, followers: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Profile URL Link</label>
                        <input 
                          type="url" 
                          placeholder="https://tiktok.com/@username" 
                          value={editForm.socialLinks?.tiktok?.url || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              tiktok: { ...editForm.socialLinks?.tiktok, url: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                     {/* YouTube */}
                    <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/40 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2 flex items-center gap-2 pb-1 border-b border-rose-100/30">
                        <Laptop className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-rose-700">YouTube Channel</span>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Channel Name</label>
                        <input 
                          type="text" 
                          placeholder="Channel Name" 
                          value={editForm.socialLinks?.youtube?.handle || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              youtube: { ...editForm.socialLinks?.youtube, handle: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Subscribers (e.g. 250K)</label>
                        <input 
                          type="text" 
                          placeholder="250K" 
                          value={editForm.socialLinks?.youtube?.followers || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              youtube: { ...editForm.socialLinks?.youtube, followers: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Channel URL Link</label>
                        <input 
                          type="url" 
                          placeholder="https://youtube.com/c/ChannelName" 
                          value={editForm.socialLinks?.youtube?.url || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              youtube: { ...editForm.socialLinks?.youtube, url: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Twitter / X */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2 flex items-center gap-2 pb-1 border-b border-gray-250">
                        <Globe className="w-4 h-4 text-gray-800" />
                        <span className="text-xs font-black uppercase tracking-wider text-gray-800">Twitter / X Profile</span>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Handle</label>
                        <input 
                          type="text" 
                          placeholder="@username" 
                          value={editForm.socialLinks?.twitter?.handle || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              twitter: { ...editForm.socialLinks?.twitter, handle: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Followers</label>
                        <input 
                          type="text" 
                          placeholder="12K" 
                          value={editForm.socialLinks?.twitter?.followers || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              twitter: { ...editForm.socialLinks?.twitter, followers: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Profile URL Link</label>
                        <input 
                          type="url" 
                          placeholder="https://x.com/username" 
                          value={editForm.socialLinks?.twitter?.url || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              twitter: { ...editForm.socialLinks?.twitter, url: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Snapchat */}
                    <div className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-200/50 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2 flex items-center gap-2 pb-1 border-b border-yellow-150">
                        <Camera className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-amber-700">Snapchat Profile</span>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Handle</label>
                        <input 
                          type="text" 
                          placeholder="username" 
                          value={editForm.socialLinks?.snapchat?.handle || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              snapchat: { ...editForm.socialLinks?.snapchat, handle: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Subscribers / Reach</label>
                        <input 
                          type="text" 
                          placeholder="45K" 
                          value={editForm.socialLinks?.snapchat?.followers || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              snapchat: { ...editForm.socialLinks?.snapchat, followers: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Profile URL Link</label>
                        <input 
                          type="url" 
                          placeholder="https://snapchat.com/add/username" 
                          value={editForm.socialLinks?.snapchat?.url || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              snapchat: { ...editForm.socialLinks?.snapchat, url: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="font-bold mb-4">Portfolio</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {editForm.portfolio?.map((img: string, i: number) => (
                        <div key={i} className="aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden relative group">
                          <img src={img} alt="Portfolio" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setEditForm({...editForm, portfolio: editForm.portfolio.filter((_: any, index: number) => index !== i)})}
                            className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => portfolioInputRef.current?.click()}
                        disabled={uploadingPortfolio}
                        className="aspect-[9/16] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors disabled:opacity-50"
                      >
                        {uploadingPortfolio ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                          <>
                            <Upload className="w-6 h-6 mb-2" />
                            <span className="text-[10px] font-bold uppercase">Upload</span>
                          </>
                        )}
                      </button>
                      <input type="file" ref={portfolioInputRef} className="hidden" accept="image/*,video/*" onChange={handlePortfolioUpload} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Company Name</label>
                    <input type="text" value={editForm.companyName} onChange={e => setEditForm({...editForm, companyName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#A855F7]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#A855F7]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Industry</label>
                      <input type="text" value={editForm.industry} onChange={e => setEditForm({...editForm, industry: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#A855F7]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Website</label>
                      <input type="text" value={editForm.website} onChange={e => setEditForm({...editForm, website: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#A855F7]" />
                    </div>
                  </div>

                  {/* CONNECT CORPORATE SOCIALS */}
                  <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
                    <h3 className="font-bold text-sm text-[#141414] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Share className="w-4 h-4 text-[#A855F7]" /> Connect Corporate Social Handles
                    </h3>
                    <p className="text-xs text-gray-400">Add official corporate channels for your brand.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* LinkedIn */}
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <label className="text-[10px] font-black text-blue-700 uppercase mb-1 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> LinkedIn Link
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://linkedin.com/company/..."
                          value={editForm.socialLinks?.linkedin?.url || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              linkedin: { handle: e.target.value.split('/').pop() || "", url: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Twitter */}
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <label className="text-[10px] font-black text-gray-700 uppercase mb-1 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Twitter / X Link
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://x.com/brand"
                          value={editForm.socialLinks?.twitter?.url || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              twitter: { handle: e.target.value.split('/').pop() || "", url: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Instagram */}
                      <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                        <label className="text-[10px] font-black text-pink-700 uppercase mb-1 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" /> Instagram Link
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://instagram.com/brand"
                          value={editForm.socialLinks?.instagram?.url || ""} 
                          onChange={e => setEditForm({
                            ...editForm,
                            socialLinks: {
                              ...editForm.socialLinks,
                              instagram: { handle: e.target.value.split('/').pop() || "", url: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
           </div>
        ) : (
          <div className="space-y-8">
            {/* Vibe Theme Selector Banner */}
            {isCreator && (
              <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A855F7] animate-pulse" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#141414] block">Profile Vibe Customization</span>
                    <span className="text-[9px] font-semibold text-gray-400">Match your page style to your creator aesthetic</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                  {(["default", "bubblegum", "cyber", "royal", "slate"] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => {
                        setVibeTheme(theme);
                        toast.info(`Theme changed to ${theme.toUpperCase()} style!`, { duration: 1500 });
                      }}
                      className={cn(
                        "px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
                        vibeTheme === theme 
                          ? "bg-black text-white" 
                          : "text-gray-400 hover:text-black hover:bg-gray-150"
                      )}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Info Summary Card */}
            <div className={cn(
              "p-6 md:p-8 rounded-3xl border transition-all flex flex-col md:flex-row md:justify-between md:items-start gap-6 relative overflow-hidden",
              vibeTheme === "default" && "bg-white border-gray-150 shadow-sm",
              vibeTheme === "bubblegum" && "bg-pink-50/40 border-pink-100 shadow-sm",
              vibeTheme === "cyber" && "bg-slate-950 text-white border-purple-500/30 shadow-lg shadow-purple-500/5",
              vibeTheme === "royal" && "bg-amber-50/30 border-amber-200 shadow-sm",
              vibeTheme === "slate" && "bg-zinc-900 text-zinc-100 border-zinc-800 shadow-sm"
            )}>
              {/* Dynamic decorative backdrop for premium themes */}
              {vibeTheme === "cyber" && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />}
              {vibeTheme === "bubblegum" && <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />}

              <div className="z-10 flex-1">
                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <h1 className="text-3xl font-black tracking-tight">
                    {isCreator ? profile?.username || userData.name : profile?.companyName || userData.name}
                  </h1>
                  
                  {isCreator && (
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-[8px] font-black uppercase tracking-widest rounded-full border border-sky-200 flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5 fill-sky-700 text-white" /> Verified Creator
                    </span>
                  )}
                </div>

                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest mb-4",
                  vibeTheme === "cyber" ? "text-[#BEF264]" : "text-[#A855F7]"
                )}>
                  {isCreator ? profile?.category || 'Lifestyle & UGC Creator' : profile?.industry || 'Brand'}
                </p>

                <p className={cn(
                  "max-w-xl leading-relaxed mb-6 font-medium text-sm",
                  vibeTheme === "cyber" || vibeTheme === "slate" ? "text-zinc-300" : "text-gray-600"
                )}>
                  {isCreator ? (profile?.bio || 'Gen-Z tech & lifestyle creator crafting authentic, high-converting content for elite brands.') : (profile?.description || 'No description yet.')}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                  {isCreator && profile?.location && (
                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-red-500" /> {profile.location}</div>
                  )}
                  {(!isCreator && profile?.website) && (
                    <div className="flex items-center gap-1"><LinkIcon className="w-4 h-4 text-purple-500" /> {profile.website}</div>
                  )}
                  <div className="flex items-center gap-1 bg-[#BEF264] text-[#141414] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest text-[9px] border border-[#a6e03f]">
                    <Star className="w-3 h-3 fill-[#141414]" /> {isCreator ? `CRYOVA Score: 98.7` : 'Verified Brand'}
                  </div>
                </div>
              </div>

              {isCreator && (
                <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto z-10">
                  <button 
                    onClick={() => setIsCardModalOpen(true)}
                    className="px-5 py-3 bg-black text-white hover:bg-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-gray-700 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-[#BEF264]" /> Digital Business Card
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-3 bg-white text-black border border-gray-200 hover:bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" /> Customize Hub
                  </button>
                </div>
              )}
            </div>

            {/* Creator Sub-Tabs Controller */}
            {isCreator && (
              <div className="flex border-b border-gray-200 overflow-x-auto gap-2 scrollbar-none">
                {[
                  { id: "resume", label: "Creator Resume", icon: BookOpen },
                  { id: "services", label: "Contra Services", icon: Laptop },
                  { id: "mediakit", label: "Interactive Media Kit", icon: Calculator },
                  { id: "showcase", label: "Portfolio Showcase", icon: Star },
                  { id: "finance", label: "Money Dashboard", icon: DollarSign },
                  { id: "achievements", label: "XP & Milestones", icon: Trophy }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id as any)}
                      className={cn(
                        "px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 whitespace-nowrap",
                        activeSubTab === tab.id 
                          ? "border-[#141414] text-[#141414] bg-white font-black" 
                          : "border-transparent text-gray-400 hover:text-black hover:border-gray-200"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Render Tabs content */}
            {isCreator ? (
              <AnimatePresence mode="wait">
                {activeSubTab === "resume" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Professional Details */}
                      <div className="md:col-span-2 space-y-6">
                        {/* Skills & Endorsements */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <div className="mb-4">
                            <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-amber-500" /> LinkedIn-Style Skill Endorsements
                            </h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">Click any skill to +1 endorse and verify this creator's capability</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-6">
                            {Object.entries(skillsEndorsements).map(([skill, countVal]) => {
                              const count = countVal as number;
                              return (
                                <button 
                                  key={skill} 
                                  onClick={() => {
                                    setSkillsEndorsements(prev => ({ ...prev, [skill]: count + 1 }));
                                    toast.success(`You endorsed "${skill}"! New count: ${count + 1}`, { icon: "✨" });
                                  }}
                                  className="px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-[#141414] border border-gray-200 hover:border-purple-300 rounded-xl text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <span>{skill}</span>
                                  <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">+{count}</span>
                                </button>
                              );
                            })}
                          </div>

                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-blue-500" /> Languages Spoken
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {["English (Native)", "Spanish (Conversational)", "Japanese (Fluent)"].map((lang) => (
                              <span key={lang} className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-100 rounded-lg text-xs font-black uppercase tracking-wide">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Work & Campaign Experience Timeline */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-emerald-500" /> Professional Experience Timeline
                              </h3>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Verified track record on major corporate contracts</p>
                            </div>
                            <button 
                              onClick={() => setShowExpForm(!showExpForm)}
                              className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-all cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Experience
                            </button>
                          </div>

                          {showExpForm && (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!newExpRole || !newExpCompany) return;
                                setExperiences(prev => [
                                  {
                                    id: Date.now(),
                                    role: newExpRole,
                                    company: newExpCompany,
                                    duration: newExpDuration || "Present",
                                    description: newExpDesc
                                  },
                                  ...prev
                                ]);
                                setNewExpRole("");
                                setNewExpCompany("");
                                setNewExpDuration("");
                                setNewExpDesc("");
                                setShowExpForm(false);
                                toast.success("Experience added to your interactive resume!");
                              }}
                              className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 mb-6"
                            >
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Role Title</label>
                                  <input type="text" placeholder="UGC Video Lead" required value={newExpRole} onChange={e => setNewExpRole(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Brand / Company</label>
                                  <input type="text" placeholder="Nike Sports" required value={newExpCompany} onChange={e => setNewExpCompany(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Duration</label>
                                  <input type="text" placeholder="Jan 2026 - Present" value={newExpDuration} onChange={e => setNewExpDuration(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Key Deliverables & Impact</label>
                                <textarea rows={2} placeholder="Created high-retaining short-form hooks, generating 24% boost in CTR." value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                              </div>
                              <button type="submit" className="w-full py-1.5 bg-[#BEF264] text-[#141414] hover:bg-[#a6e03f] text-[9px] font-black uppercase tracking-widest rounded-lg">Save Position</button>
                            </form>
                          )}

                          <div className="relative border-l-2 border-gray-150 pl-5 ml-2.5 space-y-6">
                            {experiences.map((exp) => (
                              <div key={exp.id} className="relative">
                                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#141414] flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                                </div>
                                <h4 className="font-black text-xs text-[#141414]">{exp.role}</h4>
                                <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wide">{exp.company} ● <span className="text-gray-400">{exp.duration}</span></p>
                                <p className="text-xs text-gray-500 mt-1 font-semibold">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* LinkedIn-Style Peer/Brand Recommendations */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-indigo-500" /> Peer & Client Recommendations
                              </h3>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Written testimonials from trusted co-collaborators</p>
                            </div>
                            <button 
                              onClick={() => setShowRecForm(!showRecForm)}
                              className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-all cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Write Recommendation
                            </button>
                          </div>

                          {showRecForm && (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!newRecSender || !newRecText) return;
                                setRecommendations(prev => [
                                  {
                                    sender: newRecSender,
                                    relationship: newRecRelation || "Creator Partner",
                                    text: newRecText,
                                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
                                    date: "Just now"
                                  },
                                  ...prev
                                ]);
                                setNewRecSender("");
                                setNewRecRelation("");
                                setNewRecText("");
                                setShowRecForm(false);
                                toast.success("Your recommendation was published live!");
                              }}
                              className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3"
                            >
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Your Name</label>
                                  <input type="text" placeholder="Sarah Jenkins" required value={newRecSender} onChange={e => setNewRecSender(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Relationship / Title</label>
                                  <input type="text" placeholder="Creative Director at Sephora" value={newRecRelation} onChange={e => setNewRecRelation(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Your recommendation</label>
                                <textarea rows={2} required placeholder="This creator is highly professional, delivers scripts ahead of schedule, and has exceptional audio-first vision." value={newRecText} onChange={e => setNewRecText(e.target.value)} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none" />
                              </div>
                              <button type="submit" className="w-full py-1.5 bg-[#BEF264] text-[#141414] hover:bg-[#a6e03f] text-[9px] font-black uppercase tracking-widest rounded-lg">Publish Recommendations</button>
                            </form>
                          )}

                          <div className="space-y-4">
                            {recommendations.map((rec, idx) => (
                              <div key={idx} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex gap-3">
                                <img src={rec.avatar} alt={rec.sender} className="w-10 h-10 object-cover rounded-xl border border-gray-200" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-bold text-xs text-[#141414]">{rec.sender}</h5>
                                      <span className="text-[9px] font-bold text-[#A855F7]">{rec.relationship}</span>
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-semibold">{rec.date}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-2 font-medium italic">"{rec.text}"</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Reputation Trust Score */}
                      <div className="space-y-6">
                        <div className="bg-[#141414] text-white p-6 rounded-3xl shadow-md border border-gray-800">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#BEF264] mb-1">Reputation Analytics</h4>
                          <h3 className="text-xl font-serif italic mb-6">Trust & Reliability Score</h3>
                          
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-[#BEF264] flex flex-col items-center justify-center border-4 border-white/20">
                              <span className="text-xl font-black text-[#141414]">98.7</span>
                              <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tight">/ 100</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase text-white">Platinum Partner</p>
                              <p className="text-[10px] text-gray-400 mt-1">Top 1% of creators for brand feedback and promptness</p>
                            </div>
                          </div>

                          <div className="space-y-3.5 border-t border-gray-800 pt-4 text-xs font-bold">
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Delivery Rate</span>
                              <span className="text-white">100% (On-Time)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#BEF264]" /> Response Time</span>
                              <span className="text-white">Under 1 hour</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5"><ThumbsUp className="w-3.5 h-3.5 text-sky-400" /> Communication</span>
                              <span className="text-white">A+ Premium</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-pink-400" /> Audience Authenticity</span>
                              <span className="text-white">99.4% (Verified)</span>
                            </div>
                          </div>
                        </div>

                        {/* Connected Accounts display */}
                        {profile?.socialLinks && (
                          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distribution Channels</h4>
                            <div className="space-y-3">
                              {Object.entries(profile.socialLinks).map(([platform, info]: [string, any]) => {
                                if (!info || !info.handle) return null;
                                return (
                                  <div key={platform} className="flex justify-between items-center text-xs">
                                    <span className="capitalize font-bold text-gray-600">{platform}</span>
                                    <span className="font-mono text-gray-400">@{info.handle}</span>
                                    <span className="font-black text-[#A855F7]">{info.followers || "N/A"} reach</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSubTab === "services" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    {/* Zero Commission Header */}
                    <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-6 rounded-3xl border border-purple-500/20 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-[#BEF264] text-[#141414] text-[8px] font-black uppercase tracking-widest rounded">Contra-Style 0% Commission</span>
                          <span className="text-xs font-mono text-purple-300">Commission-Free Zone</span>
                        </div>
                        <h3 className="text-xl font-serif italic font-bold">Keep 100% of your earnings</h3>
                        <p className="text-xs text-purple-200 mt-1 max-w-xl">Every package ordered below bypasses standard marketplace service fees. Clients lock budgets in escrow, and you receive pure direct payout with zero commission cuts.</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264]">Zero Fee Active</span>
                        <div className="w-2 h-2 rounded-full bg-[#BEF264] animate-pulse" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Packages Grid */}
                      <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {contraServices.map((svc) => (
                            <div key={svc.id} className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between hover:border-[#A855F7] transition-all relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-3xl flex items-center justify-center text-xl">
                                {svc.icon}
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-[#A855F7] uppercase tracking-widest block mb-1">{svc.delivery} delivery</span>
                                <h4 className="font-black text-base text-[#141414] pr-10">{svc.title}</h4>
                                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">{svc.description}</p>
                                
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Deliverables</span>
                                  {svc.deliverables.map((del, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <span>{del}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Fixed Price</span>
                                  <span className="text-xl font-serif italic font-black text-[#141414]">${svc.price}</span>
                                </div>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(`https://cryova.com/checkout/service-${svc.id}`);
                                    toast.success("Secured Contra payment checkout link copied to clipboard! Share it in your brand chat.", { icon: "🔥" });
                                  }}
                                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                                >
                                  Order Service
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Custom Package Creator */}
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-[#A855F7]" /> Add New Contra Package
                          </h3>
                          <p className="text-[10px] text-gray-400 mb-4 leading-relaxed font-semibold">Publish a new standardized gig package directly to your professional services profile.</p>

                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!newSvcTitle || !newSvcPrice) return;
                              const delArray = newSvcDeliverables 
                                ? newSvcDeliverables.split(',').map(s => s.trim())
                                : ["1 high-converting video", "Raw files handoff"];
                              
                              setContraServices(prev => [
                                ...prev,
                                {
                                  id: Date.now(),
                                  title: newSvcTitle,
                                  price: parseInt(newSvcPrice) || 350,
                                  delivery: newSvcDelivery,
                                  description: newSvcDesc || "Standardized professional delivery package with verified timeline.",
                                  deliverables: delArray,
                                  icon: ["🎬", "🔊", "💻", "👗", "✨"][Math.floor(Math.random() * 5)]
                                }
                              ]);
                              
                              setNewSvcTitle("");
                              setNewSvcPrice("");
                              setNewSvcDesc("");
                              setNewSvcDeliverables("");
                              toast.success("Contra Service package listed live!");
                            }}
                            className="space-y-3.5 text-xs font-bold"
                          >
                            <div>
                              <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Package Title</label>
                              <input type="text" required placeholder="e.g. 3x TikTok Hook Variations" value={newSvcTitle} onChange={e => setNewSvcTitle(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Price ($ USD)</label>
                                <input type="number" required placeholder="450" value={newSvcPrice} onChange={e => setNewSvcPrice(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                              </div>
                              <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Timeline</label>
                                <input type="text" placeholder="5 days" value={newSvcDelivery} onChange={e => setNewSvcDelivery(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Brief Description</label>
                              <textarea rows={2} placeholder="One short video designed to catch instant visual loops..." value={newSvcDesc} onChange={e => setNewSvcDesc(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Deliverables Checklist (Comma separated)</label>
                              <input type="text" placeholder="1 vertical video, raw file transfer, 3 hooks" value={newSvcDeliverables} onChange={e => setNewSvcDeliverables(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-[#BEF264] hover:bg-[#a6e03f] text-[#141414] text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">
                              Publish Package
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSubTab === "mediakit" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    {/* Media kit metrics and charts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-6">
                        {/* Demographic charts */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-500" /> Interactive Media Kit Analytics
                          </h3>
                          
                          {/* Recharts Area Chart for audience trends */}
                          <div className="mb-6">
                            <h4 className="text-xs font-black text-[#141414] uppercase mb-4">Audience Growth (Last 6 Months)</h4>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                  { month: "Feb", followers: 15000, reach: 25000 },
                                  { month: "Mar", followers: 28000, reach: 45000 },
                                  { month: "Apr", followers: 42000, reach: 75000 },
                                  { month: "May", followers: 64000, reach: 110000 },
                                  { month: "Jun", followers: 89000, reach: 165000 },
                                  { month: "Jul", followers: 125000, reach: 240000 }
                                ]}>
                                  <defs>
                                    <linearGradient id="colorFollow" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#BEF264" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#BEF264" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                                  <Tooltip />
                                  <Area type="monotone" dataKey="followers" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorFollow)" name="Subscribers" />
                                  <Area type="monotone" dataKey="reach" stroke="#BEF264" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" name="Impression Reach" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                            {/* Engagement rates */}
                            <div>
                              <h4 className="text-xs font-black text-[#141414] uppercase mb-4">Engagement Rate by Platform</h4>
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                    { platform: "TikTok", rate: 8.4 },
                                    { platform: "Insta", rate: 5.2 },
                                    { platform: "YouTube", rate: 6.9 },
                                    { platform: "X", rate: 4.1 }
                                  ]}>
                                    <XAxis dataKey="platform" stroke="#94A3B8" fontSize={10} tickLine={false} />
                                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="rate" fill="#141414" radius={[8, 8, 0, 0]}>
                                      <Cell fill="#A855F7" />
                                      <Cell fill="#EC4899" />
                                      <Cell fill="#EF4444" />
                                      <Cell fill="#141414" />
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Age Demographics Pie */}
                            <div>
                              <h4 className="text-xs font-black text-[#141414] uppercase mb-4">Audience Age Demographics</h4>
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie data={[
                                      { name: "Gen Z (13-24)", value: 65, fill: "#A855F7" },
                                      { name: "Millennials (25-34)", value: 25, fill: "#BEF264" },
                                      { name: "Other", value: 10, fill: "#141414" }
                                    ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                                      <Cell fill="#A855F7" />
                                      <Cell fill="#BEF264" />
                                      <Cell fill="#E4E4E7" />
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Dynamic Live Rate Calculator */}
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                            <Calculator className="w-4 h-4 text-[#A855F7]" /> Campaign Rate Estimator
                          </h3>
                          <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">Adjust deliverables dynamically to quote custom brand proposals in real time.</p>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-[#141414]">UGC Videos Qty: {calcVideos}</span>
                                <span className="text-gray-400">${calcVideos * calcRatePerVideo}</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="10" 
                                value={calcVideos} 
                                onChange={(e) => setCalcVideos(parseInt(e.target.value))}
                                className="w-full accent-[#A855F7]" 
                              />
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-[#141414]">Social Image Posts Qty: {calcPosts}</span>
                                <span className="text-gray-400">${calcPosts * calcRatePerPost}</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="10" 
                                value={calcPosts} 
                                onChange={(e) => setCalcPosts(parseInt(e.target.value))}
                                className="w-full accent-[#BEF264]" 
                              />
                            </div>

                            <div className="border-t border-gray-150 pt-4 mt-6">
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Total Quote Estimate</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black italic text-[#141414] font-serif">
                                  ${(calcVideos * calcRatePerVideo) + (calcPosts * calcRatePerPost)}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600">USD</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                toast.success("Proposal quote copied to clipboard! Share it in your Messages chat.");
                              }}
                              className="w-full mt-4 py-3 bg-[#BEF264] hover:bg-[#a6e03f] text-[#141414] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                            >
                              Copy Proposal Link
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSubTab === "showcase" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-8"
                  >
                    {/* Showcase of before/after, bts, and campaign case studies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[8px] font-black uppercase tracking-widest rounded inline-block">Before & After Case Study</span>
                        <h4 className="font-bold text-lg text-[#141414]">Summer Air Shorts Hook Engagement Boost</h4>
                        <p className="text-xs text-gray-500 font-medium">Rebuilt Nike's UGC video asset script structure to lead with a high-intensity 1.5-second visual hook instead of a generic product description.</p>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                            <span className="text-[9px] font-black text-red-600 uppercase">Original Hook</span>
                            <div className="text-xl font-bold mt-1 text-[#141414]">2.1%</div>
                            <span className="text-[9px] font-bold text-gray-400">View Retention</span>
                          </div>
                          <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                            <span className="text-[9px] font-black text-green-600 uppercase">New Visual Hook</span>
                            <div className="text-xl font-bold mt-1 text-emerald-600">8.4%</div>
                            <span className="text-[9px] font-bold text-gray-400">View Retention</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[8px] font-black uppercase tracking-widest rounded inline-block">Behind the Scenes (BTS)</span>
                        <h4 className="font-bold text-lg text-[#141414]">How I shoot ASMR keyboard unboxings</h4>
                        <p className="text-xs text-gray-500 font-medium">Using dual-channel shotgun mics & 4K macros to frame premium mechanical keys. We prioritize direct product resonance that matches Gen-Z ASMR trends.</p>
                        
                        <div className="aspect-video bg-gray-100 rounded-xl relative group overflow-hidden border border-gray-200">
                          <img src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80" alt="BTS" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Video className="w-10 h-10 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Standard Portfolio list */}
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-500" /> Deliverables Archive
                      </h3>
                      {profile?.portfolio?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {profile.portfolio.map((img: string, i: number) => (
                            <div key={i} className="aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden relative group cursor-pointer border border-gray-150">
                              <img src={img} alt="Portfolio piece" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 bg-white border border-gray-150 border-dashed rounded-3xl text-center flex flex-col items-center justify-center">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">No portfolio items yet.</p>
                          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Upload Item</button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeSubTab === "finance" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Financial Ledger */}
                      <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-emerald-600" /> Income Log Ledger
                          </h3>
                          <form onSubmit={handleAddRevenue} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <div>
                              <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Income Source</label>
                              <input 
                                type="text" 
                                placeholder="Nike, Sephora, Affiliate" 
                                value={newRevSource} 
                                onChange={(e) => setNewRevSource(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Amount ($ USD)</label>
                              <input 
                                type="number" 
                                placeholder="1200" 
                                value={newRevAmount} 
                                onChange={(e) => setNewRevAmount(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex items-end">
                              <button type="submit" className="w-full py-1.5 bg-[#BEF264] text-[#141414] hover:bg-[#a6e03f] rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                                Log Income
                              </button>
                            </div>
                          </form>

                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {revenueItems.map((item) => (
                              <div key={item.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <div>
                                    <p className="font-bold text-[#141414]">{item.source}</p>
                                    <p className="text-[10px] text-gray-400 font-semibold">{item.date} ● {item.category}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-[#141414]">${item.amount}</span>
                                  <span className="block text-[8px] font-bold text-gray-400">{item.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Expense Log */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-red-500" /> Expense Tracker
                          </h3>
                          <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <div>
                              <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Expense Label</label>
                              <input 
                                type="text" 
                                placeholder="Adobe premium, gear" 
                                value={newExpLabel} 
                                onChange={(e) => setNewExpLabel(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Amount ($ USD)</label>
                              <input 
                                type="number" 
                                placeholder="45" 
                                value={newExpAmount} 
                                onChange={(e) => setNewExpAmount(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs focus:outline-none"
                              />
                            </div>
                            <div className="flex items-end">
                              <button type="submit" className="w-full py-1.5 bg-black text-white hover:bg-gray-800 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                                Log Expense
                              </button>
                            </div>
                          </form>

                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {expensesItems.map((item) => (
                              <div key={item.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-bold text-[#141414]">{item.label}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold">{item.date} ● {item.category}</p>
                                </div>
                                <span className="font-black text-red-600">-${item.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: High level financial statement */}
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Statement Summary</h4>
                          <h3 className="font-bold text-lg text-[#141414] mb-6">Net Income (This Month)</h3>

                          {(() => {
                            const totalRev = revenueItems.reduce((acc, c) => acc + c.amount, 0);
                            const totalExp = expensesItems.reduce((acc, c) => acc + c.amount, 0);
                            const netVal = totalRev - totalExp;
                            return (
                              <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Gross Income</span>
                                  <span className="text-lg font-black text-emerald-800">${totalRev.toFixed(2)}</span>
                                </div>

                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex justify-between items-center">
                                  <span className="text-xs font-black uppercase tracking-wider text-red-700">Expenses</span>
                                  <span className="text-lg font-black text-red-800">-${totalExp.toFixed(2)}</span>
                                </div>

                                <div className="p-5 bg-purple-50 rounded-3xl border border-purple-100 flex justify-between items-center">
                                  <span className="text-xs font-black uppercase tracking-wider text-[#A855F7]">Net Balance</span>
                                  <span className="text-xl font-black text-purple-800">${netVal.toFixed(2)}</span>
                                </div>

                                {/* Goals progress */}
                                <div className="pt-4 border-t border-gray-100">
                                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                    <span>Taxes Allocation (Estimated 25%)</span>
                                    <span>${(totalRev * 0.25).toFixed(0)}</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-400" style={{ width: "25%" }} />
                                  </div>
                                  <p className="text-[9px] text-gray-400 mt-1 font-semibold">Keep 25% of all incoming checks in a savings folder for quarterly tax payments.</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSubTab === "achievements" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Milestones */}
                      <div className="md:col-span-2 space-y-6">
                        {/* Gamified Levels */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">GAMIFICATION ENGINE</span>
                              <h3 className="font-bold text-xl text-[#141414]">Creator Levels & XP Tracker</h3>
                            </div>
                            <div className="text-right">
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 font-black text-[10px] uppercase tracking-widest rounded-lg">Level 4</span>
                            </div>
                          </div>

                          <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                              <span>3,450 XP accumulated</span>
                              <span>4,000 XP (Level 5)</span>
                            </div>
                            <div className="h-2 w-full bg-gray-150 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#A855F7] to-[#BEF264]" style={{ width: "86.25%" }} />
                            </div>
                            <p className="text-[10px] text-gray-400 font-semibold">Generate 550 more XP to unlock Level 5 perks ($5,000+ budget Campaign access & Priority recommendation algorithm boost).</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                              <span className="text-[9px] font-black text-gray-400 uppercase">Daily Login Streak</span>
                              <div className="text-xl font-bold mt-1 text-[#141414] flex items-center gap-1.5">
                                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> 14 Days Streak
                              </div>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                              <span className="text-[9px] font-black text-gray-400 uppercase">Completed Campaigns</span>
                              <div className="text-xl font-bold mt-1 text-[#141414] flex items-center gap-1.5">
                                <Award className="w-5 h-5 text-purple-600 fill-purple-100" /> 8 Brand Jobs
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Badges showcase */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-amber-500" /> Earned Emoji Achievements
                          </h3>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {[
                              { emoji: "⚡️", name: "High Retention", desc: "Average view rate > 8%", bg: "bg-amber-50 border-amber-100 text-amber-800" },
                              { emoji: "🏆", name: "Nike Alum", desc: "Completed first Nike campaign", bg: "bg-purple-50 border-purple-100 text-purple-800" },
                              { emoji: "💬", name: "Active Chat", desc: "Under 1 hr reply speed", bg: "bg-blue-50 border-blue-100 text-blue-800" },
                              { emoji: "🚀", name: "Fast Shipper", desc: "UGC delivered < 24 hours", bg: "bg-pink-50 border-pink-100 text-pink-800" },
                              { emoji: "🔥", name: "Streak Legend", desc: "Maintained 10-day active logins", bg: "bg-orange-50 border-orange-100 text-orange-800" },
                              { emoji: "✨", name: "AI Bio Master", desc: "Generated customizable bio", bg: "bg-emerald-50 border-emerald-100 text-emerald-800" }
                            ].map((badge) => (
                              <div key={badge.name} className={cn("p-4 border rounded-2xl flex flex-col items-center justify-center text-center", badge.bg)}>
                                <span className="text-3xl mb-2">{badge.emoji}</span>
                                <h5 className="font-black text-xs uppercase tracking-tight">{badge.name}</h5>
                                <p className="text-[9px] text-gray-500 font-semibold leading-tight mt-1">{badge.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Streaks & Awards info */}
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Monthly Milestones</h4>
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <span className="text-lg">🎯</span>
                              <div>
                                <p className="text-xs font-bold text-[#141414]">Complete 10 campaigns</p>
                                <p className="text-[10px] text-gray-400">Progress: 8 / 10</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-lg">💰</span>
                              <div>
                                <p className="text-xs font-bold text-[#141414]">Earn $5,000 this month</p>
                                <p className="text-[10px] text-gray-400">Progress: $4,250 / $5,000</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              /* Brand Layout read-only display */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">Official Brand Mission</h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{profile?.description || "Creating beautiful products to inspire digital communities everywhere."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Digital Business Card Modal Popover */}
            <AnimatePresence>
              {isCardModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white max-w-sm w-full rounded-3xl overflow-hidden border border-gray-100 shadow-2xl p-6 relative flex flex-col items-center"
                  >
                    <button 
                      onClick={() => setIsCardModalOpen(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-black hover:bg-gray-100 p-1 rounded-full transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center mt-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 border-2 border-black relative">
                        {userData.avatar ? (
                          <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#141414] flex items-center justify-center text-white text-3xl font-serif italic">{userData.name.charAt(0)}</div>
                        )}
                      </div>
                      <h3 className="font-black text-xl text-[#141414]">{userData.name}</h3>
                      <p className="text-[10px] font-black text-[#A855F7] uppercase tracking-widest mb-1">@{profile?.username || "creator"}</p>
                      <p className="text-xs text-gray-400 font-bold mb-6">{profile?.category || "UGC Lifestyle & Fashion"}</p>

                      {/* Mock QR Code */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6">
                        <div className="w-36 h-36 bg-white border border-gray-300 rounded-xl p-2 flex items-center justify-center relative">
                          {/* Beautiful simulated QR vector pattern */}
                          <div className="grid grid-cols-6 gap-1 w-full h-full opacity-80">
                            {Array.from({ length: 36 }).map((_, i) => (
                              <div key={i} className={cn(
                                "rounded-sm",
                                (i % 3 === 0 || i % 7 === 0 || i < 6 || i % 6 === 0 || i > 30) ? "bg-black" : "bg-transparent"
                              )} />
                            ))}
                          </div>
                          <div className="absolute inset-0 m-auto w-10 h-10 bg-white border border-gray-100 rounded-lg shadow-md flex items-center justify-center">
                            <Zap className="w-5 h-5 text-[#A855F7] fill-[#A855F7]" />
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block text-center mt-2.5">NFC Scan to Connect</span>
                      </div>

                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Profile URL copied to clipboard!");
                          }}
                          className="flex-1 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-1 border border-gray-800"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </button>
                        <button 
                          onClick={() => {
                            toast.success("Wallet pass generated! Tap 'Add to Wallet' on your mobile browser.");
                          }}
                          className="flex-1 py-3 bg-[#BEF264] text-[#141414] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#a6e03f] transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Apple Wallet
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
