import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Briefcase, 
  Zap, 
  Play, 
  Flame, 
  CheckCircle, 
  Settings, 
  Users, 
  Tv, 
  Compass, 
  MessageSquare, 
  Camera, 
  Plus, 
  Minus,
  HelpCircle,
  Mail,
  User,
  Globe,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CuteCharacter } from "../components/ui/CuteCharacter";
import { AntigravityCanvas } from "../components/ui/AntigravityCanvas";
import { TiltCard } from "../components/ui/TiltCard";
import { CryovaLogoSymbol } from "../components/ui/CryovaLogoSymbol";
import { AntigravityCursorBackground } from "../components/ui/AntigravityCursorBackground";
import { CryovaSkeletonLogo } from "../components/ui/CryovaSkeletonLogo";

// Mock Brands for the Scrolling Marquee
const BRANDS = [
  { name: "Jeep", logo: "JEEP" },
  { name: "Champion", logo: "CHAMPION" },
  { name: "Gillette", logo: "GILLETTE" },
  { name: "Netflix", logo: "NETFLIX" },
  { name: "Nike", logo: "NIKE" },
  { name: "Spotify", logo: "SPOTIFY" },
  { name: "Jeep Dupe", logo: "JEEP" },
  { name: "Champion Dupe", logo: "CHAMPION" },
  { name: "Gillette Dupe", logo: "GILLETTE" },
  { name: "Netflix Dupe", logo: "NETFLIX" },
  { name: "Nike Dupe", logo: "NIKE" },
  { name: "Spotify Dupe", logo: "SPOTIFY" },
];

// FAQS
const FAQS = [
  {
    question: "What is CRYOVA and how does it work?",
    answer: "CRYOVA is an elite UGC (User Generated Content) and Creator Magic platform. We match elite visual creators with brands looking for authentic storytellers, managing everything from contracts to production workflows in one unified, high-performance interface."
  },
  {
    question: "How does the Antigravity Matching engine work?",
    answer: "Our intelligent matchmaking coordinates creator metrics, content style, engagement performance, and brand demographics using advanced AI criteria, ensuring high-conversion fits that spark natural audience response."
  },
  {
    question: "When do creators get paid?",
    answer: "No more chasing invoices! CRYOVA uses a secure escrow system. Payment milestones are locked when a campaign starts and instantly transferred to creators as soon as the deliverable is validated."
  },
  {
    question: "Can brands review creators before launching campaigns?",
    answer: "Yes, brands have direct access to interactive portfolios, historic campaign conversion rates, video response times, and customizable mock creative pitches before locking down contracts."
  }
];

export default function LandingPage() {
  // Hero typing states
  const [typedText, setTypedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [isLogoWalking, setIsLogoWalking] = useState(false);

  useEffect(() => {
    const fullText = "that Spark.";
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 85); // Professional, readable cadence
    return () => clearInterval(typingInterval);
  }, []);

  // Physics Controls State
  const [gravity, setGravity] = useState(-0.15);
  const [bounciness, setBounciness] = useState(0.8);
  const [mouseForce, setMouseForce] = useState(1.0);
  const [mouseMode, setMouseMode] = useState<"repel" | "attract">("repel");
  
  // Lead Generation States
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadRole, setLeadRole] = useState<"creator" | "brand">("creator");
  const [leadMessage, setLeadMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Interactive Live Matching Visualizer State
  const [matchingStep, setMatchingStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setMatchingStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Sandbox Portfolio States
  const [selectedCategory, setSelectedCategory] = useState("Beauty & Makeup");
  const [sandboxPrompt, setSandboxPrompt] = useState("");
  const [isGeneratingSandbox, setIsGeneratingSandbox] = useState(false);
  const [simulateResult, setSimulateResult] = useState<any>(null);

  const handleGenerateSandbox = () => {
    setIsGeneratingSandbox(true);
    setTimeout(() => {
      let narrative = "";
      let targetBrands: string[] = [];
      let tags: string[] = [];
      let matchScore = "98.4%";
      let engagement = "8.4%";
      let viralOdds = "High";
      let image = "";

      if (selectedCategory === "Beauty & Makeup") {
        narrative = sandboxPrompt ? `Showcasing the soft texture of ${sandboxPrompt} with a natural light routine.` : "Soft glam tutorial focused on clean beauty aesthetics and hyper-zoomed application shots.";
        targetBrands = ["Sephora", "L'Oreal", "Fenty Beauty"];
        tags = ["#CleanGirl", "#UGCBeauty", "#SoftGlam"];
        matchScore = "99.1%";
        engagement = "9.4%";
        image = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop";
      } else if (selectedCategory === "Tech Reviews") {
        narrative = sandboxPrompt ? `Desk setup macro B-roll introducing the high ergonomics of ${sandboxPrompt}.` : "Kinetic ASMR tech unboxing with macro slow-motion focus pulls on custom anodized details.";
        targetBrands = ["Logitech", "ASUS", "Nothing Tech"];
        tags = ["#ASMRTech", "#DeskSetup", "#Unboxing"];
        matchScore = "97.8%";
        engagement = "7.9%";
        image = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop";
      } else if (selectedCategory === "Fitness & Athletics") {
        narrative = sandboxPrompt ? `Explosive athletic sequence emphasizing durability of the active gear for ${sandboxPrompt}.` : "High-intensity athletic transition sequence sync'd to electronic beats with performance overlays.";
        targetBrands = ["Nike", "Gymshark", "Lululemon"];
        tags = ["#PerformanceUGC", "#ActiveLife", "#AestheticFits"];
        matchScore = "98.5%";
        engagement = "11.2%";
        image = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop";
      } else {
        narrative = sandboxPrompt ? `Stylized street fashion lookbook combining thrift pieces to accent ${sandboxPrompt}.` : "Retro high-contrast film grading lookbook showing three urban outfits with quick-cut shoe transitions.";
        targetBrands = ["ZARA", "ASOS", "Uniqlo"];
        tags = ["#StreetOutfit", "#OOTD", "#VintageVibe"];
        matchScore = "96.4%";
        engagement = "8.1%";
        image = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=400&auto=format&fit=crop";
      }

      setSimulateResult({
        narrative,
        targetBrands,
        tags,
        matchScore,
        engagement,
        viralOdds,
        image
      });
      setIsGeneratingSandbox(false);
      toast.success("AI Portfolio Optimization Complete!");
    }, 1200);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) {
      toast.error("Please fill in your name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save lead information into Firestore "leads" collection
      await addDoc(collection(db, "leads"), {
        name: leadName,
        email: leadEmail,
        role: leadRole,
        message: leadMessage,
        createdAt: new Date().toISOString()
      });

      setSubmitSuccess(true);
      toast.success("Welcome to the Spark! Your invite application has been registered.");
      setLeadName("");
      setLeadEmail("");
      setLeadMessage("");
    } catch (error) {
      console.error("Firestore Lead Submit Error:", error);
      toast.error("Failed to submit invite application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141414] font-sans selection:bg-[#BEF264] selection:text-[#141414] overflow-x-hidden relative">
      
      {/* GLOBAL ANTIGRAVITY CURSOR TRAIL & BACKGROUND EFFECT */}
      <AntigravityCursorBackground />

      {/* BACKGROUND GRAPHIC ACCENTS */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-[#BEF264]/8 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] bg-[#A855F7]/4 rounded-full filter blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-[50%] right-[-10%] w-[550px] h-[550px] bg-[#BEF264]/6 rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* HEADER & NAV */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="fixed top-0 left-0 right-0 h-20 border-[4px] border-[ridge] border-[#f0f3ed] rounded-[4px] bg-white/70 backdrop-blur-xl z-50 px-6 lg:px-12 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            onMouseEnter={() => setIsLogoWalking(true)}
            onMouseLeave={() => setIsLogoWalking(false)}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200/60 flex items-center justify-center shadow-sm cursor-pointer overflow-hidden relative"
          >
            <CuteCharacter size="sm" isWalking={isLogoWalking} />
          </motion.div>
          <div className="flex flex-col relative justify-center">
            {/* Blueprint Skeleton Wireframe behind CRYOVA name */}
            <div className="absolute left-[-24px] top-[-14px] pointer-events-none select-none z-0 opacity-20">
              <CryovaSkeletonLogo size={64} className="text-[#BEF264]" />
            </div>
            <span className="font-black text-2xl tracking-tighter leading-none text-[#141414] flex items-center gap-1.5 relative z-10">
              CRYOVA
              <span className="w-2 h-2 rounded-full bg-[#BEF264] shadow-[0_0_8px_#BEF264]" />
            </span>
            <span className="text-[9px] font-mono tracking-widest text-gray-400 uppercase leading-none mt-1 relative z-10">UGC CREATOR NETWORK</span>
          </div>
        </div>

        {/* Navigation Items with Animated Underlines */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-500">
          <a href="#creators" className="hover:text-[#141414] transition-colors relative group py-2">
            For Creators
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#BEF264] transition-all group-hover:w-full" />
          </a>
          <a href="#brands" className="hover:text-[#141414] transition-colors relative group py-2">
            For Brands
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#BEF264] transition-all group-hover:w-full" />
          </a>
          <a href="#expertise" className="hover:text-[#141414] transition-colors relative group py-2">
            Our Expertise
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#BEF264] transition-all group-hover:w-full" />
          </a>
          <a href="#faqs" className="hover:text-[#141414] transition-colors relative group py-2">
            FAQ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#BEF264] transition-all group-hover:w-full" />
          </a>
        </nav>

        {/* Call To Actions */}
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-sm font-semibold text-gray-600 hover:text-[#141414] transition-all duration-200 hidden sm:inline-block"
          >
            Log in
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/login" 
              className="h-11 px-6 inline-flex items-center justify-center rounded-full bg-[#BEF264] text-[#141414] text-xs font-black uppercase tracking-wider border-2 border-[#141414] hover:bg-[#aef14c] transition-colors gap-2 shadow-[4px_4px_0px_#141414]"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <main className="relative z-10 pt-28 lg:pt-36 bg-[#ffffff]">
        <section className="px-6 max-w-7xl mx-auto pb-16">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* HERO LEFT TEXT */}
            <div className="lg:col-span-6 flex flex-col items-start text-left z-10 border border-white bg-white">
              {/* Pulsing Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-[#141414] rounded-full text-[#141414] text-[10px] font-mono uppercase tracking-widest mb-6 shadow-[3px_3px_0px_#141414]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A855F7] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A855F7]"></span>
                </span>
                <span>GLOBAL CREATOR NETWORK</span>
              </motion.div>

              {/* Display Header */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1] text-[#141414]">
                {/* Static Main Row */}
                <span className="block text-[#141414] font-black text-4xl sm:text-5xl md:text-6xl">
                  UGC Campaigns
                </span>
                
                {/* Typing Second Row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                  <span className="text-[#141414]">
                    {typedText}
                    {!typingComplete && (
                      <motion.span 
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.7 }}
                        className="inline-block w-2.5 h-8 md:h-11 ml-1 bg-[#BEF264] rounded-sm align-middle shadow-[0_0_8px_#BEF264]" 
                      />
                    )}
                  </span>

                  {/* Brand Tag [ ❇️ CRYOVA ] */}
                  {typingComplete && (
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: 1 
                      }}
                      transition={{ 
                        scale: {
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut"
                        },
                        opacity: {
                          duration: 0.4
                        }
                      }}
                      whileHover={{ scale: 1.15 }}
                      className="inline-flex items-center gap-1.5 border-2 border-[#141414] px-4 py-1 rounded-2xl bg-white shadow-[3px_3px_0px_#141414] text-xl sm:text-2xl md:text-3xl font-black relative overflow-hidden cursor-pointer"
                    >
                      {/* Technical Blueprint Skeleton underlay behind CRYOVA */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <CryovaSkeletonLogo size={90} className="text-[#BEF264]" />
                      </div>
                      
                      <span className="text-[#141414] relative z-10 font-black tracking-normal">[</span>
                      <CryovaLogoSymbol className="w-5 h-5 sm:w-6 sm:h-6 text-[#141414] relative z-10" />
                      <span className="text-[#f538ac] bg-[#f6f6f1] px-1.5 py-0.5 rounded-md tracking-tighter relative z-10 font-black">CRYOVA]</span>
                    </motion.div>
                  )}
                </div>

                {/* Subtag Third Row */}
                {typingComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
                    className="mt-3 block"
                  >
                    <span className="inline-block border-2 border-dashed border-[#BEF264] px-4 py-1.5 rounded-2xl bg-[#edfff6] text-[#141414] text-xl sm:text-2xl md:text-3xl font-black tracking-normal shadow-[inset_0_0_12px_rgba(190,242,100,0.2)]">
                      [with Our Creator Magic]
                    </span>
                  </motion.div>
                )}
              </h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg text-gray-500 mb-8 max-w-xl leading-relaxed font-medium"
              >
                Build trust and connect with real storytellers to drive meaningful business results. CRYOVA enables elite creator alignments powered by smart flow systems.
              </motion.p>

              {/* Call-to-action actions */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
              >
                <Link 
                  to="/login" 
                  className="h-12 px-8 inline-flex items-center justify-center rounded-2xl bg-[#141414] text-white text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-all gap-2 shadow-[4px_4px_0px_#BEF264]"
                >
                  I'm a Creator
                  <ArrowRight className="w-4 h-4 text-[#BEF264]" />
                </Link>
                <Link 
                  to="/login" 
                  className="h-12 px-8 inline-flex items-center justify-center rounded-2xl bg-white text-[#141414] border-2 border-[#141414] text-xs font-black uppercase tracking-wider hover:bg-gray-50 transition-all shadow-[4px_4px_0px_rgba(20,20,20,0.15)]"
                >
                  I'm a Brand
                </Link>
              </motion.div>

              {/* Small interactive cute character float */}
              <div className="flex items-center gap-3 mt-12 pt-6 border-t border-[#141414]/5 w-full">
                <CuteCharacter size="sm" isWalking={true} className="shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-[#141414] leading-none">Meet Sparky</p>
                  <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase tracking-wider">CRYOVA'S INTERACTIVE GUIDE</p>
                </div>
              </div>
            </div>

            {/* HERO RIGHT PHYSICS CANVAS (The Antigravity Playground) */}
            <div className="lg:col-span-6 relative w-full h-[480px] sm:h-[550px] flex flex-col justify-between">
              
              {/* Outer decorative high-tech borders */}
              <div className="absolute inset-0 border-2 border-[#141414] rounded-3xl bg-white shadow-[12px_12px_0px_rgba(20,20,20,0.1)] z-0 pointer-events-none" />
              
              {/* Live Canvas simulation */}
              <div className="w-full h-full p-2 relative z-10 flex-grow">
                <AntigravityCanvas 
                  gravityValue={gravity}
                  bouncinessValue={bounciness}
                  mouseForceValue={mouseForce}
                  mouseModeValue={mouseMode}
                  className="w-full h-full"
                />
              </div>

              {/* INTEGRATED PHYSICS CONTROL HUB PANEL (The "Movement" sandbox) */}
              <div className="bg-[#141414] border-t-2 border-[#141414] p-4 rounded-b-3xl text-white relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#BEF264] animate-spin-slow" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#BEF264] font-bold">Interactive Gravity Core Settings</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded text-[9px] font-mono text-gray-300">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    <span>ENGINE ACTIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  
                  {/* GRAVITY SLIDER */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-mono text-gray-300">
                      <span>Gravity / Floating</span>
                      <span className="text-[#BEF264] font-bold">{gravity === 0 ? "ZERO" : gravity < 0 ? "ANTIGRAVITY" : "DOWNWARD"}</span>
                    </div>
                    <input 
                      type="range" 
                      min="-0.6" 
                      max="0.4" 
                      step="0.05"
                      value={gravity} 
                      onChange={(e) => setGravity(parseFloat(e.target.value))}
                      className="w-full accent-[#BEF264] h-1 bg-white/20 rounded-lg cursor-pointer" 
                    />
                  </div>

                  {/* BOUNCINESS SLIDER */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-mono text-gray-300">
                      <span>Bounciness</span>
                      <span className="text-[#A855F7] font-bold">{Math.round(bounciness * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.2" 
                      max="1.0" 
                      step="0.05"
                      value={bounciness} 
                      onChange={(e) => setBounciness(parseFloat(e.target.value))}
                      className="w-full accent-[#A855F7] h-1 bg-white/20 rounded-lg cursor-pointer" 
                    />
                  </div>

                  {/* INTERACTIVE FORCE MODE */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-gray-300">Cursor Physics Interaction</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setMouseMode("repel")}
                        className={`flex-1 py-1 px-2 rounded font-mono text-[9px] font-bold transition-all border ${mouseMode === "repel" ? "bg-[#BEF264] text-[#141414] border-[#BEF264]" : "bg-white/5 text-gray-300 border-white/10"}`}
                      >
                        REPEL CURSOR
                      </button>
                      <button 
                        onClick={() => setMouseMode("attract")}
                        className={`flex-1 py-1 px-2 rounded font-mono text-[9px] font-bold transition-all border ${mouseMode === "attract" ? "bg-[#BEF264] text-[#141414] border-[#BEF264]" : "bg-white/5 text-gray-300 border-white/10"}`}
                      >
                        ATTRACT CURSOR
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* BRANDS INFINITE SCROLLING TICKER (MARQUEE) */}
        <section className="py-12 bg-white border-y-2 border-[#141414] overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 mb-4 flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-400 uppercase font-black">
            <span>TRUSTED BY LEADING BRANDS</span>
            <span>CRYOVA CAMPAIGNS</span>
          </div>

          <div className="flex overflow-hidden">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                repeat: Infinity, 
                duration: 25, 
                ease: "linear" 
              }}
              className="flex whitespace-nowrap gap-12 text-3xl font-black tracking-tighter text-gray-300"
            >
              {BRANDS.map((brand, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer hover:text-[#141414] transition-all">
                  <span className="inline-block w-3 h-3 bg-[#BEF264] rounded-full border border-black" />
                  <span className="font-extrabold uppercase">{brand.name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* BENTO GRID - OUR EXPERTISE */}
        <section id="expertise" className="py-24 bg-[#0A0A0A] text-white relative overflow-hidden px-6">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#A855F7]/5 rounded-full filter blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[#BEF264] text-[10px] font-mono uppercase tracking-widest mb-4">
                  <Flame className="w-3.5 h-3.5 text-[#BEF264] fill-current" />
                  <span>Interactive Capabilities</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
                  Our Expertise
                </h2>
              </div>
              <p className="text-sm sm:text-base text-gray-400 max-w-md leading-relaxed font-medium">
                Transform beautiful ideas to reality by combining predictive matchmaking with professional UGC production loops.
              </p>
            </div>

            {/* BENTO GRID */}
            <div className="grid md:grid-cols-12 gap-8">
              
              {/* CARD 1: CREATOR INTELLIGENCE */}
              <div className="md:col-span-4 h-full">
                <TiltCard 
                  glowColor="rgba(190, 242, 100, 0.12)"
                  className="bg-[#111] border border-white/5 rounded-3xl p-8 flex flex-col justify-between h-full hover:border-[#BEF264]/40"
                >
                  <div>
                    {/* Live Badge "AI Matching" */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="px-3 py-1 bg-[#BEF264]/10 border border-[#BEF264]/30 rounded-full text-[#BEF264] text-[9px] font-mono uppercase font-black tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BEF264] animate-ping" />
                        AI Matching with AI
                      </div>
                      <span className="text-xs font-mono text-gray-500">01 / 03</span>
                    </div>

                    {/* Interactive Graphics Content */}
                    <div className="h-44 w-full bg-[#050505] rounded-2xl border border-white/5 mb-8 p-4 relative overflow-hidden flex flex-col justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      {/* Interactive nodes diagram */}
                      <div className="flex items-center justify-between relative z-10">
                        {/* Brand node */}
                        <div className="w-12 h-12 bg-white/5 border border-white/15 rounded-xl flex items-center justify-center text-[#BEF264] shadow-inner font-black text-[10px]">
                          BRAND
                        </div>
                        
                        {/* Pulsing lightning line */}
                        <div className="flex-grow h-[2px] bg-dashed relative mx-2">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#BEF264] to-[#A855F7] opacity-20" />
                          <motion.div 
                            animate={{ x: ["0%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="absolute w-4 h-[2px] bg-[#BEF264] shadow-[0_0_8px_#BEF264]"
                          />
                        </div>

                        {/* Middle intelligence core node */}
                        <div className="w-14 h-14 rounded-full bg-[#141414] border-2 border-[#BEF264] flex items-center justify-center text-white font-black text-[9px] relative shadow-lg">
                          <div className="absolute inset-1 rounded-full border border-dashed border-white/20 animate-spin-slow" />
                          CRYOVA
                        </div>

                        {/* Pulsing lightning line 2 */}
                        <div className="flex-grow h-[2px] bg-dashed relative mx-2">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#A855F7] to-pink-500 opacity-20" />
                          <motion.div 
                            animate={{ x: ["0%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }}
                            className="absolute w-4 h-[2px] bg-[#A855F7] shadow-[0_0_8px_#A855F7]"
                          />
                        </div>

                        {/* Creator Node */}
                        <div className="w-12 h-12 bg-white/5 border border-white/15 rounded-xl flex items-center justify-center text-[#A855F7] font-black text-[10px]">
                          CREATOR
                        </div>
                      </div>

                      {/* Matching HUD metrics */}
                      <div className="flex justify-between items-center mt-6 text-[8px] font-mono text-gray-500 px-1 relative z-10">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-[#BEF264]" /> Style match: 98.7%
                        </span>
                        <span className="text-[#BEF264] font-black uppercase">Core Connected</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#BEF264]" />
                      Creator Intelligence
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-medium">
                      People, analyzing and economic analyses delivery engagement and creative content aligning indicators in real-time.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-[#BEF264]">
                    <span>LEARN ABOUT MATCHING</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </TiltCard>
              </div>

              {/* CARD 2: CONVERSION UGC PRODUCTION */}
              <div className="md:col-span-4 h-full">
                <TiltCard 
                  glowColor="rgba(168, 85, 247, 0.12)"
                  className="bg-[#111] border border-white/5 rounded-3xl p-8 flex flex-col justify-between h-full hover:border-[#A855F7]/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="px-3 py-1 bg-[#A855F7]/10 border border-[#A855F7]/30 rounded-full text-[#A855F7] text-[9px] font-mono uppercase font-black tracking-widest flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-[#A855F7]" />
                        Agile Camera
                      </div>
                      <span className="text-xs font-mono text-gray-500">02 / 03</span>
                    </div>

                    {/* Camera view finder mock overlay */}
                    <div className="h-44 w-full bg-[#050505] rounded-2xl border border-white/5 mb-8 overflow-hidden relative flex items-center justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop" 
                        alt="UGC Video Recording" 
                        className="w-full h-full object-cover opacity-60 filter grayscale contrast-125"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Grid crosshair overlay */}
                      <div className="absolute inset-2 border border-white/10 flex items-center justify-center pointer-events-none">
                        <div className="w-4 h-4 border-t border-l border-white/30 absolute top-0 left-0" />
                        <div className="w-4 h-4 border-t border-r border-white/30 absolute top-0 right-0" />
                        <div className="w-4 h-4 border-b border-l border-white/30 absolute bottom-0 left-0" />
                        <div className="w-4 h-4 border-b border-r border-white/30 absolute bottom-0 right-0" />
                        
                        {/* Blinking Red REC dot */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-[7px] font-mono">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                          <span>00:02:14 REC</span>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-[#A855F7]/80 flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer hover:scale-110 transition-all">
                          <Play className="w-4 h-4 fill-current text-white translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#A855F7]" />
                      Conversion UGC Production
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-medium">
                      An agile creation set-up with creator holdings based on high-performing mobile videos matching modern social criteria.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-[#A855F7]">
                    <span>EXPLORE PRODUCTION STEPS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </TiltCard>
              </div>

              {/* CARD 3: COMMUNITY MANAGEMENT */}
              <div className="md:col-span-4 h-full">
                <TiltCard 
                  glowColor="rgba(59, 130, 246, 0.12)"
                  className="bg-[#111] border border-white/5 rounded-3xl p-8 flex flex-col justify-between h-full hover:border-blue-500/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-[9px] font-mono uppercase font-black tracking-widest flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        Community Network
                      </div>
                      <span className="text-xs font-mono text-gray-500">03 / 03</span>
                    </div>

                    {/* Community web-connection map */}
                    <div className="h-44 w-full bg-[#050505] rounded-2xl border border-white/5 mb-8 p-4 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:20px_20px]" />
                      
                      {/* Connecting glowing node lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="40" y1="40" x2="120" y2="80" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" />
                        <line x1="220" y1="40" x2="120" y2="80" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" />
                        <line x1="120" y1="80" x2="80" y2="140" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" />
                        <line x1="120" y1="80" x2="160" y2="140" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1" />
                      </svg>

                      {/* Nodes */}
                      <div className="absolute top-6 left-10 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
                      <div className="absolute top-6 right-16 w-4 h-4 bg-[#BEF264] rounded-full shadow-[0_0_8px_#BEF264]" />
                      <div className="absolute bottom-8 left-16 w-3 h-3 bg-[#A855F7] rounded-full shadow-[0_0_8px_#A855F7]" />
                      <div className="absolute bottom-6 right-20 w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]" />
                      
                      {/* Central Hub */}
                      <div className="relative z-10 w-16 h-16 rounded-full bg-[#141414] border border-blue-500/50 flex flex-col items-center justify-center text-center">
                        <span className="text-[12px] font-black text-white">4.8k+</span>
                        <span className="text-[6px] font-mono text-gray-500 uppercase tracking-wider">CREATORS</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      Community Management
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-medium">
                      Build strategy into micro-relations, audience communication patterns and organic community metrics that sustain.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-blue-400">
                    <span>LAUNCH COMMUNITY ENGINE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </TiltCard>
              </div>

            </div>
          </div>
        </section>

        {/* CREATORS HIGHLIGHT GALLERY & MOVEMENT (Tilting Grid cards) */}
        <section id="creators" className="py-24 bg-white px-6">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-16">
              <span className="text-[#A855F7] font-mono text-xs tracking-widest uppercase font-black">CHOOSE YOUR VIBE</span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#141414] mt-2">
                Our Elite Creators Network
              </h2>
              <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto mt-4 font-medium">
                Sifted, curated, and fully integrated. Hover or click to explore dynamic engagement rates.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Creator Card 1 */}
              <TiltCard className="bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl overflow-hidden p-6 hover:shadow-[8px_8px_0px_#141414] hover:border-[#141414] transition-all">
                <div className="relative rounded-2xl overflow-hidden h-64 mb-6 group">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" 
                    alt="Sophia Chen" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#141414] text-[#BEF264] rounded-full text-[9px] font-mono uppercase font-black tracking-wider">
                    ★ BEAUTY GURU
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-lg text-[#141414]">Sophia Chen</h4>
                    <p className="text-xs text-gray-400 mt-0.5">UGC & Lifestyle Vlogs</p>
                  </div>
                  <div className="bg-[#BEF264]/20 border border-[#BEF264] rounded-lg px-2 py-1 text-right">
                    <span className="block text-[8px] font-mono text-[#141414] font-black leading-none uppercase">ENGAGEMENT</span>
                    <span className="text-xs font-black text-[#141414] leading-none mt-1 inline-block">7.4%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#141414]/5 flex justify-between items-center text-[10px] font-mono text-gray-500">
                  <span>940k Followers</span>
                  <span className="text-[#A855F7] font-black">Active</span>
                </div>
              </TiltCard>

              {/* Creator Card 2 */}
              <TiltCard className="bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl overflow-hidden p-6 hover:shadow-[8px_8px_0px_#141414] hover:border-[#141414] transition-all">
                <div className="relative rounded-2xl overflow-hidden h-64 mb-6 group">
                  <img 
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop" 
                    alt="Tyler Marcus" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#141414] text-[#A855F7] rounded-full text-[9px] font-mono uppercase font-black tracking-wider">
                    ★ GAMING STREAMER
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-lg text-[#141414]">Tyler Marcus</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Custom PC & Console Reviews</p>
                  </div>
                  <div className="bg-[#A855F7]/10 border border-[#A855F7] rounded-lg px-2 py-1 text-right">
                    <span className="block text-[8px] font-mono text-[#141414] font-black leading-none uppercase">ENGAGEMENT</span>
                    <span className="text-xs font-black text-[#141414] leading-none mt-1 inline-block">9.1%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#141414]/5 flex justify-between items-center text-[10px] font-mono text-gray-500">
                  <span>1.2M Followers</span>
                  <span className="text-[#A855F7] font-black">Active</span>
                </div>
              </TiltCard>

              {/* Creator Card 3 */}
              <TiltCard className="bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl overflow-hidden p-6 hover:shadow-[8px_8px_0px_#141414] hover:border-[#141414] transition-all">
                <div className="relative rounded-2xl overflow-hidden h-64 mb-6 group">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" 
                    alt="Jordan Rivera" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#141414] text-[#BEF264] rounded-full text-[9px] font-mono uppercase font-black tracking-wider">
                    ★ TECH GEEK
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-lg text-[#141414]">Jordan Rivera</h4>
                    <p className="text-xs text-gray-400 mt-0.5">High-end Unboxings & Setups</p>
                  </div>
                  <div className="bg-[#BEF264]/20 border border-[#BEF264] rounded-lg px-2 py-1 text-right">
                    <span className="block text-[8px] font-mono text-[#141414] font-black leading-none uppercase">ENGAGEMENT</span>
                    <span className="text-xs font-black text-[#141414] leading-none mt-1 inline-block">6.8%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#141414]/5 flex justify-between items-center text-[10px] font-mono text-gray-500">
                  <span>540k Followers</span>
                  <span className="text-[#A855F7] font-black">Active</span>
                </div>
              </TiltCard>

              {/* Creator Card 4 */}
              <TiltCard className="bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl overflow-hidden p-6 hover:shadow-[8px_8px_0px_#141414] hover:border-[#141414] transition-all">
                <div className="relative rounded-2xl overflow-hidden h-64 mb-6 group">
                  <img 
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop" 
                    alt="Maya Lin" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#141414] text-rose-400 rounded-full text-[9px] font-mono uppercase font-black tracking-wider">
                    ★ FASHION DESIGNER
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-lg text-[#141414]">Maya Lin</h4>
                    <p className="text-xs text-gray-400 mt-0.5">High Street & Sustainable OOTD</p>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500 rounded-lg px-2 py-1 text-right">
                    <span className="block text-[8px] font-mono text-[#141414] font-black leading-none uppercase">ENGAGEMENT</span>
                    <span className="text-xs font-black text-[#141414] leading-none mt-1 inline-block">8.3%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#141414]/5 flex justify-between items-center text-[10px] font-mono text-gray-500">
                  <span>880k Followers</span>
                  <span className="text-green-500 font-black">Online</span>
                </div>
              </TiltCard>

            </div>
          </div>
        </section>

        {/* INTERACTIVE STAMP & MISSION ACCENTS */}
        <section className="py-16 bg-[#BEF264] text-[#141414] border-y-2 border-[#141414] relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[#000]/3 opacity-5 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-12 items-center gap-12 relative z-10">
            
            <div className="md:col-span-8 text-left">
              <span className="text-xs font-mono tracking-widest font-black uppercase text-[#141414]/70">Verified Creator Badge</span>
              <h3 className="text-3xl sm:text-5xl font-black tracking-tighter text-[#141414] mt-2 leading-[1.05]">
                TO EMPOWER REAL CONNECTIONS!
              </h3>
              <p className="text-[#141414]/75 text-sm sm:text-base font-semibold mt-4 max-w-xl leading-relaxed">
                We amplify your brand with authentic content loops sourced directly from a diverse, qualified content community. Tap into the ultimate creator matrix.
              </p>
            </div>

            {/* ROTATING BADGE STAMP */}
            <div className="md:col-span-4 flex justify-center items-center relative">
              <motion.div 
                whileHover={{ scale: 1.15, rotate: 10 }}
                className="relative w-40 h-40 flex items-center justify-center cursor-pointer"
              >
                {/* SVG Rotating stamp text */}
                <motion.svg 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className="absolute w-full h-full"
                  viewBox="0 0 100 100"
                >
                  <path 
                    id="textPath" 
                    d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" 
                    fill="none" 
                  />
                  <text className="text-[7.5px] font-mono uppercase tracking-[2px] font-black fill-[#141414]">
                    <textPath href="#textPath" startOffset="0%">
                      NETWORKING CREATOR LIFE ● CRYOVA SPARK ●
                    </textPath>
                  </text>
                </motion.svg>

                {/* Central Stamp sticker */}
                <div className="w-20 h-20 rounded-full bg-[#141414] border-2 border-dashed border-[#BEF264] flex items-center justify-center text-center shadow-lg relative">
                  <div className="absolute inset-1 rounded-full border border-[#BEF264]/20 animate-pulse" />
                  <Sparkles className="w-8 h-8 text-[#BEF264] fill-current animate-spin-slow" />
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* EVERYTHING CREATORS AND BRANDS NEED */}
        <section className="py-24 bg-white px-6 border-t border-gray-150 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#A855F7]/5 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#BEF264]/10 rounded-full filter blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="text-[#A855F7] font-mono text-xs tracking-widest uppercase font-black bg-[#A855F7]/10 px-3.5 py-1.5 rounded-full">
                UNIFIED PLATFORM
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#141414] mt-4">
                Everything creators and brands need
              </h2>
              <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto mt-4 font-semibold">
                A complete ecosystem with powerful network effects.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <TiltCard className="p-8 bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl hover:border-[#141414] hover:shadow-[8px_8px_0px_#141414] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A855F7] to-pink-500 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-black text-lg text-[#141414] mb-3">Portfolio & CRYOVA ID</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    Your ultimate Web3-ready cryptographic identity and visual proof-of-work showcase.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-[#A855F7] font-black">
                  <span>SECURE YOUR ID</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </TiltCard>

              {/* Card 2 */}
              <TiltCard className="p-8 bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl hover:border-[#141414] hover:shadow-[8px_8px_0px_#141414] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BEF264] to-emerald-500 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-black text-lg text-[#141414] mb-3">AI Creator Agent</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    An autonomous representative optimizing your matches, contract negotiations, and posting cadence 24/7.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-emerald-600 font-black">
                  <span>MEET YOUR AGENT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </TiltCard>

              {/* Card 3 */}
              <TiltCard className="p-8 bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl hover:border-[#141414] hover:shadow-[8px_8px_0px_#141414] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-[#A855F7] text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-black text-lg text-[#141414] mb-3">CRYOVA Score</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    Your proprietary network reputation rating, blending audience engagement, completion rate, and speed.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-blue-600 font-black">
                  <span>CHECK SCORE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </TiltCard>

              {/* Card 4 */}
              <TiltCard className="p-8 bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl hover:border-[#141414] hover:shadow-[8px_8px_0px_#141414] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-black text-lg text-[#141414] mb-3">Campaign Marketplace</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    A transparent pool of high-paying brand campaigns, curated for your specific visual style.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-rose-600 font-black">
                  <span>BROWSE JOBS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </TiltCard>

              {/* Card 5 */}
              <TiltCard className="p-8 bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl hover:border-[#141414] hover:shadow-[8px_8px_0px_#141414] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#141414] to-gray-600 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-black text-lg text-[#141414] mb-3">Creator Studio</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    Advanced UGC editing suite, raw asset hosting, analytics, and direct-to-social scheduling tools.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-gray-700 font-black">
                  <span>LAUNCH STUDIO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </TiltCard>

              {/* Card 6 */}
              <TiltCard className="p-8 bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl hover:border-[#141414] hover:shadow-[8px_8px_0px_#141414] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-black text-lg text-[#141414] mb-3">Communities</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    Vibe-matched creator collectives, resource sharing pools, and exclusive regional creator houses.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-teal-600 font-black">
                  <span>JOIN GROUPS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </TiltCard>

              {/* Card 7 */}
              <TiltCard className="p-8 bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl hover:border-[#141414] hover:shadow-[8px_8px_0px_#141414] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A855F7] to-red-500 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-black text-lg text-[#141414] mb-3">Viral Growth Engine</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    Algorithmic feedback loops and AI trend prediction frameworks to maximize your organic distribution.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-red-600 font-black">
                  <span>SCALE DISTRIBUTION</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </TiltCard>

              {/* Card 8 */}
              <TiltCard className="p-8 bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl hover:border-[#141414] hover:shadow-[8px_8px_0px_#141414] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-[#BEF264] text-[#141414] flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-black text-lg text-[#141414] mb-3">Referral Program</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    Introduce outstanding creators or brands and secure 2% recurring revenue share from their deals.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-emerald-600 font-black">
                  <span>INVITE FRIENDS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </TiltCard>

              {/* Card 9 */}
              <TiltCard className="p-8 bg-[#FAFAFA] border-2 border-[#141414]/5 rounded-3xl hover:border-[#141414] hover:shadow-[8px_8px_0px_#141414] transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-black text-lg text-[#141414] mb-3">Creator Challenges</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-semibold">
                    Weekly style prompts and sprint missions backed by top brands to win cash and exclusive drops.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-indigo-600 font-black">
                  <span>ENTER CHALLENGES</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* INTERACTIVE AI PORTFOLIO GENERATOR SANDBOX */}
        <section className="py-24 bg-[#0A0A0A] text-white relative overflow-hidden border-t-2 border-[#141414] px-6">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none opacity-50" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[#BEF264]/5 rounded-full filter blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left explanation Column */}
              <div className="lg:col-span-5 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[#BEF264] text-[10px] font-mono uppercase tracking-widest mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#BEF264]" />
                  <span>AI Portfolios & Optimization</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Instant AI Portfolio Optimizer
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mt-6 leading-relaxed font-medium">
                  Experience our predictive AI engine. Select your creator category, supply a goal, and generate an instantly optimized campaign proposal structure, high-conversion visual aesthetic, and simulated viral score.
                </p>

                {/* Simulated categories */}
                <div className="mt-8 space-y-3">
                  <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black">
                    Select Creator Vibe / Focus:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["Beauty & Makeup", "Tech Reviews", "Fitness & Athletics", "Street Fashion"].map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSimulateResult(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${selectedCategory === cat ? "bg-[#BEF264] text-[#141414] border-[#BEF264]" : "bg-white/5 text-gray-300 border-white/10 hover:border-white/25"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest font-black mb-2">
                    Enter Campaign Goal or Theme:
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={sandboxPrompt}
                      onChange={(e) => setSandboxPrompt(e.target.value)}
                      placeholder="e.g., Launching a matte lipstick campaign"
                      className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#BEF264] outline-none text-xs text-white font-medium placeholder-gray-600 transition-all"
                    />
                    <button 
                      onClick={handleGenerateSandbox}
                      disabled={isGeneratingSandbox}
                      className="h-12 px-6 bg-[#BEF264] hover:bg-[#d6ff7c] disabled:bg-gray-700 text-[#141414] font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center gap-2 shrink-0"
                    >
                      {isGeneratingSandbox ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "OPTIMIZE"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Simulation Dashboard Column */}
              <div className="lg:col-span-7">
                <div className="bg-[#111] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden min-h-[420px] flex flex-col justify-between shadow-2xl">
                  {/* Decorative glowing gradient blur */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#A855F7]/15 rounded-full filter blur-2xl pointer-events-none" />
                  
                  {/* Window Bar */}
                  <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500/80" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <span className="w-3 h-3 rounded-full bg-green-500/80" />
                      <span className="text-[10px] font-mono text-gray-500 ml-2 uppercase tracking-widest">CRYOVA_AI_STUDIO_V1.0</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-[#BEF264] uppercase font-black tracking-widest font-bold">
                      Live Sandbox
                    </span>
                  </div>

                  {!simulateResult ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center py-12 px-4">
                      <Sparkles className="w-12 h-12 text-[#BEF264] fill-current animate-pulse mb-4" />
                      <h4 className="font-black uppercase text-sm tracking-wide mb-2">Awaiting Optimization Inputs</h4>
                      <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                        Choose a category on the left, type an objectives prompt, and hit the **OPTIMIZE** button to watch the live simulation work.
                      </p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 flex-grow flex flex-col justify-between"
                    >
                      {/* Grid Header & CRYOVA Score Indicator */}
                      <div className="grid sm:grid-cols-3 gap-4 items-center">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <span className="block text-[8px] font-mono text-gray-500 uppercase font-black">CRYOVA Match Score</span>
                          <span className="text-xl font-black text-[#BEF264] mt-1 inline-block">{simulateResult.matchScore}</span>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <span className="block text-[8px] font-mono text-gray-500 uppercase font-black">Est. Engagement Rate</span>
                          <span className="text-xl font-black text-[#A855F7] mt-1 inline-block">{simulateResult.engagement}</span>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <span className="block text-[8px] font-mono text-gray-500 uppercase font-black">Projected Viral Odds</span>
                          <span className="text-xl font-black text-rose-400 mt-1 inline-block">{simulateResult.viralOdds}</span>
                        </div>
                      </div>

                      {/* Mock Portfolio Feed */}
                      <div className="p-5 bg-[#050505] rounded-2xl border border-white/5 grid sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-mono text-gray-500 uppercase font-black block mb-2">Simulated Visual Vibe</span>
                          <div className="relative rounded-xl overflow-hidden h-32 border border-white/10">
                            <img 
                              src={simulateResult.image} 
                              alt="Vibe preview" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2.5">
                              <span className="text-[9px] font-mono font-black text-[#BEF264] uppercase tracking-wider">
                                {selectedCategory} Vibe
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-mono text-gray-500 uppercase font-black block mb-1">Optimized Narrative Angle</span>
                            <p className="text-xs text-gray-300 leading-relaxed font-semibold italic">
                              "{simulateResult.narrative}"
                            </p>
                          </div>
                          
                          <div className="mt-3">
                            <span className="text-[9px] font-mono text-gray-500 uppercase font-black block mb-1">Target Brands</span>
                            <div className="flex flex-wrap gap-1">
                              {simulateResult.targetBrands.map((b: string) => (
                                <span key={b} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-gray-400 font-bold">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Matching hashtags and viral keywords */}
                      <div className="flex justify-between items-center bg-[#BEF264]/10 border border-[#BEF264]/20 p-3 rounded-xl">
                        <span className="text-[9px] font-mono text-[#BEF264] uppercase font-black">Recommended AI Tags:</span>
                        <div className="flex gap-1.5">
                          {simulateResult.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] font-mono text-white font-bold bg-white/5 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Sandbox Footer Info */}
                  <div className="text-[9px] font-mono text-gray-500 flex justify-between border-t border-white/5 pt-4 mt-4">
                    <span>*Calculated based on 250+ historical campaign metrics.</span>
                    <span className="text-emerald-500 font-bold uppercase">Ready to deploy</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FORM SECTION (SAVING TO FIRESTORE LEADS) */}
        <section id="brands" className="py-24 bg-[#FAFAFA] px-6 relative">
          <div className="max-w-4xl mx-auto border-2 border-[#141414] rounded-3xl bg-white p-8 md:p-12 shadow-[12px_12px_0px_#141414] relative z-10">
            
            <div className="text-center mb-10">
              <span className="text-[#A855F7] font-mono text-xs tracking-widest uppercase font-black">GET STARTED WITH CRYOVA</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#141414] mt-2">
                Join the UGC Creator Magic
              </h2>
              <p className="text-gray-500 text-sm mt-3 font-semibold">
                Submit an application to secure your invite-only spot on the network!
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!submitSuccess ? (
                <motion.form 
                  key="lead-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleLeadSubmit} 
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[#141414] uppercase tracking-wide flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" /> Name / Brand Title
                      </label>
                      <input 
                        type="text" 
                        required
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="e.g. Sophia Carter"
                        className="h-12 px-4 rounded-xl border-2 border-[#141414]/10 focus:border-[#141414] outline-none text-sm transition-all font-medium"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[#141414] uppercase tracking-wide flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> Contact Email
                      </label>
                      <input 
                        type="email" 
                        required
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        placeholder="e.g. sophia@cryova.com"
                        className="h-12 px-4 rounded-xl border-2 border-[#141414]/10 focus:border-[#141414] outline-none text-sm transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Role alignment selection */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#141414] uppercase tracking-wide flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-gray-400" /> I want to join as a:
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => setLeadRole("creator")}
                        className={`h-12 rounded-xl font-bold text-xs uppercase tracking-wider border-2 transition-all flex items-center justify-center gap-2 ${leadRole === "creator" ? "bg-[#BEF264] text-[#141414] border-[#141414]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}
                      >
                        <Zap className="w-4 h-4" /> Creator / UGC Artist
                      </button>
                      <button 
                        type="button"
                        onClick={() => setLeadRole("brand")}
                        className={`h-12 rounded-xl font-bold text-xs uppercase tracking-wider border-2 transition-all flex items-center justify-center gap-2 ${leadRole === "brand" ? "bg-[#BEF264] text-[#141414] border-[#141414]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}
                      >
                        <Briefcase className="w-4 h-4" /> Brand / Agency
                      </button>
                    </div>
                  </div>

                  {/* Message / Objectives */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#141414] uppercase tracking-wide flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" /> Pitch / Core Objectives
                    </label>
                    <textarea 
                      rows={3}
                      value={leadMessage}
                      onChange={(e) => setLeadMessage(e.target.value)}
                      placeholder="Briefly tell us what you'd love to achieve with UGC campaigns or partnerships..."
                      className="p-4 rounded-xl border-2 border-[#141414]/10 focus:border-[#141414] outline-none text-sm transition-all font-medium resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 inline-flex items-center justify-center rounded-xl bg-[#141414] text-white font-black text-xs uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all gap-2 shadow-[4px_4px_0px_#BEF264]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#BEF264]" />
                        REGISTERING LEAD...
                      </>
                    ) : (
                      <>
                        SUBMIT NETWORK APPLICATION
                        <ArrowRight className="w-4 h-4 text-[#BEF264]" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div 
                  key="form-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10 flex flex-col items-center justify-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-md">
                    <CheckCircle className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#141414]">You are on the list!</h3>
                  <p className="text-gray-500 text-sm max-w-md font-medium">
                    We've registered your application successfully. Our team will review your portfolio or brand profile and reach out via email shortly!
                  </p>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="text-xs font-bold text-[#A855F7] uppercase tracking-wide hover:underline mt-4"
                  >
                    SUBMIT ANOTHER APPLICATION
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>

        {/* FAQS SECTION WITH ACCORDION MOTIONS */}
        <section id="faqs" className="py-24 bg-white border-t border-[#141414]/5 px-6">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-16">
              <span className="text-[#A855F7] font-mono text-xs tracking-widest uppercase font-black">QUESTIONS? WE HAVE SOLUTIONS</span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#141414] mt-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <div 
                    key={index} 
                    className={`border-2 rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? "border-[#141414] bg-[#FAFAFA]" : "border-[#141414]/5 bg-white hover:border-[#141414]/20"}`}
                  >
                    <button 
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="font-black text-base sm:text-lg text-[#141414]">{faq.question}</span>
                      <motion.div 
                        animate={{ rotate: isExpanded ? 45 : 0 }}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#141414] font-black cursor-pointer shadow-inner"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 pt-1 text-gray-500 font-medium text-sm sm:text-base leading-relaxed border-t border-dashed border-[#141414]/10">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#141414] text-white border-t-2 border-[#141414] py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center">
          
          <div className="md:col-span-6 text-left">
            <span className="font-black text-2xl tracking-tighter leading-none text-white flex items-center gap-2.5">
              <CryovaLogoSymbol className="w-8 h-8 text-[#BEF264]" />
              CRYOVA
            </span>
            <p className="text-gray-400 text-sm mt-3 max-w-sm leading-relaxed font-medium">
              Connecting elite UGC creators with world-class brands. Powered by predictive matching frameworks and active gravity engine simulations.
            </p>
          </div>

          <div className="md:col-span-6 flex flex-col md:items-end text-left md:text-right gap-6">
            <div className="flex flex-wrap gap-6 text-xs font-mono tracking-wider text-gray-400">
              <a href="#creators" className="hover:text-white uppercase">Creators</a>
              <a href="#brands" className="hover:text-white uppercase">Brands</a>
              <a href="#expertise" className="hover:text-white uppercase">Expertise</a>
              <a href="#faqs" className="hover:text-white uppercase">Faq</a>
            </div>
            
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-4">
              © {new Date().getFullYear()} CRYOVA INC. ALL SPARK RIGHTS RESERVED.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
