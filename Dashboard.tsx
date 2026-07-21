import React, { useEffect, useState, useRef } from "react";
import { 
  Sparkles, TrendingUp, DollarSign, Eye, ArrowUpRight, Flame, Play, 
  CheckCircle2, Clock, ThumbsUp, Calendar, Award, Shield, Heart, 
  MessageSquare, Share2, FileText, Users, Lock, Music, MessageCircle, 
  CheckCircle, Video, Smartphone, Plus, Trash2, PlusSquare, MapPin, 
  Ticket, ChevronRight, Mic, Volume2, BookOpen, X, Briefcase, Layers, Globe, 
  Settings, Zap, Copy, Star, EyeOff, Loader2, Send, ChevronLeft,
  Sliders, UserCheck, ShoppingBag
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { collection, getDocs, query, limit, orderBy, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Campaign } from "../types";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, PieChart, Pie } from "recharts";

// Lightweight className merge utility
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default function Dashboard() {
  const { userData } = useAuth();
  const role = userData?.role || "creator";

  // Navigation Subtabs
  const [activeTab, setActiveTab] = useState<"overview" | "ai_lab" | "workflows" | "gigs" | "connect" | "academy" | "addons">("overview");

  // Recommended campaigns from Firestore
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // 1. GAMIFICATION SYSTEM STATES
  const [xp, setXp] = useState(450);
  const [level, setLevel] = useState(3);
  const [streak, setStreak] = useState(5);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Helper to add XP
  const addXpPoints = (points: number) => {
    setXp((prevXp) => {
      const newXp = prevXp + points;
      const xpNeeded = level * 300;
      if (newXp >= xpNeeded) {
        setLevel((l) => l + 1);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
        toast.success(`🎉 LEVEL UP! You are now Level ${level + 1}!`, { duration: 4000 });
        return newXp - xpNeeded;
      }
      return newXp;
    });
    toast.success(`+${points} XP Earned!`, { icon: "✨" });
  };

  // Check-in / Streak helper
  const handleCheckIn = () => {
    if (hasCheckedIn) {
      toast.info("You've checked in for today! Come back tomorrow.");
      return;
    }
    setStreak((s) => s + 1);
    setHasCheckedIn(true);
    addXpPoints(50);
    toast.success("🔥 Daily Streak Checked-In! Keep up the grind!", { duration: 3000 });
  };

  // 2. AI WRITING LAB STATES
  const [aiConcept, setAiConcept] = useState("");
  const [aiCategory, setAiCategory] = useState("Lifestyle");
  const [aiScriptResult, setAiScriptResult] = useState<any>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [hookTopic, setHookTopic] = useState("");
  const [aiHooks, setAiHooks] = useState<string[]>([]);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);

  const handleGenerateScript = async () => {
    if (!aiConcept) {
      toast.error("Please enter a content concept first.");
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/gemini/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: `creator wanting script for category: ${aiCategory} with details: ${aiConcept}` })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAiScriptResult({
            hook: data[0]?.title || "The ultimate visual loop teaser",
            body: data[0]?.description || "Detailed video hook outline",
            cta: data[1]?.description || "Call to action link in bio"
          });
          addXpPoints(40);
          return;
        }
      }
      // Fallback script
      const fallbackScripts: Record<string, { hook: string, body: string, cta: string }> = {
        ASMR: {
          hook: "🔊 *TAPS MIC* This sound will trigger instant focus. Today we are unboxing...",
          body: "Begin close-up macro lens shots of the packaging. Slow peeling sounds. Whisper the main core product specifications in 3 lines.",
          cta: "Drop a '👂' emoji if you felt that focus loop! Code 'ASMR15' in bio."
        },
        SaaS: {
          hook: "❌ Stop wasting 4 hours a day on admin work. Here's how I automated my entire pipeline.",
          body: "Screen record the browser dashboard workspace. Toggle custom automation triggers. Explain the exact ROI time-saved metrics.",
          cta: "Try it completely free via the custom link in my bio right now!"
        },
        Fashion: {
          hook: "👗 1 Outfit, 3 different vibe settings. Let's style this minimal neutral blazer.",
          body: "Transition from street casual style (hoodie & caps), to co-working day professional, to late night club elegant with quick spin animations.",
          cta: "Which of the 3 blazer fits is your aesthetic? Blazer model linked below."
        },
        Lifestyle: {
          hook: "☀️ A realistic 6:00 AM vlog of a full-time creator living in Cairo.",
          body: "Pouring double-espresso closeups. Setting up my workspace studio lights. Showing my daily custom Notion pipeline updates.",
          cta: "Comment 'VLOG' and I'll dm you my custom content organizer templates!"
        }
      };
      setAiScriptResult(fallbackScripts[aiCategory] || fallbackScripts["Lifestyle"]);
      addXpPoints(40);
    } catch (err) {
      toast.error("AI engine busy. Loading premium template.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleGenerateHooks = () => {
    if (!hookTopic) {
      toast.error("Enter a product/topic first!");
      return;
    }
    setIsGeneratingHooks(true);
    setTimeout(() => {
      const options = [
        `🔥 "The forbidden secret about ${hookTopic} brands don't want you to know..."`,
        `👀 "I replaced my daily routine with this ${hookTopic} for 7 days, and honestly..."`,
        `❌ "Please stop buying generic ${hookTopic}. Use this verified alternative instead."`
      ];
      setAiHooks(options);
      addXpPoints(30);
      setIsGeneratingHooks(false);
      toast.success("Hooks generated!");
    }, 1200);
  };

  // Trending Sounds lists
  const trendingSounds = [
    { title: "Retro Synths Loop (Viral)", usage: "142K videos this week", energy: 98, vibe: "ASMR / Tech" },
    { title: "Coffee Shop Rain Cafe Whispers", usage: "84K videos this week", energy: 82, vibe: "Lifestyle vlog" },
    { title: "Hyperpop Bass Boosted Hook", usage: "220K videos this week", energy: 94, vibe: "Fashion / Transition" }
  ];

  // 3. WORKFLOWS STATES (Calendar & Tasks)
  const [calendarEvents, setCalendarEvents] = useState([
    { id: 1, date: "2026-07-21", title: "Shoot Nike ASMR video", status: "In Progress", type: "Reel" },
    { id: 2, date: "2026-07-22", title: "Post Sephora Routine", status: "Planned", type: "TikTok" },
    { id: 3, date: "2026-07-24", title: "Logitech Deliverables Review", status: "Planned", type: "UGC Video" }
  ]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("2026-07-21");
  const [newEventType, setNewEventType] = useState("TikTok");

  const [quests, setQuests] = useState([
    { id: 1, label: "Complete Nike Summer Deliverables", reward: 80, completed: false, tag: "Nike" },
    { id: 2, label: "Link secondary Instagram metrics in settings", reward: 40, completed: false, tag: "Profile" },
    { id: 3, label: "Verify Egypt/SA residency documents", reward: 100, completed: true, tag: "Security" },
    { id: 4, label: "Pitch a technology brand via marketplace", reward: 60, completed: false, tag: "Pitch" }
  ]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    const item = {
      id: Date.now(),
      date: newEventDate,
      title: newEventTitle,
      status: "Planned",
      type: newEventType
    };
    setCalendarEvents((prev) => [...prev, item]);
    setNewEventTitle("");
    addXpPoints(25);
    toast.success("Calendar content item scheduled!");
  };

  const handleToggleQuest = (id: number) => {
    setQuests((prev) => prev.map((q) => {
      if (q.id === id) {
        const nextState = !q.completed;
        if (nextState) {
          addXpPoints(q.reward);
        }
        return { ...q, completed: nextState };
      }
      return q;
    }));
  };

  // 4. OPPORTUNITIES STATES (Gigs & Escrow Contracts & Affiliate)
  const [selectedGigTab, setSelectedGigTab] = useState<"marketplace" | "pitch" | "escrow" | "affiliate" | "sync">("marketplace");
  const [gigFilter, setGigFilter] = useState("all");
  const [selectedCampaignForPitch, setSelectedCampaignForPitch] = useState<any>(null);
  const [customPitchText, setCustomPitchText] = useState("");
  const [customPitchRate, setCustomPitchRate] = useState("450");
  const [generatedPitchDeck, setGeneratedPitchDeck] = useState("");

  // Cross-Platform Sync states (LinkedIn, Upwork, Contra)
  const [liSynced, setLiSynced] = useState(false);
  const [upworkSynced, setUpworkSynced] = useState(false);
  const [contraSynced, setContraSynced] = useState(false);
  const [isSyncingLI, setIsSyncingLI] = useState(false);
  const [isSyncingUpwork, setIsSyncingUpwork] = useState(false);
  const [isSyncingContra, setIsSyncingContra] = useState(false);

  // Aggregated job board data
  const [externalGigs, setExternalGigs] = useState([
    { id: "ext-1", title: "Creative TikTok Video Editor", platform: "Upwork", client: "Aura Gaming Ltd", budget: "$1,200", term: "Fixed", type: "Full Retainer", applied: false },
    { id: "ext-2", title: "SaaS Workflow Explainer Specialist", platform: "LinkedIn Jobs", client: "Slack Technologies", budget: "$3,500/mo", term: "Monthly Contract", type: "Part-time UGC", applied: false },
    { id: "ext-3", title: "Luminous Skincare Unboxing Series", platform: "Contra", client: "L'Oreal Middle East", budget: "$1,800", term: "Commission-Free Escrow", type: "UGC Shorts Bundle", applied: false }
  ]);

  // Contract builder
  const [contractBrand, setContractBrand] = useState("Nike Sports Middle East");
  const [contractSignerName, setContractSignerName] = useState("");
  const [contractSignatureStyle, setContractSignatureStyle] = useState("cursive");
  const [contractSigned, setContractSigned] = useState(false);

  // Affiliate code tracker simulator
  const [affiliateCode, setAffiliateCode] = useState("CRYOVA_DEAL");
  const [affClicks, setAffClicks] = useState(140);
  const [affSales, setAffSales] = useState(12);
  const [affCommission, setAffCommission] = useState(360);

  const mockOpportunities = [
    { id: "nike", brand: "Nike Sports Middle East", title: "Air Max Pegasus Launch Reel", budget: "$1,850", deadline: "2026-08-10", category: "Campaign", type: "Video Delivery" },
    { id: "sephora", brand: "Sephora UAE & Egypt", title: "Luminous Skin Oil Beauty Routine", budget: "$1,200", deadline: "2026-08-14", category: "Campaign", type: "TikTok Series" },
    { id: "logitech", brand: "Logitech G", title: "Mechanical Keyboard ASMR Unboxing", budget: "$3,200", deadline: "2026-08-20", category: "UGC Work", type: "ASMR Short" },
    { id: "nordvpn", brand: "NordVPN", title: "Affiliate Ambassador Codes", budget: "30% Commission", deadline: "2026-12-31", category: "Affiliate", type: "Custom Links" },
    { id: "dubai_fest", brand: "Dubai Creators Festival", title: "VIP Meetup Invitation", budget: "Paid Expenses", deadline: "2026-09-01", category: "Event", type: "Attendance" }
  ];

  const handleGenerateCustomPitch = () => {
    if (!selectedCampaignForPitch) {
      toast.error("Please select a brand campaign from the Marketplace list first!");
      return;
    }
    const pitch = `Hey ${selectedCampaignForPitch.brand} team! 🚀\n\nI just saw your Pegasus launch briefs and immediately drew up a visual mockup. As a Level ${level} CRYOVA Creator with a verified 98.7 trust score, I specialize in crafting high-intensity ASMR loops.\n\nMy proposed deliverable includes: 1 dynamic hook video, edited using professional dual-mic setups, and formatted directly for Gen-Z reach.\n\nProposed Rate: $${customPitchRate} USD. Let's make art that converts!`;
    setGeneratedPitchDeck(pitch);
    addXpPoints(30);
    toast.success("AI brand pitch formulated!");
  };

  const handleSignContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractSignerName) {
      toast.error("Please type your legal signature name.");
      return;
    }
    setContractSigned(true);
    addXpPoints(100);
    toast.success("✍️ UGC Contract legally signed & locked in Escrow (CRYOVA Shield Active)!");
  };

  const simulateAffiliateAction = () => {
    const clicksAdded = Math.floor(Math.random() * 20) + 5;
    const salesAdded = Math.random() > 0.4 ? 1 : 0;
    setAffClicks((c) => c + clicksAdded);
    if (salesAdded) {
      setAffSales((s) => s + 1);
      setAffCommission((com) => com + 30);
      toast.success("💸 Simulated Sale Registered! +$30 Commission");
      addXpPoints(40);
    } else {
      toast.info(`Simulated +${clicksAdded} Clicks!`);
      addXpPoints(10);
    }
  };

  // 5. CREATOR CONNECT STATES (Swipe Matcher & Message Clubs)
  const [selectedConnectTab, setSelectedConnectTab] = useState<"swipe" | "clubs" | "voice" | "meetups">("swipe");
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [matchNotification, setMatchNotification] = useState<any>(null);

  const mockConnectCreators = [
    { name: "Sienna Rivers", niche: "Lifestyle & Beauty Vlog", location: "Cairo, Egypt", avatar: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&q=80", bio: "Photographer looking for styling collaborations! Let's shoot editorial TikToks." },
    { name: "Omar Farooq", niche: "Tech ASMR & Edits", location: "Dubai, UAE", avatar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80", bio: "Sound designer specializing in ambient synthesizer layers. Let's make music backing tracks!" },
    { name: "Jasmine Hegazi", niche: "Fashion Styling & Reels", location: "Riyadh, KSA", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80", bio: "Videographer with a Blackmagic 6K camera. Let's collab on high-end UGC video Ads!" }
  ];

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      const match = mockConnectCreators[swipeIndex];
      setMatchNotification(match);
      addXpPoints(50);
      toast.success(`💘 It's a CRYOVA Connect Match with ${match.name}!`, { duration: 4000 });
    }
    setSwipeIndex((prev) => (prev + 1) % mockConnectCreators.length);
  };

  const [clubMessages, setClubMessages] = useState<any[]>([
    { id: 1, sender: "Youssef", text: "Egypt content creators: Any studios near New Cairo with ASMR condenser mics?", time: "2m ago" },
    { id: 2, sender: "Salma", text: "Nike just accepted my contract signature! CRYOVA Shield escrow has locked the funds. Super secure.", time: "10m ago" },
    { id: 3, sender: "Layla", text: "TikTok's algorithm is favoring 9:16 loop visual clips today. Keep hook ratio high guys!", time: "24m ago" }
  ]);
  const [newClubMsg, setNewClubMsg] = useState("");
  const handleSendClubMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubMsg) return;
    setClubMessages((prev) => [...prev, { id: Date.now(), sender: "You", text: newClubMsg, time: "Just now" }]);
    setNewClubMsg("");
    addXpPoints(15);
  };

  // Voice Rooms
  const [micActive, setMicActive] = useState(false);
  const voiceParticipants = [
    { name: "You", speaking: micActive, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&q=80" },
    { name: "Sienna", speaking: true, avatar: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=60&q=80" },
    { name: "Omar", speaking: false, avatar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&q=80" }
  ];

  // Local meetups
  const [rsvpEvents, setRsvpEvents] = useState<number[]>([]);
  const localEvents = [
    { id: 1, title: "CRYOVA Summer Meetup - Cairo", date: "July 28, 2026", location: "District 5 Hub", attendees: 42, host: "CRYOVA Team" },
    { id: 2, title: "UGC Gear and Microphone Setup Lab", date: "August 2, 2026", location: "Creative Studio Riyadh", attendees: 28, host: "Jasmine Hegazi" }
  ];

  // 6. ACADEMY STATES (Courses & Quizzes)
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [masteredCourses, setMasteredCourses] = useState<number[]>([]);

  const courses = [
    {
      id: 1,
      title: "Vertical Hook Mastery (ASMR & Reels)",
      lessons: 4,
      desc: "Learn to script high-retention 1.5-second hooks that stop the scroll.",
      content: "The Golden Rule of Creator Hooks: Never start by introducing yourself. Start mid-action or mid-statement. For example, instead of 'Hi my name is Sienna and today I unbox...', say '❌ Stop buying generic makeup brushes...' and tap the brush on the microphone. This stimulates immediate visual curiosity and keeps watch time over 80%.",
      quizQuestion: "Which is the highest-retention strategy for video hooks?",
      quizOptions: [
        { key: "A", text: "A 5-second animated logo of your personal creator name" },
        { key: "B", text: "Starting mid-action with a high-contrast sound or curiosity statement" },
        { key: "C", text: "Politely asking viewers to subscribe before explaining the product" }
      ],
      correctKey: "B"
    },
    {
      id: 2,
      title: "Escrow, Invoicing, and Contracts 101",
      lessons: 3,
      desc: "Navigate brand campaigns safely using legal tools like CRYOVA Shield.",
      content: "UGC Creators often suffer from delayed brand payouts. Always write a delivery clause defining specific review turnaround (e.g. 72 hours max) and secure the agreed project fee in Escrow BEFORE starting video drafts. With escrow locked, the funds are automatically released upon delivery, guarding against ghosting.",
      quizQuestion: "What is the primary purpose of locking campaign fees in Escrow?",
      quizOptions: [
        { key: "A", text: "To pay taxes directly to government entities" },
        { key: "B", text: "To guarantee funds are secured and paid immediately upon deliverable approvals" },
        { key: "C", text: "To purchase secondary social media advertising" }
      ],
      correctKey: "B"
    }
  ];

  const handleQuizSubmit = () => {
    if (!quizAnswer) return;
    setQuizSubmitted(true);
    if (quizAnswer === selectedCourse.correctKey) {
      setMasteredCourses((prev) => [...prev, selectedCourse.id]);
      addXpPoints(120);
      toast.success("🎓 EXCELLENT! Lesson mastered! +120 XP Added.");
    } else {
      toast.error("Incorrect answer. Re-read the masterclass content and try again!");
    }
  };

  // 7. MORE OS ADD-ONS STATES (Milestones & Q&A)
  const [selectedAddonTab, setSelectedAddonTab] = useState<"rewards" | "qna" | "soundtrack" | "brand" | "aura" | "mcp">("rewards");
  const [boughtItems, setBoughtItems] = useState<string[]>([]);
  const rewardShopItems = [
    { id: "skin_neon", name: "Cyber Neon Media Kit Style", cost: 300, desc: "A vibrant retro layout for your public profile" },
    { id: "pitch_kit", name: "Premium SaaS Pitch Script Kit", cost: 150, desc: "A collection of 10 high-converting cold email outlines" },
    { id: "verified_badge", name: "Platinum Verified Profile Badge", cost: 600, desc: "Unlock verified tick display icon on your card" }
  ];

  // Aura Intelligence States
  const [auraQuery, setAuraQuery] = useState("Nike Sports");
  const [isAuraLoading, setIsAuraLoading] = useState(false);
  const [auraData, setAuraData] = useState<any>({
    companyName: "Nike Sports Middle East",
    employeeCount: "42,000+",
    averageSalaryUGC: "$4,500/mo",
    marketDemand: "92% (High demand for athletic ASMR soundscapes)",
    verifiedEscrowHistory: "100% Secure (14 contracts cleared)",
    riskRating: "Low (A+ credit history)",
    benchmarkingSalaryRange: {
      min: 1500,
      median: 4500,
      max: 9500
    },
    skillAvailability: [
      { name: "Raw footage rights", value: "Rare (Requested on 84% of briefs)" },
      { name: "3-day turnaround", value: "Standard (Available on 42% of creators)" },
      { name: "High conversion hook writing", value: "Premium (Adds 25% to overall budget)" }
    ]
  });

  // MCP States
  const [mcpRequestType, setMcpRequestType] = useState<"list_tools" | "read_resource" | "call_tool">("list_tools");
  const [mcpConsoleLogs, setMcpConsoleLogs] = useState<string[]>([
    "MCP Client initiated standard handshake...",
    "Handshake complete. Protocol Version: 2024-11-05 standard standard",
    "Ready to route incoming AI client queries."
  ]);
  const [mcpActiveToolOutput, setMcpActiveToolOutput] = useState<string>("{\n  \"tools\": [\n    {\n      \"name\": \"get_creator_services\",\n      \"description\": \"Retrieve active standardized Contra-style pricing packages from profile\",\n      \"inputSchema\": {\n        \"type\": \"object\",\n        \"properties\": {}\n      }\n    }\n  ]\n}");

  // Fever States
  const [feverTab, setFeverTab] = useState<"explore" | "partner">("explore");
  const [feverSelectedEvent, setFeverSelectedEvent] = useState<number | null>(null);
  const [feverPartnerStats, setFeverPartnerStats] = useState({
    ticketsSold: 1482,
    conversionRate: 18.4,
    revenue: 66690,
    checkInRate: 94
  });

  const [qaInbox, setQaInbox] = useState([
    { id: 1, sender: "Anonymous Brand Manager", question: "Do you offer full raw UGC footages and raw clip ownership with your Standard Package?", answer: "", date: "3h ago" },
    { id: 2, sender: "Fan_Tok99", question: "How long did it take you to hit 10k reach? What microphone do you recommend starting with?", answer: "I suggest starting with a simple lavalier mic! Hit 10k in about 3 months by posting consistently.", date: "1d ago" }
  ]);
  const [qaAnswerText, setQaAnswerText] = useState("");
  const [answeringQaId, setAnsweringQaId] = useState<number | null>(null);

  const handleAnswerQa = (id: number) => {
    if (!qaAnswerText) return;
    setQaInbox((prev) => prev.map((item) => item.id === id ? { ...item, answer: qaAnswerText } : item));
    setQaAnswerText("");
    setAnsweringQaId(null);
    addXpPoints(40);
    toast.success("Question answered successfully and posted to public Profile Q&A board!");
  };

  const handleBuyReward = (item: any) => {
    if (xp < item.cost) {
      toast.error("Insufficient XP points! Complete more quests or master academy quizzes.");
      return;
    }
    setXp((prev) => prev - item.cost);
    setBoughtItems((prev) => [...prev, item.id]);
    toast.success(`Successfully redeemed ${item.name}! Check your settings/profile.`);
  };

  // Aura Intelligence Due-Diligence search simulation
  const handleAuraSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auraQuery) return;
    setIsAuraLoading(true);
    
    setTimeout(() => {
      const queryLower = auraQuery.toLowerCase();
      let mockResult = {
        companyName: auraQuery,
        employeeCount: "2,500 - 10,000 (Mid-to-Large Scale)",
        averageSalaryUGC: "$2,800/mo",
        marketDemand: "78% (Healthy demand for creative workflow demos)",
        verifiedEscrowHistory: "95% Secure (8 contracts cleared)",
        riskRating: "Low (Solid corporate record)",
        benchmarkingSalaryRange: { min: 1200, median: 3200, max: 7000 },
        skillAvailability: [
          { name: "SaaS Workflow explanations", value: "High (Available on 68% of creators)" },
          { name: "ASMR/Tactile unboxings", value: "Medium (Requested on 24% of contracts)" },
          { name: "Exclusive ownership buyout", value: "Premium (Premium fee requested in 90% of cases)" }
        ]
      };

      if (queryLower.includes("nike")) {
        mockResult = {
          companyName: "Nike Sports Middle East",
          employeeCount: "42,000+",
          averageSalaryUGC: "$4,500/mo",
          marketDemand: "92% (High demand for athletic ASMR soundscapes)",
          verifiedEscrowHistory: "100% Secure (14 contracts cleared)",
          riskRating: "Low (A+ credit history)",
          benchmarkingSalaryRange: { min: 1500, median: 4500, max: 9500 },
          skillAvailability: [
            { name: "Raw footage rights", value: "Rare (Requested on 84% of briefs)" },
            { name: "3-day turnaround", value: "Standard (Available on 42% of creators)" },
            { name: "High conversion hook writing", value: "Premium (Adds 25% to overall budget)" }
          ]
        };
      } else if (queryLower.includes("sephora")) {
        mockResult = {
          companyName: "Sephora UAE & Middle East",
          employeeCount: "18,500+",
          averageSalaryUGC: "$3,800/mo",
          marketDemand: "88% (Intense beauty tutorial & skincare loop interest)",
          verifiedEscrowHistory: "100% Secure (22 contracts cleared)",
          riskRating: "Low (Excellent partner rating)",
          benchmarkingSalaryRange: { min: 1000, median: 3800, max: 8000 },
          skillAvailability: [
            { name: "Authentic skincare demos", value: "Common (Offered by 72% of creators)" },
            { name: "Ultra-macro skincare loops", value: "Rare (Increases retention rates by 34%)" },
            { name: "Raw audio voiceover clips", value: "Standard (Required on all active campaigns)" }
          ]
        };
      } else if (queryLower.includes("slack") || queryLower.includes("software")) {
        mockResult = {
          companyName: "Slack Technologies Inc.",
          employeeCount: "5,000+",
          averageSalaryUGC: "$5,500/mo",
          marketDemand: "95% (High demand for SaaS screencasts and onboarding demos)",
          verifiedEscrowHistory: "100% Secure (9 contracts cleared)",
          riskRating: "Negligible (AAA rated tier)",
          benchmarkingSalaryRange: { min: 2500, median: 5500, max: 12000 },
          skillAvailability: [
            { name: "Professional voiceover narration", value: "Required (Available on 45% of matches)" },
            { name: "Interactive step click-throughs", value: "Preferred (Adds 18% CTR conversion)" },
            { name: "Product screen raw edits", value: "Rare (Demanded on 92% of corporate contracts)" }
          ]
        };
      } else if (queryLower.includes("l'oreal") || queryLower.includes("loreal") || queryLower.includes("beauty")) {
        mockResult = {
          companyName: "L'Oreal Middle East Division",
          employeeCount: "86,000+",
          averageSalaryUGC: "$4,200/mo",
          marketDemand: "85% (Consistent hair routine and aesthetic tutorials)",
          verifiedEscrowHistory: "100% Secure (31 contracts cleared)",
          riskRating: "Low (Corporate standard escrow)",
          benchmarkingSalaryRange: { min: 1200, median: 4200, max: 9000 },
          skillAvailability: [
            { name: "Professional close-up styling", value: "Standard (Supplied on 80% of matches)" },
            { name: "Custom color-graded reels", value: "Premium (Increases cost by 15%)" },
            { name: "Audio-first unboxing clicks", value: "Rare (Requested on 32% of briefs)" }
          ]
        };
      }

      setAuraData(mockResult);
      setIsAuraLoading(false);
      addXpPoints(20);
      toast.success(`Aura intelligence compiled workforce & due-diligence data for ${mockResult.companyName}!`);
    }, 1200);
  };

  // MCP handshake/request trigger simulation
  const handleRunMcpRequest = (type: "list_tools" | "read_resource" | "call_tool") => {
    setMcpRequestType(type);
    const timestamp = new Date().toLocaleTimeString();
    
    let outputs = "";
    let logs: string[] = [];

    if (type === "list_tools") {
      logs = [
        `[${timestamp}] Incoming Client request: "mcp/tools/list"`,
        `[${timestamp}] Validating client capabilities & API token...`,
        `[${timestamp}] Route matched: tools listing`,
        `[${timestamp}] Exposing 1 secure creator endpoint: get_creator_services`
      ];
      outputs = JSON.stringify({
        tools: [
          {
            name: "get_creator_services",
            description: "Retrieve active standardized Contra-style pricing packages from profile",
            inputSchema: {
              type: "object",
              properties: {}
            }
          }
        ]
      }, null, 2);
    } else if (type === "read_resource") {
      logs = [
        `[${timestamp}] Incoming Client request: "mcp/resources/read"`,
        `[${timestamp}] Parameters: uri="cryova://profile/portfolio"`,
        `[${timestamp}] Fetching secure portfolio artifacts...`,
        `[${timestamp}] Database match confirmed: 3 active clips loaded`,
        `[${timestamp}] Output serialized cleanly`
      ];
      outputs = JSON.stringify({
        contents: [
          {
            uri: "cryova://profile/portfolio",
            mimeType: "application/json",
            text: "{\n  \"creatorName\": \"Aura Freelancer\",\n  \"recentDeliveries\": [\n    { \"brand\": \"Nike\", \"cloutRate\": 98 },\n    { \"brand\": \"Sephora\", \"cloutRate\": 94 }\n  ]\n}"
          }
        ]
      }, null, 2);
    } else if (type === "call_tool") {
      logs = [
        `[${timestamp}] Incoming Client request: "mcp/tools/call"`,
        `[${timestamp}] Parameters: name="get_creator_services", arguments={}`,
        `[${timestamp}] Executing tool handler server-side...`,
        `[${timestamp}] Fetching state: contraServices list`,
        `[${timestamp}] Matching successful. Found 3 active services.`,
        `[${timestamp}] Formatting response envelope...`
      ];
      outputs = JSON.stringify({
        result: {
          success: true,
          activeServices: [
            { id: 1, title: "Standard UGC Hook Reel", price: 450, delivery: "5 days" },
            { id: 2, title: "Premium ASMR Unboxing Pack", price: 850, delivery: "7 days" },
            { id: 3, title: "SaaS Walkthrough Demo", price: 1200, delivery: "10 days" }
          ],
          feeBypass: "100% Zero Commission Escrow Enabled"
        }
      }, null, 2);
    }

    setMcpConsoleLogs(prev => [...logs, ...prev].slice(0, 10));
    setMcpActiveToolOutput(outputs);
    addXpPoints(15);
    toast.success(`MCP query executed: "${type}" successfully responded!`);
  };

  // Soundtrack Picker
  const [activeSoundtrack, setActiveSoundtrack] = useState("Off");
  const soundtracks = ["Off", "Lo-Fi Focus", "Cyber Wave", "Ambient Espresso"];

  // Brand Desk Campaign Submitter
  const [brandCampTitle, setBrandCampTitle] = useState("");
  const [brandCampBudget, setBrandCampBudget] = useState("");
  const [brandCampDesc, setBrandCampDesc] = useState("");

  const handleBrandSubmitCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandCampTitle || !brandCampBudget) {
      toast.error("Please fill in the title and campaign budget.");
      return;
    }
    try {
      await addDoc(collection(db, "campaigns"), {
        title: brandCampTitle,
        budget: `$${brandCampBudget}`,
        description: brandCampDesc || "Elite UGC Creator wanted for highly visual social media deliverables.",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: Date.now(),
        brandId: userData?.email || "verified_brand"
      });
      setBrandCampTitle("");
      setBrandCampBudget("");
      setBrandCampDesc("");
      toast.success("Campaign published successfully to the Marketplace!");
      
      // Reload recommended campaigns
      const campaignsQuery = query(collection(db, "campaigns"), orderBy("createdAt", "desc"), limit(5));
      const campaignsSnap = await getDocs(campaignsQuery);
      setCampaigns(campaignsSnap.docs.map(doc => ({ id: doc.id, type: 'campaign', ...doc.data() })) as any);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "campaigns");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const campaignsQuery = query(collection(db, "campaigns"), orderBy("createdAt", "desc"), limit(5));
        const campaignsSnap = await getDocs(campaignsQuery);
        const campaignsData = campaignsSnap.docs.map(doc => ({ id: doc.id, type: 'campaign', ...doc.data() }));
        setCampaigns(campaignsData as any);
      } catch (error) {
        console.warn("Could not fetch campaigns from Firestore:", error);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 relative pb-20">
      
      {/* Animated Level-Up Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <div className="bg-white rounded-3xl p-8 max-w-sm text-center border-4 border-[#BEF264] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-lime-500" />
              <Sparkles className="w-16 h-16 text-[#A855F7] mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-black italic font-serif text-[#141414] mb-2">LEVEL UP!</h2>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">You reached Level {level}!</p>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">New Perks Unlocked</span>
                <p className="text-xs text-gray-600 font-bold">● Premium Custom AI Hook Generator</p>
                <p className="text-xs text-gray-600 font-bold mt-1">● 1.5x Multiplier for Brand Matches</p>
              </div>
              <button 
                onClick={() => setShowLevelUp(false)}
                className="w-full py-3 bg-[#BEF264] hover:bg-[#a6e03f] text-[#141414] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
              >
                Let's Grind 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Summary Panel with dynamic local time and timezone info */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black tracking-tight text-[#141414]">Creator OS Dashboard</h1>
            <span className="px-2 py-0.5 bg-[#BEF264] text-black text-[8px] font-black uppercase tracking-widest rounded-md border border-[#a6e03f]">
              V1.4 Stable
            </span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">
            Welcome back, {userData?.name || "Premium Creator"} ● UAE, SA & Egypt Network Zone
          </p>
        </div>

        {/* Dashboard Quick Action Controls */}
        <div className="flex items-center gap-3">
          {activeSoundtrack !== "Off" && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-150 rounded-xl px-3 py-1.5 text-purple-700">
              <Music className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-widest">{activeSoundtrack} Playing</span>
            </div>
          )}
          <button 
            onClick={handleCheckIn}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xs flex items-center gap-1.5 cursor-pointer",
              hasCheckedIn 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110"
            )}
          >
            <Flame className={cn("w-4 h-4", !hasCheckedIn && "animate-pulse")} />
            {hasCheckedIn ? "Checked-In" : "Daily Check-In +50 XP"}
          </button>
        </div>
      </header>

      {/* Main Tab bar Controller */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 scrollbar-none bg-white p-1.5 rounded-2xl border border-gray-150 shadow-xs">
        {[
          { id: "overview", label: "Overview Hub", icon: Layers },
          { id: "ai_lab", label: "AI Writing Lab", icon: Sparkles },
          { id: "workflows", label: "Workflows & Quests", icon: Calendar },
          { id: "gigs", label: "Find Gigs", icon: Briefcase },
          { id: "connect", label: "Connect & Match", icon: Users },
          { id: "academy", label: "Academy Portal", icon: BookOpen },
          { id: "addons", label: "OS Add-ons", icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
                activeTab === tab.id 
                  ? "bg-[#141414] text-white font-black" 
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUBPAGE CONTENTS CONTAINER */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW HUB */}
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Feature 1: Level XP Tracker Card */}
                <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">XP Progress</span>
                      <h4 className="text-lg font-black text-[#141414] mt-0.5">Level {level} Elite</h4>
                    </div>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500" style={{ width: `${(xp / (level * 300)) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>{xp} XP</span>
                    <span>{level * 300} XP Needed</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-4 leading-relaxed font-semibold">Earn more XP by shooting briefs and mastering lessons to unlock custom profile assets.</p>
                </div>

                {/* Feature 2: Flame Daily Streak Engine */}
                <div className="bg-[#141414] text-white p-6 rounded-3xl border border-gray-800 shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#BEF264]">Streak Loop</span>
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-serif italic font-black text-[#BEF264]">{streak}</span>
                      <span className="text-xs font-bold text-gray-300">Days Active</span>
                    </div>
                    <div className="flex gap-1.5 mt-4">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <span 
                          key={day} 
                          className={cn(
                            "w-2.5 h-2.5 rounded-sm transition-all",
                            day <= streak ? "bg-orange-500 scale-110" : "bg-zinc-800"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-4 font-semibold">Daily check-in multipliers raise your brand match visibility by 2.5x.</p>
                </div>

                {/* Feature 3: CRYOVA Brand Health & Trust Score */}
                <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm col-span-1 md:col-span-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" /> Professional Trust & Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 border border-gray-150 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">98.7%</div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Response Rate</span>
                        <span className="text-xs font-black text-[#141414]">Under 1 hour</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-150 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">100%</div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">On-Time Delivery</span>
                        <span className="text-xs font-black text-[#141414]">0 delayed jobs</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-purple-50/50 border border-purple-100 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black text-purple-700 uppercase block">Profile Verification status</span>
                      <span className="text-xs font-semibold text-gray-600">Apply for VIP badge at level 5.</span>
                    </div>
                    <span className="px-2.5 py-1 bg-[#A855F7] text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Apply Now</span>
                  </div>
                </div>
              </div>

              {/* Main Feed/Opp row preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left: Recommended Jobs List */}
                <div className="md:col-span-2 space-y-4 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#A855F7]" /> High-Match Gigs
                    </h3>
                    <button onClick={() => setActiveTab("gigs")} className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black">View Job Board &rarr;</button>
                  </div>
                  
                  {loadingCampaigns ? (
                    <div className="p-8 text-center text-gray-400">Syncing database campaigns...</div>
                  ) : campaigns.length === 0 ? (
                    <div className="space-y-3">
                      {mockOpportunities.slice(0, 3).map((gig) => (
                        <div key={gig.id} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex justify-between items-center hover:border-purple-500 transition-all cursor-pointer">
                          <div>
                            <span className="text-[8px] font-black text-purple-700 uppercase tracking-wider block">{gig.category}</span>
                            <h5 className="font-bold text-sm text-[#141414] mt-0.5">{gig.title}</h5>
                            <span className="text-[10px] text-gray-400 font-semibold">{gig.brand} ● {gig.type}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-[#141414] block">{gig.budget}</span>
                            <span className="text-[9px] font-bold text-emerald-600">Match 98%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {campaigns.map((c) => (
                        <div key={c.id} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex justify-between items-center hover:border-purple-500 transition-all cursor-pointer">
                          <div>
                            <span className="text-[8px] font-black text-purple-700 uppercase tracking-wider block">CAMPAIGN</span>
                            <h5 className="font-bold text-sm text-[#141414] mt-0.5">{c.title}</h5>
                            <span className="text-[10px] text-gray-400 font-semibold">{c.brandId?.slice(0,10)} ● UGC Reel</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-[#141414] block">{c.budget}</span>
                            <span className="text-[9px] font-bold text-emerald-600">Live</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Creator Activity Stream */}
                <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Platform Activity Feed
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {[
                      { msg: "Youssef locked $1,800 in Escrow with Logitech", time: "3m ago", type: "Shield" },
                      { msg: "Sienna Rivers updated her UGC makeup portfolio", time: "12m ago", type: "Portfolio" },
                      { msg: "Sephora UAE posted 3 new beauty routine briefs", time: "34m ago", type: "Campaign" }
                    ].map((act, i) => (
                      <div key={i} className="text-xs p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                        <p className="font-bold text-[#141414] leading-snug">{act.msg}</p>
                        <span className="text-[9px] text-gray-400 font-bold block mt-1">{act.time} ● {act.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: AI WRITING LAB */}
          {activeTab === "ai_lab" && (
            <motion.div 
              key="ai_lab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Feature 4: AI Script / Pitch Generator */}
                <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#A855F7] animate-spin" />
                    <div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-[#141414]">AI Content Script Architect</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Generate complete hooking scripts for target verticals</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Select Niche Vertical</label>
                      <select 
                        value={aiCategory} 
                        onChange={(e) => setAiCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A855F7] font-semibold"
                      >
                        <option value="ASMR">ASMR & Audio-first Unboxing</option>
                        <option value="SaaS">B2B SaaS / App Tutorials</option>
                        <option value="Fashion">Fashion & Transition Lookbooks</option>
                        <option value="Lifestyle">Morning Routine Vlogs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Deliverable Type</label>
                      <span className="w-full inline-block px-3 py-2 bg-gray-100 rounded-xl text-xs font-black text-gray-500 text-center uppercase tracking-wider border border-gray-200">
                        TikTok / Reel 9:16 Format
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Script Concept or Core Product Details</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. Unboxing a sleek aluminum mechanical keyboard with heavy macro lens shots and silent finger tapping sounds..."
                      value={aiConcept}
                      onChange={(e) => setAiConcept(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A855F7] font-medium"
                    />
                  </div>

                  <button 
                    onClick={handleGenerateScript}
                    disabled={isAiGenerating}
                    className="w-full py-3 bg-[#BEF264] hover:bg-[#a6e03f] text-[#141414] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Compose AI Deliverable Script
                  </button>

                  {/* AI Generated script rendering */}
                  {aiScriptResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-purple-50/50 border border-purple-150 rounded-2xl space-y-3 text-xs"
                    >
                      <div>
                        <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-[8px] font-black uppercase tracking-wider rounded">The Hook (0 - 3s)</span>
                        <p className="font-bold text-purple-900 mt-1">{aiScriptResult.hook}</p>
                      </div>
                      <div className="border-t border-purple-100 pt-3">
                        <span className="px-2 py-0.5 bg-[#BEF264] text-black text-[8px] font-black uppercase tracking-wider rounded">Visual Body Outline</span>
                        <p className="font-medium text-gray-700 mt-1 leading-relaxed">{aiScriptResult.body}</p>
                      </div>
                      <div className="border-t border-purple-100 pt-3">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-[8px] font-black uppercase tracking-wider rounded">CTA Conversion Outro</span>
                        <p className="font-bold text-gray-600 mt-1">{aiScriptResult.cta}</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right: Quick Hooks generator & Trending metrics */}
                <div className="space-y-6">
                  
                  {/* Feature 5: Viral Hook & Caption Crafter */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-500" /> Hook Topic Generator
                    </h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. Skin Oil, Tech desk" 
                        value={hookTopic} 
                        onChange={(e) => setHookTopic(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#A855F7] font-semibold"
                      />
                      <button 
                        onClick={handleGenerateHooks}
                        disabled={isGeneratingHooks}
                        className="px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"
                      >
                        Generate
                      </button>
                    </div>

                    <div className="space-y-2">
                      {aiHooks.map((h, i) => (
                        <div key={i} className="p-2.5 bg-purple-50/50 border border-purple-100 rounded-xl text-xs text-purple-900 font-semibold flex items-center justify-between">
                          <span className="line-clamp-2">{h}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(h);
                              toast.success("Hook copied to clipboard!");
                            }}
                            className="text-purple-700 hover:text-black shrink-0 ml-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature 6: Trending Sounds & Hashtags list */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" /> Viral Audio Insights
                    </h3>
                    <div className="space-y-3">
                      {trendingSounds.map((s, i) => (
                        <div key={i} className="p-3 bg-gray-50 border border-gray-150 rounded-xl text-xs space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#141414]">{s.title}</span>
                            <span className="text-[8px] font-black uppercase text-purple-700 bg-purple-100 px-1.5 rounded">{s.vibe}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>{s.usage}</span>
                            <span className="text-[#BEF264] font-bold">{s.energy}% engagement index</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${s.energy}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: WORKFLOWS & QUESTS */}
          {activeTab === "workflows" && (
            <motion.div 
              key="workflows"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Feature 7: Calendar content scheduler */}
                <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-500" /> Deliverables Calendar Planner
                    </h3>
                    <span className="text-[9px] font-bold text-gray-400">Total Scheduled: {calendarEvents.length}</span>
                  </div>

                  <form onSubmit={handleAddEvent} className="p-3 bg-gray-50 border border-gray-150 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Deliverable Video Title</label>
                      <input 
                        type="text" 
                        placeholder="Nike Unboxing, Makeup tutorial..."
                        required
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Platform Type</label>
                      <select 
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none font-semibold"
                      >
                        <option value="TikTok">TikTok Reel</option>
                        <option value="YouTube">YT Short</option>
                        <option value="Instagram">Insta Story</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full py-1.5 bg-black text-white hover:bg-gray-800 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        Schedule
                      </button>
                    </div>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {["2026-07-21", "2026-07-22", "2026-07-23"].map((date) => {
                      const dayEvents = calendarEvents.filter(e => e.date === date);
                      return (
                        <div key={date} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl min-h-[140px] flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-black uppercase text-[#A855F7]">
                              {new Date(date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <div className="space-y-1.5 mt-2">
                              {dayEvents.map(e => (
                                <div key={e.id} className="p-2 bg-white rounded-xl border border-gray-100 text-[10px] shadow-2xs font-semibold">
                                  <span className="px-1 py-0.5 bg-emerald-100 text-emerald-800 text-[7px] font-black uppercase tracking-wide rounded block w-fit mb-1">{e.type}</span>
                                  {e.title}
                                </div>
                              ))}
                              {dayEvents.length === 0 && (
                                <p className="text-[10px] text-gray-400 italic mt-4">Free day. No posts scheduled.</p>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setNewEventDate(date);
                              toast.info(`Enter details above to schedule on ${date}`);
                            }}
                            className="text-[9px] font-bold text-gray-400 hover:text-black flex items-center gap-0.5 mt-2 self-start"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Idea
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feature 8: Quest Board / Kanban Checklist */}
                <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#A855F7] animate-pulse" /> Daily Quests & Milestones
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2 font-semibold">Complete items on your checklist to log direct XP and advance level rewards.</p>

                  <div className="space-y-2.5">
                    {quests.map((q) => (
                      <div 
                        key={q.id} 
                        onClick={() => handleToggleQuest(q.id)}
                        className={cn(
                          "p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3",
                          q.completed 
                            ? "bg-emerald-50/50 border-emerald-100 opacity-60" 
                            : "bg-gray-50 border-gray-150 hover:border-[#A855F7]"
                        )}
                      >
                        <input 
                          type="checkbox" 
                          checked={q.completed} 
                          onChange={() => {}} // Handled by parent click
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 mr-1.5">
                            {q.tag}
                          </span>
                          <p className={cn("text-xs font-bold text-[#141414] leading-tight mt-1", q.completed && "line-through text-gray-400")}>
                            {q.label}
                          </p>
                        </div>
                        <span className={cn("text-[9px] font-black uppercase shrink-0 px-2 py-0.5 rounded", q.completed ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800")}>
                          +{q.reward} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: FIND GIGS (Marketplace, Escrow, Affiliates) */}
          {activeTab === "gigs" && (
            <motion.div 
              key="gigs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex border-b border-gray-200 gap-4 overflow-x-auto scrollbar-none">
                {[
                  { id: "marketplace", label: "Opportunities Marketplace", icon: Briefcase },
                  { id: "pitch", label: "Direct AI Brand Pitching", icon: Sparkles },
                  { id: "escrow", label: "CRYOVA Shield Contract Escrow", icon: Shield },
                  { id: "affiliate", label: "Affiliate Codes Desk", icon: DollarSign },
                  { id: "sync", label: "LinkedIn & Upwork Sync", icon: Globe }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedGigTab(st.id as any)}
                    className={cn(
                      "px-3 py-2 text-[9px] font-black uppercase tracking-widest border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedGigTab === st.id 
                        ? "border-[#141414] text-[#141414]" 
                        : "border-transparent text-gray-400 hover:text-black"
                    )}
                  >
                    <st.icon className="w-3.5 h-3.5" />
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Sub-tab Rendering */}
              {selectedGigTab === "marketplace" && (
                <div className="space-y-6">
                  {/* Feature 8: Gig Filter desk */}
                  <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs">
                    <div className="flex flex-wrap gap-2">
                      {["all", "Campaign", "UGC Work", "Affiliate", "Event"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setGigFilter(f)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer",
                            gigFilter === f ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-150"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">Showing {mockOpportunities.filter(g => gigFilter === "all" || g.category === gigFilter).length} offers</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mockOpportunities.filter(g => gigFilter === "all" || g.category === gigFilter).map((gig) => (
                      <div key={gig.id} className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between hover:border-[#A855F7] transition-all">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[8px] font-black uppercase tracking-wider rounded">
                              {gig.category}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{gig.type}</span>
                          </div>
                          <h4 className="font-black text-lg text-[#141414] mb-1">{gig.title}</h4>
                          <p className="text-xs font-medium text-gray-500">Provided by {gig.brand}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-3">Deadline: {new Date(gig.deadline).toLocaleDateString()}</p>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center">
                          <div>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Proposed Budget</span>
                            <span className="text-base font-black text-[#141414]">{gig.budget}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedCampaignForPitch(gig);
                              setSelectedGigTab("pitch");
                              toast.info(`Perfect! Pitch deck builder is now loaded with ${gig.brand}.`);
                            }}
                            className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                            Pitch AI Deck
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature 10: Pitch letter Builder */}
              {selectedGigTab === "pitch" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Configure AI Pitch Pitch</h4>
                    
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Select Target Brand Campaign</label>
                      <select
                        value={selectedCampaignForPitch?.id || ""}
                        onChange={(e) => setSelectedCampaignForPitch(mockOpportunities.find(o => o.id === e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-semibold"
                      >
                        <option value="">-- Choose Brand --</option>
                        {mockOpportunities.map(o => (
                          <option key={o.id} value={o.id}>{o.brand} ({o.title})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Your Proposed Deliverable Price ($ USD)</label>
                      <input 
                        type="number" 
                        value={customPitchRate} 
                        onChange={(e) => setCustomPitchRate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-semibold"
                      />
                    </div>

                    <button 
                      onClick={handleGenerateCustomPitch}
                      className="w-full py-3 bg-[#BEF264] hover:bg-[#a6e03f] text-[#141414] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                    >
                      Assemble Pitch Template
                    </button>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded mb-4 inline-block">Copyable Brand Pitch Outline</span>
                      {generatedPitchDeck ? (
                        <textarea 
                          rows={10} 
                          value={generatedPitchDeck} 
                          onChange={(e) => setGeneratedPitchDeck(e.target.value)}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono font-medium outline-none leading-relaxed"
                        />
                      ) : (
                        <p className="text-xs text-gray-400 italic py-12 text-center">Configure parameters on the left and click 'Assemble Pitch' to formulate your custom pitch deck letter.</p>
                      )}
                    </div>
                    {generatedPitchDeck && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedPitchDeck);
                          toast.success("AI Pitch Deck copied! Send it in messages directly.");
                        }}
                        className="w-full py-3 bg-black text-white hover:bg-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Copy to Clipboard
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Feature 11: CRYOVA Shield Escrow Contract Builder */}
              {selectedGigTab === "escrow" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                      <Shield className="w-4 h-4 text-emerald-500" /> contract details
                    </h4>
                    
                    <form onSubmit={handleSignContract} className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Target Client / Brand Party</label>
                        <input 
                          type="text" 
                          value={contractBrand} 
                          onChange={(e) => setContractBrand(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Type Your Legal Name (For Signature)</label>
                        <input 
                          type="text" 
                          placeholder="Your Signature Legal Name"
                          required
                          value={contractSignerName} 
                          onChange={(e) => setContractSignerName(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1.5 border border-gray-150 rounded-xl">
                        {(["cursive", "serif", "monospace"] as const).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setContractSignatureStyle(style)}
                            className={cn(
                              "py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
                              contractSignatureStyle === style ? "bg-black text-white" : "text-gray-400 hover:text-black"
                            )}
                          >
                            {style}
                          </button>
                        ))}
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-3 bg-[#BEF264] hover:bg-[#a6e03f] text-[#141414] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                      >
                        Sign & Secure Escrow Fee
                      </button>
                    </form>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between font-serif relative overflow-hidden">
                    <div className="absolute inset-0 bg-amber-50/5 pointer-events-none" />
                    <div className="space-y-4 text-xs text-gray-700 leading-relaxed max-h-96 overflow-y-auto p-2">
                      <div className="text-center border-b border-gray-200 pb-4">
                        <h3 className="font-bold text-base uppercase tracking-wider text-[#141414]">CRYOVA STANDARD UGC CAMPAIGN AGREEMENT</h3>
                        <span className="text-[10px] font-bold text-gray-400 font-sans block mt-1">LOCKED ESCROW PROTECTED SHIELD CONTRACT</span>
                      </div>
                      <p>This agreement is drafted between <strong>{userData?.name || "The Creator"}</strong> (hereafter "Creator") and <strong>{contractBrand || "The Brand"}</strong> (hereafter "Client").</p>
                      <p><strong>Clause 1. Locked Escrow:</strong> Client agrees to lock the designated budget fee inside the CRYOVA Escrow Vault prior to deliverable drafting. Funds are safely frozen and cannot be pulled back unilaterally.</p>
                      <p><strong>Clause 2. Deliverables & Revision:</strong> Creator agrees to submit 1 edited video (9:16 format) within 14 business days. Client is entitled to exactly 1 iteration request of up to 2 modifications.</p>
                      <p><strong>Clause 3. Automatic Release:</strong> Standard escrow release executes automatically upon document delivery and review approval, or within 72 hours of deliverable upload if no dispute is formally filed.</p>
                      
                      {contractSigned && (
                        <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-6 flex justify-between items-end">
                          <div>
                            <span className="text-[8px] font-sans font-black text-gray-400 uppercase block">Client Escrow Status</span>
                            <span className="text-xs font-sans font-black text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 fill-emerald-600 text-white animate-pulse" /> LOCKED ($1,850 USD)
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-sans font-black text-gray-400 uppercase block">Creator Signature Legalized</span>
                            <span className={cn(
                              "text-xl block text-purple-700 font-serif",
                              contractSignatureStyle === "cursive" && "italic font-black text-2xl tracking-wide",
                              contractSignatureStyle === "serif" && "font-bold",
                              contractSignatureStyle === "monospace" && "font-mono text-sm"
                            )}>
                              {contractSignerName}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Feature 12: Affiliate code tracking simulator */}
              {selectedGigTab === "affiliate" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded block w-fit">Affiliate Setup Desk</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">Generate tracking codes instantly, place links in your social bio and monitor commissions dynamically.</p>
                    
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Custom Affiliate Referral Phrase</label>
                      <input 
                        type="text" 
                        value={affiliateCode} 
                        onChange={(e) => setAffiliateCode(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-semibold uppercase font-mono"
                      />
                    </div>

                    <button 
                      onClick={simulateAffiliateAction}
                      className="w-full py-3 bg-black text-white hover:bg-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      Simulate Link Clicks / Purchases
                    </button>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-[#141414] uppercase">Live Referral Click & Sales Analytics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Total Click Loops</span>
                        <div className="text-2xl font-black text-[#141414] mt-1">{affClicks}</div>
                      </div>
                      <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Orders Placed</span>
                        <div className="text-2xl font-black text-[#141414] mt-1">{affSales}</div>
                      </div>
                      <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Commission Earned</span>
                        <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">${affCommission} USD</div>
                      </div>
                    </div>

                    {/* Chart preview */}
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { week: "Wk 1", commissions: 60 },
                          { week: "Wk 2", commissions: 140 },
                          { week: "Wk 3", commissions: 210 },
                          { week: "Wk 4", commissions: affCommission }
                        ]}>
                          <XAxis dataKey="week" stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="commissions" stroke="#10B981" strokeWidth={3} fill="#E6F4EA" name="Commissions ($)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn & Upwork Cross-Platform Sync Sub-tab */}
              {selectedGigTab === "sync" && (
                <div className="space-y-6">
                  {/* Cross-Platform Credentials Integrator header */}
                  <div className="bg-gradient-to-r from-emerald-950 to-zinc-900 text-white p-6 rounded-3xl border border-emerald-500/20 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#BEF264] text-[#141414] text-[8px] font-black uppercase tracking-widest rounded">LinkedIn + Upwork + Contra</span>
                      <span className="text-xs font-mono text-emerald-400">CRYOVA Cross-Platform Sync Engine</span>
                    </div>
                    <h3 className="text-xl font-serif italic font-bold">Consolidate Your Professional Identity</h3>
                    <p className="text-xs text-zinc-300 mt-1 max-w-xl font-medium">
                      Do not manage multiple profiles. Sync your LinkedIn skills, Upwork job success, and Contra commission-free services into a unified CRYOVA Score to attract high-paying enterprise contracts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Interactive Sync Integrations cards */}
                    <div className="md:col-span-2 space-y-4">
                      {/* LinkedIn Integrator */}
                      <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 font-serif italic font-bold text-xl border border-sky-100 shrink-0">
                            in
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-[#141414] flex items-center gap-1.5">
                              LinkedIn Profile Sync
                              {liSynced ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded-full">Synchronized</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-black uppercase rounded-full">Not Synced</span>
                              )}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">Import skills endorsement counts, verified recommendations, and corporate roles.</p>
                          </div>
                        </div>
                        <button
                          disabled={isSyncingLI}
                          onClick={() => {
                            setIsSyncingLI(true);
                            setTimeout(() => {
                              setIsSyncingLI(false);
                              setLiSynced(true);
                              addXpPoints(100);
                              toast.success("LinkedIn Profile Imported! 42 Endorsements and 3 experiences synchronized with your Hub.", { icon: "💼" });
                            }, 2000);
                          }}
                          className={cn(
                            "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all w-full sm:w-auto text-center cursor-pointer whitespace-nowrap",
                            liSynced ? "bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100" : "bg-black text-white hover:bg-gray-800"
                          )}
                        >
                          {isSyncingLI ? (
                            <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching API...</span>
                          ) : liSynced ? (
                            "Re-sync Profile"
                          ) : (
                            "Connect & Import"
                          )}
                        </button>
                      </div>

                      {/* Upwork Integrator */}
                      <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xl border border-emerald-100 shrink-0">
                            Up
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-[#141414] flex items-center gap-1.5">
                              Upwork Reputation & Ratings
                              {upworkSynced ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded-full">Synchronized</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-black uppercase rounded-full">Not Synced</span>
                              )}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">Import Job Success Score (JSS), 5-star review history, and Top-Rated badge.</p>
                          </div>
                        </div>
                        <button
                          disabled={isSyncingUpwork}
                          onClick={() => {
                            setIsSyncingUpwork(true);
                            setTimeout(() => {
                              setIsSyncingUpwork(false);
                              setUpworkSynced(true);
                              addXpPoints(100);
                              toast.success("Upwork ratings synced! Added 100% Job Success Score and 12 reviews to your score multiplier.", { icon: "📈" });
                            }, 2000);
                          }}
                          className={cn(
                            "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all w-full sm:w-auto text-center cursor-pointer whitespace-nowrap",
                            upworkSynced ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-black text-white hover:bg-gray-800"
                          )}
                        >
                          {isSyncingUpwork ? (
                            <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Authorizing...</span>
                          ) : upworkSynced ? (
                            "Re-sync Ratings"
                          ) : (
                            "Connect & Import"
                          )}
                        </button>
                      </div>

                      {/* Contra Integrator */}
                      <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100 shrink-0">
                            C
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-[#141414] flex items-center gap-1.5">
                              Contra Commission-Free Services
                              {contraSynced ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded-full">Synchronized</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-black uppercase rounded-full">Not Synced</span>
                              )}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">Import standardized packages list directly to enable instant zero-fee checkouts.</p>
                          </div>
                        </div>
                        <button
                          disabled={isSyncingContra}
                          onClick={() => {
                            setIsSyncingContra(true);
                            setTimeout(() => {
                              setIsSyncingContra(false);
                              setContraSynced(true);
                              addXpPoints(100);
                              toast.success("Contra service packages synced successfully!", { icon: "🤝" });
                            }, 2000);
                          }}
                          className={cn(
                            "px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all w-full sm:w-auto text-center cursor-pointer whitespace-nowrap",
                            contraSynced ? "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100" : "bg-black text-white hover:bg-gray-800"
                          )}
                        >
                          {isSyncingContra ? (
                            <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...</span>
                          ) : contraSynced ? (
                            "Re-sync Services"
                          ) : (
                            "Connect & Import"
                          )}
                        </button>
                      </div>

                      {/* Unified Remote Job Aggregator */}
                      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                        <div>
                          <h4 className="font-black text-xs text-[#141414] uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-emerald-500" /> Aggregated Remote Freelance Gigs
                          </h4>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Real-time remote contracts pulled from Upwork, LinkedIn, and Contra</p>
                        </div>

                        <div className="space-y-3">
                          {externalGigs.map((g) => (
                            <div key={g.id} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-purple-300 transition-all">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-xs text-[#141414]">{g.title}</span>
                                  <span className={cn(
                                    "px-2 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider",
                                    g.platform === "Upwork" && "bg-emerald-100 text-emerald-700",
                                    g.platform === "LinkedIn Jobs" && "bg-sky-100 text-sky-700",
                                    g.platform === "Contra" && "bg-indigo-100 text-indigo-700"
                                  )}>
                                    {g.platform}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Client: {g.client} ● Contract: {g.type} ● {g.term}</p>
                              </div>

                              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <span className="font-serif italic font-black text-sm text-[#141414]">{g.budget}</span>
                                <button
                                  disabled={g.applied}
                                  onClick={() => {
                                    setExternalGigs(prev => prev.map(item => item.id === g.id ? { ...item, applied: true } : item));
                                    addXpPoints(40);
                                    toast.success(`AI creator agent formulated and transmitted custom quick-pitch to ${g.client}!`, { icon: "🚀" });
                                  }}
                                  className={cn(
                                    "px-3.5 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                                    g.applied ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" : "bg-black text-white hover:bg-gray-800 cursor-pointer"
                                  )}
                                >
                                  {g.applied ? "Proposal Transmitted" : "One-Click Quick Apply"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Consolidated reputation multipliers */}
                    <div className="space-y-6">
                      <div className="bg-[#141414] text-white p-6 rounded-3xl shadow-sm border border-gray-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-[#BEF264] mb-1">Reputation Engine</h4>
                        <h3 className="text-xl font-serif italic mb-6">Cross-Platform Reputation Status</h3>

                        <div className="space-y-4 text-xs font-bold">
                          <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                            <span className="text-gray-400">Sync Score Multiplier</span>
                            <span className="text-[#BEF264] text-base font-black">
                              {(liSynced ? 1.2 : 1.0) * (upworkSynced ? 1.2 : 1.0) * (contraSynced ? 1.1 : 1.0) === 1 
                                ? "1.0x (Baseline)" 
                                : `${((liSynced ? 1.2 : 1.0) * (upworkSynced ? 1.2 : 1.0) * (contraSynced ? 1.1 : 1.0)).toFixed(2)}x Active`
                              }
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">LinkedIn Connections</span>
                            <span className={liSynced ? "text-white" : "text-gray-600"}>
                              {liSynced ? "500+ Connections Verified" : "Not Synced"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Upwork Badges</span>
                            <span className={upworkSynced ? "text-white" : "text-gray-600"}>
                              {upworkSynced ? "Top Rated Plus (100% JSS)" : "Not Synced"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Contra Escrow Rate</span>
                            <span className={contraSynced ? "text-white" : "text-gray-600"}>
                              {contraSynced ? "0% Fee Active" : "Not Synced"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl mt-6 text-[10px] text-gray-300 leading-relaxed font-semibold">
                          ✨ <strong>Reputation Proofing:</strong> Elevate your reputation by importing external ratings. Verified cross-platform credentials grant higher priority in search queries and automatically bypass standard client vetting processes.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 5: CREATOR CONNECT */}
          {activeTab === "connect" && (
            <motion.div 
              key="connect"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex border-b border-gray-200 gap-4 overflow-x-auto scrollbar-none">
                {[
                  { id: "swipe", label: "Swipe Connector", icon: Users },
                  { id: "clubs", label: "Interest Clubs Forums", icon: MessageSquare },
                  { id: "voice", label: "Audio stage Simulator", icon: Mic },
                  { id: "meetups", label: "RSVP Meetup tickets", icon: Ticket }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedConnectTab(st.id as any)}
                    className={cn(
                      "px-3 py-2 text-[9px] font-black uppercase tracking-widest border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedConnectTab === st.id 
                        ? "border-[#141414] text-[#141414]" 
                        : "border-transparent text-gray-400 hover:text-black"
                    )}
                  >
                    <st.icon className="w-3.5 h-3.5" />
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Sub-tab Connect views */}
              {selectedConnectTab === "swipe" && (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="text-center">
                    <span className="px-2.5 py-0.5 bg-[#BEF264] text-[#141414] text-[8px] font-black uppercase tracking-widest rounded-full">Tinder style swipe matcher</span>
                    <h3 className="text-xl font-serif italic font-black text-[#141414] mt-1">CRYOVA Matchmaker</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Match with editors, photographers or models nearby</p>
                  </div>

                  {/* Feature 13: Tinder style swipe deck */}
                  <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md relative p-6 flex flex-col justify-between min-h-[380px]">
                    <div className="flex gap-4">
                      <img 
                        src={mockConnectCreators[swipeIndex].avatar} 
                        alt={mockConnectCreators[swipeIndex].name} 
                        className="w-24 h-24 rounded-2xl object-cover border border-gray-200" 
                      />
                      <div>
                        <h4 className="font-black text-lg text-[#141414]">{mockConnectCreators[swipeIndex].name}</h4>
                        <span className="px-2 py-0.5 bg-purple-50 text-[#A855F7] text-[8px] font-black uppercase tracking-wider rounded border border-purple-100">{mockConnectCreators[swipeIndex].niche}</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5 flex items-center gap-0.5"><MapPin className="w-3 h-3 text-red-500" /> {mockConnectCreators[swipeIndex].location}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-4 leading-relaxed font-semibold italic">"{mockConnectCreators[swipeIndex].bio}"</p>

                    <div className="flex gap-4 pt-6 border-t border-gray-100 mt-6">
                      <button 
                        onClick={() => handleSwipe("left")}
                        className="flex-1 py-3 bg-gray-50 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                      >
                        Pass
                      </button>
                      <button 
                        onClick={() => handleSwipe("right")}
                        className="flex-1 py-3 bg-[#BEF264] hover:bg-[#a6e03f] text-[#141414] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        Match!
                      </button>
                    </div>
                  </div>

                  {matchNotification && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse animate-bounce" />
                        <span className="font-semibold text-emerald-800">You and <strong>{matchNotification.name}</strong> connected! Start direct chat now.</span>
                      </div>
                      <Link to="/messages" className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Message</Link>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Feature 14: Interest Clubs Forums message boards */}
              {selectedConnectTab === "clubs" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hub Channels</h4>
                    <div className="space-y-1.5 font-bold text-xs">
                      {["Tech & ASMR Creators", "Egypt UGC Hustle Hub", "Fashion Tok Riyadh", "Saudi Arabia Beauty Loop"].map((club, i) => (
                        <div key={i} className={cn("p-2.5 rounded-xl cursor-pointer transition-all flex justify-between items-center", i === 1 ? "bg-black text-white" : "hover:bg-gray-50 text-gray-600")}>
                          <span># {club}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-white font-mono">14 online</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between h-[450px]">
                    <div className="space-y-3.5 overflow-y-auto flex-1 pr-1">
                      {clubMessages.map((m) => (
                        <div key={m.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded">@{m.sender}</span>
                            <span className="text-[9px] text-gray-400 font-semibold">{m.time}</span>
                          </div>
                          <p className="text-gray-700 font-medium leading-relaxed">{m.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendClubMessage} className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                      <input 
                        type="text" 
                        placeholder="Type standard UGC questions to community..." 
                        value={newClubMsg} 
                        onChange={(e) => setNewClubMsg(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                      />
                      <button type="submit" className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800">
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Feature 15: Drop-in Audio Stage */}
              {selectedConnectTab === "voice" && (
                <div className="max-w-md mx-auto bg-[#141414] text-white p-6 rounded-3xl border border-zinc-800 shadow-lg text-center space-y-6">
                  <div>
                    <span className="px-2.5 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">Live Audio Room</span>
                    <h3 className="text-lg font-bold mt-1">ASMR Unboxers Drop-in Lounge</h3>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">Tap mic below to speak to 4 online creators</p>
                  </div>

                  <div className="flex justify-center gap-6 py-6">
                    {voiceParticipants.map((p, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={cn(
                          "w-16 h-16 rounded-full p-1 relative",
                          p.speaking ? "bg-gradient-to-tr from-purple-500 to-lime-500 scale-105" : "bg-zinc-800"
                        )}>
                          <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full object-cover border border-black" />
                          {p.speaking && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[7px] px-1.5 rounded-full font-black uppercase">Speaking</span>
                          )}
                        </div>
                        <span className="text-xs font-bold mt-2 text-zinc-300">{p.name}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      setMicActive(!micActive);
                      toast.success(micActive ? "Microphone muted!" : "Microphone active! Speaking on Stage.");
                      addXpPoints(15);
                    }}
                    className={cn(
                      "w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      micActive ? "bg-red-500 text-white" : "bg-[#BEF264] text-black hover:bg-[#a6e03f]"
                    )}
                  >
                    <Mic className="w-4 h-4" />
                    {micActive ? "Mute Microphone" : "Tap to Speak on Stage"}
                  </button>
                </div>
              )}

              {/* Feature 16: Fever Live Event Discovery & Partner Ticketing Portal */}
              {selectedConnectTab === "meetups" && (
                <div className="space-y-6">
                  {/* Fever Hub Header */}
                  <div className="bg-gradient-to-r from-red-950 to-zinc-950 text-white p-6 rounded-3xl border border-red-500/20 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded">Fever Partnership Desk</span>
                        <span className="text-xs font-mono text-red-400">Live Entertainment & Partner Reporting API</span>
                      </div>
                      <h3 className="text-xl font-serif italic font-bold">Immersive Experiences & Ticketing</h3>
                      <p className="text-xs text-zinc-300 mt-1 max-w-xl font-medium">
                        Discover world-class live attractions near you or manage your own ticketed creator meetups. Get live checkout metrics, gate check-in logs, and partner reports.
                      </p>
                    </div>

                    <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 self-stretch md:self-auto">
                      <button
                        onClick={() => setFeverTab("explore")}
                        className={cn(
                          "flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                          feverTab === "explore" ? "bg-white text-black shadow" : "text-gray-400 hover:text-white"
                        )}
                      >
                        Explore Events
                      </button>
                      <button
                        onClick={() => setFeverTab("partner")}
                        className={cn(
                          "flex-1 md:flex-initial px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
                          feverTab === "partner" ? "bg-white text-black shadow" : "text-gray-400 hover:text-white"
                        )}
                      >
                        Partner Portal
                      </button>
                    </div>
                  </div>

                  {feverTab === "explore" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Fever Immersive Events list */}
                      <div className="md:col-span-2 space-y-4">
                        {[
                          { id: 101, title: "Candlelight Riyadh: Tribute to Hans Zimmer", loc: "Aura Cultural Palace, Riyadh", price: "$45", date: "August 12, 2026", rsvpCount: 420, label: "Fever Original", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80", desc: "Experience the magic of Hans Zimmer's top cinematic soundtracks under the gentle glow of thousands of candles." },
                          { id: 102, title: "Van Gogh: The Immersive Experience - Cairo", loc: "District 5 Arts Pavilion", price: "$32", date: "July 28, 2026", rsvpCount: 1482, label: "Attraction", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&q=80", desc: "A 360-degree digital projection mapping display showcasing Van Gogh's masterpieces with surround acoustic loops." },
                          { id: 103, title: "Harry Potter: A Forbidden Forest Experience", loc: "Khalifa Park, Abu Dhabi", price: "$60", date: "Sept 10, 2026", rsvpCount: 890, label: "Exclusive", img: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80", desc: "Walk along a lit-up night trail, encounters magical beasts, and live out your wizarding dreams." }
                        ].map((ev) => (
                          <div key={ev.id} className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5">
                            <img src={ev.img} alt={ev.title} className="w-full sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border border-gray-100" />
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
                                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black uppercase rounded border border-red-100">{ev.label}</span>
                                  <span className="text-[10px] text-gray-400 font-mono font-bold">{ev.rsvpCount} Booked</span>
                                </div>
                                <h4 className="font-black text-base text-[#141414]">{ev.title}</h4>
                                <p className="text-[11px] text-gray-500 font-medium mt-1">{ev.desc}</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-semibold">📍 {ev.loc} ● Date: {ev.date}</p>
                              </div>

                              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                                <span className="font-serif italic font-black text-lg text-[#141414]">{ev.price}</span>
                                <button
                                  onClick={() => {
                                    setFeverSelectedEvent(ev.id);
                                    addXpPoints(40);
                                    toast.success(`Redirecting to Fever Secure Gateway for: ${ev.title}!`);
                                  }}
                                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                                >
                                  Book Fever Ticket
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Checkout & My Tickets desk */}
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                          <h4 className="font-black text-xs text-[#141414] uppercase tracking-widest flex items-center gap-1.5">
                            <Ticket className="w-4 h-4 text-red-500" /> Secured Fever Passes
                          </h4>
                          <p className="text-[10px] text-gray-400 font-semibold leading-normal">Your digital vouchers will render instantly below after claiming. Show the barcode at the gate.</p>

                          {rsvpEvents.length === 0 && !feverSelectedEvent ? (
                            <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-semibold">
                              No active ticket bookings. Select an immersive Fever attraction to begin.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {feverSelectedEvent && (
                                <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-xs space-y-2 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-full blur-md" />
                                  <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Pending Gate Release</span>
                                    <span className="font-bold text-gray-500 font-mono">1 Ticket</span>
                                  </div>
                                  <h5 className="font-black text-xs text-[#141414]">
                                    {feverSelectedEvent === 101 ? "Candlelight Riyadh: Hans Zimmer" : feverSelectedEvent === 102 ? "Van Gogh Immersive Experience" : "Harry Potter Forbidden Forest"}
                                  </h5>
                                  <div className="bg-white p-2 border border-red-200/50 rounded-xl font-mono text-[9px] text-center tracking-widest text-zinc-600">
                                    |||||| | |||| |||| ||
                                    <span className="block text-[7px] text-gray-400 tracking-normal mt-0.5">VOUCHER_CRYOVA_{feverSelectedEvent}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setRsvpEvents(prev => [...prev, feverSelectedEvent]);
                                      setFeverSelectedEvent(null);
                                      addXpPoints(50);
                                      toast.success("Ticket cleared and claimed in offline wallet!", { icon: "🎟️" });
                                    }}
                                    className="w-full py-2 bg-red-500 hover:bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg transition-all"
                                  >
                                    Verify Pass & Secure Wallet
                                  </button>
                                </div>
                              )}

                              {rsvpEvents.map((id) => (
                                <div key={id} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs space-y-1">
                                  <div className="flex justify-between items-center text-[8px] font-black uppercase text-emerald-800">
                                    <span>🎟️ Active Fever Ticket</span>
                                    <span>Verified Gate-Ready</span>
                                  </div>
                                  <h5 className="font-black text-xs text-emerald-950">
                                    {id === 101 ? "Candlelight Riyadh: Hans Zimmer" : id === 102 ? "Van Gogh Immersive Experience" : id === 103 ? "Harry Potter Forbidden Forest" : "Standard RSVP Meetup"}
                                  </h5>
                                  <p className="text-[8px] text-gray-400 font-semibold">Door entry open 45 minutes prior. Dress code: Smart Casual.</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Fever Partner Reporting Hub */
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: "Partner Gross Revenue", value: `$${feverPartnerStats.revenue.toLocaleString()}`, change: "+14.2% MoM", icon: DollarSign, color: "text-emerald-500 bg-emerald-50" },
                          { label: "Tickets Redeemed", value: feverPartnerStats.ticketsSold, change: "92% Attendance", icon: Ticket, color: "text-blue-500 bg-blue-50" },
                          { label: "Conversion Rate", value: `${feverPartnerStats.conversionRate}%`, change: "Top 10% in Riyadh", icon: TrendingUp, color: "text-purple-500 bg-purple-50" },
                          { label: "Check-in Gate Rate", value: `${feverPartnerStats.checkInRate}%`, change: "Avg 4m processing", icon: UserCheck, color: "text-red-500 bg-red-50" }
                        ].map((st, idx) => (
                          <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider leading-none">{st.label}</span>
                              <div className={cn("p-1.5 rounded-lg", st.color)}>
                                <st.icon className="w-3.5 h-3.5" />
                              </div>
                            </div>
                            <span className="text-xl font-serif italic font-black text-[#141414]">{st.value}</span>
                            <span className="text-[9px] font-black text-emerald-600 uppercase block mt-1">{st.change}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Ticketing analytics Recharts graph */}
                        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                          <div>
                            <h4 className="font-black text-sm text-[#141414] uppercase tracking-tight">Real-Time Ticket Sales Progression</h4>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Live reporting updates from fever booking gateways over last 7 days</p>
                          </div>

                          <div className="h-48 font-mono">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={[
                                { name: "Mon", sales: 84 },
                                { name: "Tue", sales: 120 },
                                { name: "Wed", sales: 180 },
                                { name: "Thu", sales: 240 },
                                { name: "Fri", sales: 380 },
                                { name: "Sat", sales: 420 },
                                { name: "Sun", sales: feverPartnerStats.ticketsSold - 1420 + 380 }
                              ]}>
                                <defs>
                                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#A3A3A3" fontSize={9} />
                                <YAxis stroke="#A3A3A3" fontSize={9} />
                                <Tooltip />
                                <Area type="monotone" dataKey="sales" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Guest Check-in Simulator */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                          <div>
                            <h4 className="font-black text-sm text-[#141414] uppercase">Live Gate Controller</h4>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Simulate checking in Fever ticket holders at the venue door.</p>
                          </div>

                          <div className="space-y-2">
                            {[
                              { name: "Sienna Rivers", code: "TCK-882-SIENNA", checked: false },
                              { name: "Omar Farooq", code: "TCK-401-OMAR", checked: false },
                              { name: "Salma Hegazi", code: "TCK-109-SALMA", checked: true }
                            ].map((guest, i) => (
                              <div key={i} className="p-3 bg-gray-50 border border-gray-150 rounded-2xl flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-black text-[#141414]">{guest.name}</p>
                                  <p className="text-[8px] text-gray-400 font-mono mt-0.5">{guest.code}</p>
                                </div>
                                <button
                                  disabled={guest.checked}
                                  onClick={() => {
                                    setFeverPartnerStats(prev => ({
                                      ...prev,
                                      ticketsSold: prev.ticketsSold + 1,
                                      revenue: prev.revenue + 45
                                    }));
                                    addXpPoints(15);
                                    toast.success(`Checked in ${guest.name}! Partner metrics updated live.`);
                                  }}
                                  className={cn(
                                    "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    guest.checked ? "bg-emerald-100 text-emerald-700 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
                                  )}
                                >
                                  {guest.checked ? "Admitted" : "Admit"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 6: CREATOR ACADEMY */}
          {activeTab === "academy" && (
            <motion.div 
              key="academy"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {selectedCourse ? (
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
                  <button 
                    onClick={() => {
                      setSelectedCourse(null);
                      setQuizAnswer(null);
                      setQuizSubmitted(false);
                    }}
                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back to Academy List
                  </button>

                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 bg-[#BEF264] text-black text-[8px] font-black uppercase tracking-widest rounded-full">Interactive Masterclass</span>
                    <h3 className="text-2xl font-black italic font-serif text-[#141414]">{selectedCourse.title}</h3>
                  </div>

                  {/* Course visual details */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700 leading-relaxed font-sans">
                    {selectedCourse.content}
                  </div>

                  {/* Feature 17: Multi choice Quiz gated tests */}
                  <div className="border-t border-gray-150 pt-6 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-purple-700">Mini Quiz Comprehension Test</h4>
                    <p className="text-sm font-bold text-[#141414]">{selectedCourse.quizQuestion}</p>
                    
                    <div className="space-y-2">
                      {selectedCourse.quizOptions.map((opt: any) => (
                        <div 
                          key={opt.key} 
                          onClick={() => !quizSubmitted && setQuizAnswer(opt.key)}
                          className={cn(
                            "p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all",
                            quizAnswer === opt.key ? "bg-purple-50 border-purple-400 text-purple-900" : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                            quizSubmitted && "pointer-events-none opacity-60"
                          )}
                        >
                          <strong>({opt.key})</strong> {opt.text}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      {quizSubmitted ? (
                        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold">
                          {quizAnswer === selectedCourse.correctKey ? "Correct Answer! Mastery XP points unlocked." : "Wrong answer. Please study lessons again and restart."}
                        </div>
                      ) : (
                        <button 
                          onClick={handleQuizSubmit}
                          disabled={!quizAnswer}
                          className="px-6 py-3 bg-black text-white hover:bg-gray-800 disabled:opacity-50 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                        >
                          Submit Answer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="px-2 py-0.5 bg-[#BEF264] text-black text-[8px] font-black uppercase tracking-widest rounded">
                            {course.lessons} lessons
                          </span>
                          {masteredCourses.includes(course.id) && (
                            <span className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5 font-mono">
                              <CheckCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" /> MASTERED
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-xl text-[#141414] mb-2">{course.title}</h4>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">{course.desc}</p>
                      </div>

                      <button 
                        onClick={() => setSelectedCourse(course)}
                        className="w-full py-3 bg-black text-white hover:bg-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Start Masterclass +120 XP
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 7: OS ADD-ONS */}
          {activeTab === "addons" && (
            <motion.div 
              key="addons"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex border-b border-gray-200 gap-4 overflow-x-auto scrollbar-none">
                {[
                  { id: "rewards", label: "XP Rewards Shop", icon: ShoppingBag },
                  { id: "qna", label: "Q&A Fan Questions", icon: MessageSquare },
                  { id: "soundtrack", label: "Background Soundtrack", icon: Music },
                  { id: "brand", label: "Brand campaign publish desk", icon: Briefcase },
                  { id: "aura", label: "Aura Intelligence Desk", icon: TrendingUp },
                  { id: "mcp", label: "MCP AI Portal", icon: Layers }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedAddonTab(st.id as any)}
                    className={cn(
                      "px-3 py-2 text-[9px] font-black uppercase tracking-widest border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                      selectedAddonTab === st.id 
                        ? "border-[#141414] text-[#141414]" 
                        : "border-transparent text-gray-400 hover:text-black"
                    )}
                  >
                    <st.icon className="w-3.5 h-3.5" />
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Subtabs rendering */}
              
              {/* Feature 18: XP Milestones Rewards Shop */}
              {selectedAddonTab === "rewards" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {rewardShopItems.map((item) => {
                    const isBought = boughtItems.includes(item.id);
                    return (
                      <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[8px] font-black uppercase tracking-wider rounded border border-yellow-200">Exclusive Perk</span>
                            <span className="font-mono text-xs font-black text-[#141414]">{item.cost} XP</span>
                          </div>
                          <h4 className="font-black text-lg text-[#141414] mb-1">{item.name}</h4>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed mt-2">{item.desc}</p>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-6">
                          <button
                            disabled={isBought}
                            onClick={() => handleBuyReward(item)}
                            className={cn(
                              "w-full py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-2xs",
                              isBought 
                                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed" 
                                : "bg-[#BEF264] hover:bg-[#a6e03f] text-[#141414]"
                            )}
                          >
                            {isBought ? "Claimed / Activated" : "Redeem Perk"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Feature 19: Fan Q&A Inbox */}
              {selectedAddonTab === "qna" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-2 py-0.5 rounded w-fit">Interactive Fan Q&A Inbox</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">Allow brands or audience fans to leave anonymous queries on your profile. Responding adds +40 XP.</p>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                    {qaInbox.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 border border-gray-250 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                          <span>{item.sender}</span>
                          <span>{item.date}</span>
                        </div>
                        <p className="text-xs font-black text-[#141414]">❓ "{item.question}"</p>
                        
                        {item.answer ? (
                          <div className="p-3 bg-purple-50 border border-purple-150 rounded-xl text-xs text-purple-900 leading-relaxed font-medium">
                            <strong>Your Public Answer:</strong> "{item.answer}"
                          </div>
                        ) : (
                          <div>
                            {answeringQaId === item.id ? (
                              <div className="space-y-2">
                                <input 
                                  type="text" 
                                  placeholder="Type response answer..." 
                                  value={qaAnswerText} 
                                  onChange={(e) => setQaAnswerText(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setAnsweringQaId(null)} className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Cancel</button>
                                  <button onClick={() => handleAnswerQa(item.id)} className="px-4 py-1.5 bg-[#BEF264] text-black rounded-lg text-[9px] font-black uppercase tracking-widest">Post Answer</button>
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setAnsweringQaId(item.id)} 
                                className="px-4 py-1.5 bg-[#141414] text-white text-[9px] font-black uppercase tracking-widest rounded-lg"
                              >
                                Answer Question
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature 17: Soundtrack selector player */}
              {selectedAddonTab === "soundtrack" && (
                <div className="max-w-md mx-auto bg-white p-6 rounded-3xl border border-gray-150 shadow-sm text-center space-y-6">
                  <div>
                    <span className="px-2.5 py-0.5 bg-purple-100 text-[#A855F7] text-[8px] font-black uppercase tracking-widest rounded-full">Background ambient soundscape</span>
                    <h3 className="text-lg font-bold mt-1">Profile custom music soundtrack</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Pick a theme song to set as your public background profile loop</p>
                  </div>

                  <div className="space-y-2">
                    {soundtracks.map((track) => (
                      <button
                        key={track}
                        onClick={() => {
                          setActiveSoundtrack(track);
                          if (track !== "Off") {
                            addXpPoints(15);
                            toast.success(`Active soundtrack switched to: ${track}!`);
                          } else {
                            toast.info("Music track muted.");
                          }
                        }}
                        className={cn(
                          "w-full py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all flex justify-between items-center px-4 cursor-pointer",
                          activeSoundtrack === track ? "bg-black text-white border-black" : "bg-gray-50 border-gray-150 hover:bg-gray-100 text-gray-600"
                        )}
                      >
                        <span>{track}</span>
                        {activeSoundtrack === track && <Volume2 className="w-4 h-4 animate-bounce text-[#BEF264]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature 21: Brand campaign creator desk */}
              {selectedAddonTab === "brand" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#141414] text-white p-6 rounded-3xl border border-gray-800 shadow-md flex flex-col justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 bg-[#BEF264] text-black text-[8px] font-black uppercase tracking-widest rounded-full">Client Workspace</span>
                      <h4 className="text-lg font-black text-white mt-1">Corporate Client Desk</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-semibold mt-3">Toggle to brand-view to post official briefs, deposit contract budgets safely, and browse matching profiles.</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                    <h4 className="text-xs font-black text-[#141414] uppercase mb-4">Post a Premium Brand Brief</h4>
                    
                    <form onSubmit={handleBrandSubmitCampaign} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Campaign Project Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Summer Sport Shorts Reels"
                            required
                            value={brandCampTitle}
                            onChange={(e) => setBrandCampTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Guaranteed Budget ($ USD)</label>
                          <input 
                            type="number" 
                            placeholder="1500"
                            required
                            value={brandCampBudget}
                            onChange={(e) => setBrandCampBudget(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Visual Deliverables Requirement Scripting</label>
                        <textarea 
                          rows={4}
                          placeholder="e.g. 1 dynamic unboxing reel with close-up mechanical keyboards tapping, shot on dual macro lenses..."
                          value={brandCampDesc}
                          onChange={(e) => setBrandCampDesc(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-medium"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-3 bg-black text-white hover:bg-gray-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Publish Brand brief to Creator Marketplace
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Aura Intelligence Desk */}
              {selectedAddonTab === "aura" && (
                <div className="space-y-6">
                  {/* Aura Header */}
                  <div className="bg-gradient-to-r from-teal-950 to-zinc-900 text-white p-6 rounded-3xl border border-teal-500/20 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#BEF264] text-black text-[8px] font-black uppercase tracking-widest rounded">Aura Intelligence AI</span>
                      <span className="text-xs font-mono text-teal-400">Workforce Data & Due Diligence Benchmarking</span>
                    </div>
                    <h3 className="text-xl font-serif italic font-bold">Labor-Market Due Diligence</h3>
                    <p className="text-xs text-zinc-300 mt-1 max-w-xl font-medium">
                      Analyze company metrics, workforce salary ranges, verified contract rates, and due-diligence insights before pitching or signing high-ticket enterprise contracts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Search company & research */}
                    <div className="md:col-span-1 space-y-4">
                      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                        <h4 className="font-black text-xs text-[#141414] uppercase tracking-wider">Search Corporate Records</h4>
                        <form onSubmit={handleAuraSearch} className="space-y-3">
                          <input
                            type="text"
                            placeholder="Enter company name (e.g. Nike, Sephora, Slack)..."
                            value={auraQuery}
                            onChange={(e) => setAuraQuery(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                          />
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-black text-white hover:bg-gray-800 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                            Query Labor Intelligence
                          </button>
                        </form>

                        <div className="space-y-2">
                          <span className="block text-[8px] font-black uppercase text-gray-400">Pre-compiled indexes</span>
                          <div className="flex flex-wrap gap-1.5">
                            {["Nike Sports", "Sephora", "Slack", "L'Oreal"].map((idxBrand) => (
                              <button
                                key={idxBrand}
                                onClick={() => {
                                  setAuraQuery(idxBrand);
                                  // Trigger a quick query update
                                  setIsAuraLoading(true);
                                  setTimeout(() => {
                                    const mockData = idxBrand === "Nike Sports" ? {
                                      companyName: "Nike Sports Middle East",
                                      employeeCount: "42,000+",
                                      averageSalaryUGC: "$4,500/mo",
                                      marketDemand: "92% (High demand for athletic ASMR soundscapes)",
                                      verifiedEscrowHistory: "100% Secure (14 contracts cleared)",
                                      riskRating: "Low (A+ credit history)",
                                      benchmarkingSalaryRange: { min: 1500, median: 4500, max: 9500 },
                                      skillAvailability: [
                                        { name: "Raw footage rights", value: "Rare (Requested on 84% of briefs)" },
                                        { name: "3-day turnaround", value: "Standard (Available on 42% of creators)" },
                                        { name: "High conversion hook writing", value: "Premium (Adds 25% to overall budget)" }
                                      ]
                                    } : idxBrand === "Sephora" ? {
                                      companyName: "Sephora UAE & Middle East",
                                      employeeCount: "18,500+",
                                      averageSalaryUGC: "$3,800/mo",
                                      marketDemand: "88% (Intense beauty tutorial & skincare loop interest)",
                                      verifiedEscrowHistory: "100% Secure (22 contracts cleared)",
                                      riskRating: "Low (Excellent partner rating)",
                                      benchmarkingSalaryRange: { min: 1000, median: 3800, max: 8000 },
                                      skillAvailability: [
                                        { name: "Authentic skincare demos", value: "Common (Offered by 72% of creators)" },
                                        { name: "Ultra-macro skincare loops", value: "Rare (Increases retention rates by 34%)" },
                                        { name: "Raw audio voiceover clips", value: "Standard (Required on all active campaigns)" }
                                      ]
                                    } : idxBrand === "Slack" ? {
                                      companyName: "Slack Technologies Inc.",
                                      employeeCount: "5,000+",
                                      averageSalaryUGC: "$5,500/mo",
                                      marketDemand: "95% (High demand for SaaS screencasts and onboarding demos)",
                                      verifiedEscrowHistory: "100% Secure (9 contracts cleared)",
                                      riskRating: "Negligible (AAA rated tier)",
                                      benchmarkingSalaryRange: { min: 2500, median: 5500, max: 12000 },
                                      skillAvailability: [
                                        { name: "Professional voiceover narration", value: "Required (Available on 45% of matches)" },
                                        { name: "Interactive step click-throughs", value: "Preferred (Adds 18% CTR conversion)" },
                                        { name: "Product screen raw edits", value: "Rare (Demanded on 92% of corporate contracts)" }
                                      ]
                                    } : {
                                      companyName: "L'Oreal Middle East Division",
                                      employeeCount: "86,000+",
                                      averageSalaryUGC: "$4,200/mo",
                                      marketDemand: "85% (Consistent hair routine and aesthetic tutorials)",
                                      verifiedEscrowHistory: "100% Secure (31 contracts cleared)",
                                      riskRating: "Low (Corporate standard escrow)",
                                      benchmarkingSalaryRange: { min: 1200, median: 4200, max: 9000 },
                                      skillAvailability: [
                                        { name: "Professional close-up styling", value: "Standard (Supplied on 80% of matches)" },
                                        { name: "Custom color-graded reels", value: "Premium (Increases cost by 15%)" },
                                        { name: "Audio-first unboxing clicks", value: "Rare (Requested on 32% of briefs)" }
                                      ]
                                    };
                                    setAuraData(mockData);
                                    setIsAuraLoading(false);
                                    addXpPoints(10);
                                  }, 300);
                                }}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[9px] font-semibold transition-all cursor-pointer"
                              >
                                {idxBrand}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Intelligence report outcome */}
                    <div className="md:col-span-2">
                      {isAuraLoading ? (
                        <div className="bg-white p-12 rounded-3xl border border-gray-150 shadow-sm text-center space-y-3 h-full flex flex-col justify-center items-center">
                          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                          <p className="text-xs font-black text-[#141414] uppercase tracking-widest">Compiling Labor Analytics...</p>
                          <p className="text-[10px] text-gray-400 font-semibold">Scanning workforce registries, contract logs, and salary benchmarks</p>
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-6">
                          <div>
                            <span className="text-[8px] font-black uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">Compiled Intelligence Briefing</span>
                            <h4 className="text-xl font-serif italic font-bold text-[#141414] mt-1">{auraData.companyName}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Corporate due diligence & labor demand stats</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                              <span className="text-[8px] font-black uppercase text-gray-400 block">Workforce Scale</span>
                              <span className="text-sm font-black text-[#141414]">{auraData.employeeCount} Employees</span>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                              <span className="text-[8px] font-black uppercase text-gray-400 block">Average UGC Contract Rate</span>
                              <span className="text-sm font-black text-[#141414]">{auraData.averageSalaryUGC}</span>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                              <span className="text-[8px] font-black uppercase text-gray-400 block">Escrow Clearance Ratio</span>
                              <span className="text-sm font-black text-emerald-600">{auraData.verifiedEscrowHistory}</span>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                              <span className="text-[8px] font-black uppercase text-gray-400 block">Default Risk Level</span>
                              <span className="text-sm font-black text-teal-700">{auraData.riskRating}</span>
                            </div>
                          </div>

                          {/* Recharts Salary Benchmarking Chart */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase text-gray-400 block">Creator Salary Benchmarking Curve ($ USD)</span>
                            <div className="h-44 font-mono">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                  { name: "Entry Base", salary: auraData.benchmarkingSalaryRange.min },
                                  { name: "Average/Median", salary: auraData.benchmarkingSalaryRange.median },
                                  { name: "Enterprise Peak", salary: auraData.benchmarkingSalaryRange.max }
                                ]}>
                                  <XAxis dataKey="name" stroke="#A3A3A3" fontSize={9} />
                                  <YAxis stroke="#A3A3A3" fontSize={9} />
                                  <Tooltip />
                                  <Bar dataKey="salary" fill="#0D9488" radius={[8, 8, 0, 0]}>
                                    <Cell fill="#99F6E4" />
                                    <Cell fill="#0D9488" />
                                    <Cell fill="#115E59" />
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 space-y-2">
                            <span className="text-[9px] font-black uppercase text-gray-400 block">Skill Requirements Availability Analysis</span>
                            <div className="space-y-1.5">
                              {auraData.skillAvailability.map((skill: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                  <span className="text-gray-600 font-medium">{skill.name}</span>
                                  <span className="font-mono text-[10px] font-black text-[#141414] bg-gray-100 px-2 py-0.5 rounded">{skill.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Model Context Protocol Portal (MCP) */}
              {selectedAddonTab === "mcp" && (
                <div className="space-y-6">
                  {/* MCP Header */}
                  <div className="bg-gradient-to-r from-indigo-950 to-zinc-900 text-white p-6 rounded-3xl border border-indigo-500/20 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#BEF264] text-black text-[8px] font-black uppercase tracking-widest rounded">MCP v1.0 Spec</span>
                      <span className="text-xs font-mono text-indigo-400">Open standard for connecting AI models to local apps</span>
                    </div>
                    <h3 className="text-xl font-serif italic font-bold">Model Context Protocol (MCP) Terminal</h3>
                    <p className="text-xs text-zinc-300 mt-1 max-w-xl font-medium">
                      Allow external LLM agents (like Claude or Gemini) to safely fetch your portfolio resources, read standard Contra services, and call negotiation prompt templates.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left: Interactive Handshake query panel */}
                    <div className="md:col-span-4 space-y-4">
                      <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                        <h4 className="font-black text-xs text-[#141414] uppercase tracking-wider">Test MCP AI Queries</h4>
                        <p className="text-[10px] text-gray-400 font-semibold leading-normal">Simulate how an external AI agent queries your CRYOVA Hub resources securely using JSON-RPC.</p>

                        <div className="space-y-2">
                          {[
                            { id: "list_tools", label: "Query Available Tools", desc: "List tools that let LLMs interact with your services" },
                            { id: "read_resource", label: "Fetch Profile Resource", desc: "Let LLMs read text contents of your portfolio" },
                            { id: "call_tool", label: "Call Tool Handler", desc: "Simulate calling get_creator_services endpoint" }
                          ].map((queryOpt) => (
                            <button
                              key={queryOpt.id}
                              onClick={() => handleRunMcpRequest(queryOpt.id as any)}
                              className={cn(
                                "w-full text-left p-3 rounded-2xl border transition-all cursor-pointer",
                                mcpRequestType === queryOpt.id ? "bg-indigo-50 border-indigo-300" : "bg-gray-50 border-gray-150 hover:bg-gray-100"
                              )}
                            >
                              <span className="block font-black text-xs text-[#141414]">{queryOpt.label}</span>
                              <span className="block text-[9px] text-gray-400 font-semibold mt-0.5 leading-normal">{queryOpt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Live Terminal RPC response */}
                    <div className="md:col-span-5 space-y-4">
                      <div className="bg-[#141414] text-lime-400 p-5 rounded-3xl shadow-sm border border-gray-800 space-y-3 h-full flex flex-col justify-between min-h-[380px]">
                        <div>
                          <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                            <span className="text-[8px] font-black uppercase text-[#BEF264] tracking-widest">JSON-RPC RESPONSE TERMINAL</span>
                            <span className="text-[8px] font-mono font-bold text-gray-500">200 OK</span>
                          </div>
                          <pre className="text-[10px] font-mono leading-relaxed mt-4 overflow-x-auto whitespace-pre-wrap max-h-72">
                            {mcpActiveToolOutput}
                          </pre>
                        </div>

                        <div className="pt-2 border-t border-gray-800 text-[8px] text-gray-500 font-semibold flex justify-between items-center font-mono">
                          <span>Protocol: MCP-v1.0.0</span>
                          <span>Secure Handshake clearinghouse</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Specs, logs, details */}
                    <div className="md:col-span-3 space-y-4">
                      <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4 h-full flex flex-col justify-between">
                        <div className="space-y-4">
                          <h4 className="font-black text-xs text-[#141414] uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Live MCP Server Logs
                          </h4>
                          
                          <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-150 text-[9px] font-mono text-gray-500 leading-normal max-h-60 overflow-y-auto">
                            {mcpConsoleLogs.map((log, idx) => (
                              <div key={idx} className="border-b border-gray-100 pb-1 last:border-0">{log}</div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-150 text-[10px] text-indigo-900 leading-relaxed font-semibold">
                          💡 <strong>How to integrate:</strong> Copy your personalized MCP schema URL and paste it in cursor, claude-desktop-config.json, or custom Gemini client to invoke your OS.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
