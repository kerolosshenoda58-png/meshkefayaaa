import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Loader2, 
  CheckSquare, 
  BarChart3, 
  Users, 
  DollarSign, 
  FileText, 
  Maximize2, 
  ArrowRight, 
  RefreshCw, 
  User, 
  CheckCircle2, 
  Plus, 
  X, 
  Calendar, 
  Flame, 
  Clock, 
  Play, 
  Check, 
  HelpCircle,
  TrendingUp,
  Sliders,
  ChevronRight,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid 
} from "recharts";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  widget?: Widget | null;
}

interface Widget {
  type: "brief" | "chart" | "checklist" | "creators" | "budget";
  title: string;
  data: any;
}

export default function A2UIWorkspace() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am the **CRYOVA Agent-to-UI (A2UI)** assistant. I can assemble visual layouts, campaign metrics, budgets, milestones, and creator recommendation grids in real time as we discuss.\n\nTry asking me something like:\n* \"Recommend some beauty creators for a organic lip gloss line\"\n* \"Show me a launch budget split for a $5,000 campaign\"\n* \"Generate a milestone checklist for our next UGC video shoot\"\n* \"Draft a creative brief for a new athletic wear campaign\"",
      timestamp: new Date(),
      widget: null
    }
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeWidget, setActiveWidget] = useState<Widget | null>(null);
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt shortcuts
  const suggestions = [
    { text: "Curate Skincare Creators", prompt: "Recommend some skincare creators for a minimalist organic skin brand." },
    { text: "UGC Shoot Checklist", prompt: "Generate an interactive milestone checklist for a short-form vertical video shoot." },
    { text: "Campaign Budget Split", prompt: "Show me a budget allocation chart for a $15,000 TikTok campaign." },
    { text: "UGC Brief Template", prompt: "Draft a dynamic brand brief for a luxury smartwatch campaign." }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    // Build history matching API expectations
    const payloadMessages = messages.concat(userMsg).map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const response = await fetch("/api/gemini/a2ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          role: "creator"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to communicate with Agent-to-UI engine");
      }

      const resJson = await response.json();
      
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: resJson.textResponse || "Here is the compiled visual tool for your request.",
        timestamp: new Date(),
        widget: resJson.widget
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      if (resJson.widget) {
        setActiveWidget(resJson.widget);
        toast.success(`Dynamic UI component loaded: ${resJson.widget.title}`);
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong in the Agent-to-UI interaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#FAFAFA] overflow-hidden w-full h-full">
      
      {/* LEFT COLUMN: Chat Stream Workspace */}
      <div className="lg:w-[40%] flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden shrink-0">
        
        {/* Chat Workspace Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-black text-[#BEF264] flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-[#BEF264]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-[#141414]">CRYOVA A2UI Engine</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Assembly Mode
              </p>
            </div>
          </div>
          
          {activeWidget && (
            <button 
              onClick={() => setActiveWidget(null)}
              className="lg:hidden px-3 py-1.5 bg-black text-[#BEF264] rounded-lg text-[9px] font-black uppercase tracking-widest"
            >
              View UI Widget ({activeWidget.type})
            </button>
          )}
        </div>

        {/* Chat History Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm font-bold text-xs ${
                  msg.role === "user" 
                    ? "bg-[#141414] text-[#BEF264]" 
                    : "bg-blue-50 text-blue-600 border border-blue-100"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-1.5">
                  <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#141414] text-white"
                      : "bg-gray-50 text-gray-800 border border-gray-150"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Inline Indicator if widget was compiled */}
                    {msg.widget && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dynamic Visual Compiled
                        </span>
                        <button
                          onClick={() => {
                            if (msg.widget) {
                              setActiveWidget(msg.widget);
                              toast.info(`Switched stage to: ${msg.widget.title}`);
                            }
                          }}
                          className="px-2.5 py-1 bg-white text-gray-800 hover:bg-gray-100 rounded-lg text-[9px] font-bold border border-gray-200 transition-all shadow-sm"
                        >
                          Mount to Stage &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <span className={`text-[9px] text-gray-400 font-bold tracking-wider uppercase block ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs text-gray-400 font-black tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" /> Assembling Layout Components...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Shortcuts */}
        <div className="p-3 bg-gray-50/50 border-t border-gray-100">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2 px-2">Prompt Suggestions</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s.prompt)}
                className="px-3 py-1.5 bg-white hover:bg-black hover:text-white text-gray-600 border border-gray-200 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all shadow-sm shrink-0"
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>

        {/* Input Control Box */}
        <div className="p-4 bg-white border-t border-gray-150">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type message to assemble interfaces..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-3 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* RIGHT COLUMN: A2UI Stage Assembly Dashboard */}
      <div className="flex-1 bg-gray-50/50 p-6 flex flex-col h-full overflow-y-auto">
        
        {/* Stage Header */}
        <div className="flex items-center justify-between mb-6 shrink-0 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> A2UI Live Assembly Stage
            </h2>
            <p className="text-lg font-black text-[#141414] uppercase mt-0.5">
              {activeWidget ? activeWidget.title : "Assemble Interactive Interfaces"}
            </p>
          </div>

          {activeWidget && (
            <button 
              onClick={() => {
                setActiveWidget(null);
                toast.info("Cleared the current active visual stage.");
              }}
              className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-black rounded-lg transition-all shadow-sm"
              title="Clear Active Stage"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Display Components conditionally */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!activeWidget ? (
              /* EMPTY STAGE PLACEHOLDER CARD */
              <motion.div
                key="empty-stage"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-md mx-auto bg-white border border-dashed border-gray-300 rounded-3xl p-8 text-center shadow-lg"
              >
                <div className="w-16 h-16 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Maximize2 className="w-8 h-8" />
                </div>
                <h3 className="font-black text-sm text-[#141414] uppercase tracking-tight mb-2">Stage Container Locked</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium mb-6">
                  Ready to compile and present dynamic layouts on the fly. Ask the AI assistant to recommend creators, formulate briefs, design budgets, or build interactive trackers to activate the stage.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleSendMessage("Create a milestone checklist for brand approval.")}
                    className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-150 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-600 text-center transition-all"
                  >
                    Build Checklist
                  </button>
                  <button 
                    onClick={() => handleSendMessage("Show me a chart of best UGC categories.")}
                    className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-150 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-600 text-center transition-all"
                  >
                    Generate Chart
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ACTIVE WIDGET CONTAINER */
              <motion.div
                key={activeWidget.type}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full h-full max-w-4xl mx-auto flex flex-col justify-center"
              >
                {activeWidget.type === "brief" && <BriefWidget data={activeWidget.data} />}
                {activeWidget.type === "chart" && <ChartWidget data={activeWidget.data} />}
                {activeWidget.type === "checklist" && <ChecklistWidget data={activeWidget.data} />}
                {activeWidget.type === "creators" && <CreatorsWidget data={activeWidget.data} />}
                {activeWidget.type === "budget" && <BudgetWidget data={activeWidget.data} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}

/* ==========================================
   WIDGET A: DYNAMIC CREATIVE BRIEF COMPONENT
   ========================================== */
function BriefWidget({ data }: { data: any }) {
  const [brief, setBrief] = useState(data);

  useEffect(() => {
    setBrief(data);
  }, [data]);

  return (
    <div className="bg-white border border-gray-250 rounded-3xl p-6 md:p-8 shadow-xl max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-black text-sm uppercase tracking-wider text-gray-400">Campaign Creative Brief</h3>
        </div>
        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">
          Active Assembly
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
          <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase block mb-0.5">Campaign Name</span>
          <input 
            type="text" 
            value={brief.campaignName || ""}
            onChange={(e) => setBrief({ ...brief, campaignName: e.target.value })}
            className="text-xs font-bold text-[#141414] bg-transparent outline-none w-full"
          />
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
          <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase block mb-0.5">Timeline Duration</span>
          <input 
            type="text" 
            value={brief.timeline || "Next 4 Weeks"}
            onChange={(e) => setBrief({ ...brief, timeline: e.target.value })}
            className="text-xs font-bold text-[#141414] bg-transparent outline-none w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
          <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase block mb-0.5">Campaign Budget</span>
          <input 
            type="text" 
            value={brief.budget || ""}
            onChange={(e) => setBrief({ ...brief, budget: e.target.value })}
            className="text-xs font-bold text-[#141414] bg-transparent outline-none w-full"
          />
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
          <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase block mb-0.5">Target Audience Vibe</span>
          <input 
            type="text" 
            value={brief.targetAudience || ""}
            onChange={(e) => setBrief({ ...brief, targetAudience: e.target.value })}
            className="text-xs font-bold text-[#141414] bg-transparent outline-none w-full"
          />
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase block">Selected Channels</span>
        <div className="flex flex-wrap gap-2">
          {(brief.channels || ["Instagram Reels", "TikTok UGC", "YouTube Shorts"]).map((chan: string, i: number) => (
            <span key={i} className="px-3 py-1.5 bg-[#BEF264] text-black rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
              {chan}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase block">Core Deliverables</span>
        <div className="space-y-2">
          {(brief.deliverables || ["3x TikTok video clips with hook variations", "1x raw visual B-roll pack", "Product close-up thumbnail shot"]).map((del: string, i: number) => (
            <div key={i} className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-lg border border-gray-150">
              <Check className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-gray-700">{del}</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={() => toast.success("Brief details synced to workspace storage!")}
        className="w-full py-3 bg-[#BEF264] hover:bg-[#a5df48] text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
      >
        Sync & Lock Campaign Brief
      </button>
    </div>
  );
}

/* ==========================================
   WIDGET B: INTERACTIVE ANALYTICS CHARTS
   ========================================== */
function ChartWidget({ data }: { data: any }) {
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">(data.chartType || "bar");
  const items = data.items || [
    { name: "Beauty", value: 4500, secondaryValue: 7200 },
    { name: "Fitness", value: 3100, secondaryValue: 5100 },
    { name: "Tech", value: 5200, secondaryValue: 8400 },
    { name: "Fashion", value: 2800, secondaryValue: 4600 }
  ];

  const colors = ["#BEF264", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981"];

  return (
    <div className="bg-white border border-gray-250 rounded-3xl p-6 md:p-8 shadow-xl max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="font-black text-sm uppercase tracking-wider text-gray-400">Dynamic Campaign Analytics</h3>
        </div>
        
        {/* Style selection tabs */}
        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button 
            onClick={() => setChartType("bar")}
            className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${chartType === "bar" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"}`}
          >
            Bar
          </button>
          <button 
            onClick={() => setChartType("line")}
            className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${chartType === "line" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"}`}
          >
            Line
          </button>
          <button 
            onClick={() => setChartType("pie")}
            className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${chartType === "pie" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"}`}
          >
            Pie
          </button>
        </div>
      </div>

      {/* Chart container rendering */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={items}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#a0a0a0" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#a0a0a0" fontSize={10} fontWeight="bold" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#141414", borderRadius: "12px", border: "none" }} 
                labelStyle={{ color: "#BEF264", fontWeight: "bold" }}
              />
              <Bar dataKey="value" name="Creator Revenue" fill="#141414" radius={[4, 4, 0, 0]} />
              <Bar dataKey="secondaryValue" name="Total Ad Value" fill="#BEF264" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={items}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#a0a0a0" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#a0a0a0" fontSize={10} fontWeight="bold" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#141414", borderRadius: "12px", border: "none" }} 
                labelStyle={{ color: "#BEF264", fontWeight: "bold" }}
              />
              <Line type="monotone" dataKey="value" stroke="#141414" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="secondaryValue" stroke="#BEF264" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={items}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {items.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Calculated Median Engagement</p>
          <p className="text-xl font-black text-[#141414] mt-1 uppercase">8.42% <span className="text-emerald-500 text-xs font-bold font-sans">&uarr; 1.2%</span></p>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Estimated Return On Ad Spend</p>
          <p className="text-xl font-black text-[#141414] mt-1 uppercase">4.85X <span className="text-emerald-500 text-xs font-bold font-sans">&uarr; 0.4X</span></p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   WIDGET C: INTERACTIVE CAMPAIGN CHECKLIST
   ========================================== */
function ChecklistWidget({ data }: { data: any }) {
  const [items, setItems] = useState<any[]>(data.items || [
    { id: "1", label: "Finalize visual moodboard theme", completed: true, priority: "high" },
    { id: "2", label: "Connect creator metrics live spreadsheet", completed: false, priority: "medium" },
    { id: "3", label: "Draft TikTok hook script options", completed: false, priority: "high" },
    { id: "4", label: "Authorize campaign payout smart triggers", completed: false, priority: "low" }
  ]);
  const [newItemText, setNewItemText] = useState("");

  const handleToggle = (id: string) => {
    setItems(items.map(it => it.id === id ? { ...it, completed: !it.completed } : it));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem = {
      id: `task-${Date.now()}`,
      label: newItemText.trim(),
      completed: false,
      priority: "medium"
    };

    setItems([...items, newItem]);
    setNewItemText("");
    toast.success("Added new campaign milestone!");
  };

  const completedCount = items.filter(it => it.completed).length;
  const percentage = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="bg-white border border-gray-250 rounded-3xl p-6 md:p-8 shadow-xl max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-black text-sm uppercase tracking-wider text-gray-400">Interactive Milestones</h3>
        </div>
        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] font-black uppercase tracking-widest">
          {completedCount}/{items.length} Tasks
        </span>
      </div>

      {/* Progress visualizer */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
          <span>Completion Rate</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200">
          <div 
            className="bg-[#BEF264] h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Tasks checklist */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
              item.completed 
                ? "bg-gray-50 border-gray-200 opacity-60 line-through" 
                : "bg-white border-gray-200 hover:border-black shadow-sm"
            }`}
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
              item.completed 
                ? "bg-black border-black text-[#BEF264]" 
                : "bg-white border-gray-300"
            }`}>
              {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${item.completed ? "text-gray-400" : "text-[#141414]"}`}>
                {item.label}
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  item.priority === "high" 
                    ? "bg-rose-50 text-rose-600" 
                    : item.priority === "medium" 
                      ? "bg-amber-50 text-amber-600" 
                      : "bg-blue-50 text-blue-600"
                }`}>
                  {item.priority} Priority
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add items form */}
      <form onSubmit={handleAddItem} className="flex gap-2 border-t border-gray-100 pt-4">
        <input 
          type="text" 
          placeholder="New campaign milestone..." 
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500/20 placeholder-gray-400"
        />
        <button 
          type="submit"
          disabled={!newItemText.trim()}
          className="px-4 py-2 bg-[#141414] hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add
        </button>
      </form>
    </div>
  );
}

/* ==========================================
   WIDGET D: CURATED CREATORS GRIDS
   ========================================== */
function CreatorsWidget({ data }: { data: any }) {
  const [creators, setCreators] = useState<any[]>(data.creators || [
    { name: "Sienna Rivers", niche: "Skincare", engagement: "7.82%", followers: "140K", avatarSeed: "sienna", tags: ["Organic", "Clean Beauty"] },
    { name: "Elijah Vance", niche: "Wellness Lifestyle", engagement: "9.14%", followers: "85K", avatarSeed: "elijah", tags: ["Minimalist", "Cozy Home"] },
    { name: "Amelia Thorne", niche: "Esthetics", engagement: "6.55%", followers: "250K", avatarSeed: "amelia", tags: ["Premium", "Skin Science"] }
  ]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handlePitch = (name: string) => {
    toast.success(`Generated customizable outreach pitch for ${name}! Check messages.`);
  };

  return (
    <div className="bg-white border border-gray-250 rounded-3xl p-6 md:p-8 shadow-xl max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-black text-sm uppercase tracking-wider text-gray-400">Curated Creator Recommendations</h3>
        </div>
        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">
          {creators.length} Matching Profiles
        </span>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {creators.map((creator, i) => (
          <div 
            key={i}
            className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex flex-col justify-between hover:border-black transition-all shadow-sm group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>

            <div className="space-y-3">
              {/* Profile Identity */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#BEF264] text-black font-black text-sm flex items-center justify-center uppercase shrink-0">
                  {creator.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[#141414] truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                    {creator.name}
                  </h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{creator.niche}</p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-xl border border-gray-100">
                <div className="text-center">
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Followers</p>
                  <p className="text-xs font-black text-[#141414]">{creator.followers}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Engagement</p>
                  <p className="text-xs font-black text-[#141414] text-emerald-600">{creator.engagement}</p>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1">
                {(creator.tags || []).map((t: string, idx: number) => (
                  <span key={idx} className="px-1.5 py-0.5 bg-gray-200/50 text-[#141414] rounded text-[8px] font-bold uppercase tracking-wider">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-4">
              <button 
                onClick={() => handlePitch(creator.name)}
                className="flex-1 py-2 bg-[#141414] hover:bg-gray-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-center shadow-sm"
              >
                Pitch Campaign
              </button>
              
              <button 
                onClick={() => toggleFavorite(creator.name)}
                className={`p-2 rounded-lg border transition-all ${
                  favorites.includes(creator.name) 
                    ? "bg-rose-50 border-rose-100 text-rose-500" 
                    : "bg-white border-gray-200 text-gray-400 hover:text-black"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favorites.includes(creator.name) ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   WIDGET E: INTERACTIVE BUDGET SPLITTER
   ========================================== */
function BudgetWidget({ data }: { data: any }) {
  const [total, setTotal] = useState<number>(data.total || 8000);
  const [breakdown, setBreakdown] = useState<any[]>(data.breakdown || [
    { category: "Creator Payouts", amount: 4800, percentage: 60 },
    { category: "Platform Fee", amount: 1200, percentage: 15 },
    { category: "Ad Amplification", amount: 1600, percentage: 20 },
    { category: "Visual Asset Prep", amount: 400, percentage: 5 }
  ]);

  const handleTotalChange = (newTotal: number) => {
    setTotal(newTotal);
    // Recalculate amounts based on existing percentages
    const updated = breakdown.map(cat => ({
      ...cat,
      amount: Math.round((newTotal * cat.percentage) / 100)
    }));
    setBreakdown(updated);
  };

  const updatePercentage = (index: number, newPercent: number) => {
    const updated = [...breakdown];
    updated[index].percentage = newPercent;
    
    // Quick adjustment of remaining percentages to sum up to 100
    let currentSum = updated.reduce((sum, item) => sum + item.percentage, 0);
    if (currentSum !== 100) {
      const diff = 100 - currentSum;
      // Distribute difference to another category or adjust last
      const adjustIdx = index === 0 ? 1 : 0;
      updated[adjustIdx].percentage = Math.max(0, updated[adjustIdx].percentage + diff);
    }

    // Recalculate all amounts
    const final = updated.map(cat => ({
      ...cat,
      amount: Math.round((total * cat.percentage) / 100)
    }));

    setBreakdown(final);
  };

  const chartData = breakdown.map(cat => ({
    name: cat.category,
    value: cat.amount
  }));

  const colors = ["#141414", "#BEF264", "#3B82F6", "#8B5CF6"];

  return (
    <div className="bg-white border border-gray-250 rounded-3xl p-6 md:p-8 shadow-xl max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="font-black text-sm uppercase tracking-wider text-gray-400">Interactive Budget Splitter</h3>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
          Total: ${total.toLocaleString()}
        </span>
      </div>

      {/* Slider Selector for Total Budget */}
      <div className="space-y-2 p-4 bg-gray-50 border border-gray-150 rounded-2xl">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
          <span>Sponsorship Campaign Budget</span>
          <span className="font-mono text-[#141414] font-black">${total.toLocaleString()} USD</span>
        </div>
        <input 
          type="range" 
          min="1000" 
          max="100000" 
          step="500"
          value={total} 
          onChange={(e) => handleTotalChange(Number(e.target.value))}
          className="w-full accent-black h-1 bg-gray-200 rounded-lg cursor-pointer appearance-none"
        />
        <div className="flex justify-between text-[8px] text-gray-400 font-black uppercase tracking-widest">
          <span>$1,000</span>
          <span>$50,000</span>
          <span>$100,000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Sliders breakdown left column */}
        <div className="md:col-span-7 space-y-4">
          <span className="text-[9px] text-gray-400 font-black tracking-widest uppercase block">Budget Allocations</span>
          
          {breakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5 p-2 bg-gray-50/50 rounded-xl border border-gray-100">
              <div className="flex justify-between text-xs font-bold text-[#141414] uppercase tracking-tight">
                <span>{item.category}</span>
                <span>${item.amount.toLocaleString()} ({item.percentage}%)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={item.percentage} 
                onChange={(e) => updatePercentage(idx, Number(e.target.value))}
                className="w-full accent-[#BEF264] h-1 bg-gray-200 rounded-lg cursor-pointer appearance-none"
              />
            </div>
          ))}
        </div>

        {/* Visual pie chart right column */}
        <div className="md:col-span-5 flex flex-col items-center justify-center h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                <span>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
