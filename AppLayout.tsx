import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Flame, PlusSquare, MessageSquare, User, Zap, Star, TrendingUp, Camera, Target, X, Loader2, LogOut, FileSpreadsheet, FileText, Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../AuthProvider";
import { CuteCharacter } from "../ui/CuteCharacter";
import { CryovaLogoSymbol } from "../ui/CryovaLogoSymbol";
import { useState } from "react";
import { toast } from "sonner";
import { auth } from "../../lib/firebase";
import { motion, AnimatePresence } from "motion/react";

const IconMap: Record<string, any> = {
  Zap, Star, TrendingUp, Camera, Target, MessageSquare
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const role = userData?.role || "creator";
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{title: string, description: string, icon: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Notification Center states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "inv-1",
      brandName: "Nike",
      brandAvatar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80",
      campaignTitle: "Summer Air Shorts Campaign",
      budget: "$2,400",
      status: "pending"
    },
    {
      id: "inv-2",
      brandName: "Sephora",
      brandAvatar: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&auto=format&fit=crop&q=80",
      campaignTitle: "Glow Skin Routine Reels",
      budget: "$1,850",
      status: "pending"
    },
    {
      id: "inv-3",
      brandName: "Logitech",
      brandAvatar: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&auto=format&fit=crop&q=80",
      campaignTitle: "Aurora Keyboard Unboxing ASMR",
      budget: "$3,200",
      status: "pending"
    }
  ]);

  const pendingNotifsCount = notifications.filter(n => n.status === "pending").length;

  const handleAcceptInvite = (id: string, brand: string, campaign: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "accepted" } : n));
    toast.success(`Collaboration accepted with ${brand}! A direct message channel has been created for '${campaign}'`, {
      duration: 5000
    });
  };

  const handleDeclineInvite = (id: string, brand: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "declined" } : n));
    toast.error(`Invite from ${brand} declined.`);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const fetchAiSuggestions = async () => {
    setIsAiModalOpen(true);
    if (suggestions.length > 0) return; // Already fetched
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/gemini/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch suggestions");
      }
      const data = await res.json();
      setSuggestions(data);
    } catch (err: any) {
      toast.error(err.message || "Could not load AI suggestions");
      setIsAiModalOpen(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  const navItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Discover", path: "/discover", icon: Compass },
    { name: "Feed", path: "/feed", icon: Flame },
    { name: role === "creator" ? "Portfolio" : "Create", path: "/create", icon: PlusSquare },
    { name: "Sheets", path: "/sheets", icon: FileSpreadsheet },
    { name: "Docs", path: "/docs", icon: FileText },
    { name: "Messages", path: "/messages", icon: MessageSquare },
    { name: role === "creator" ? "Profile" : "Company", path: "/profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-[#141414] font-sans">
      {/* Sidebar for Desktop - Sleek Permanent Style */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white px-5 py-6">
        <div className="flex items-center gap-3 px-2 mb-10">
          <CryovaLogoSymbol className="w-8 h-8 text-[#141414]" />
          <span className="font-black text-xl tracking-tighter">CRYOVA</span>
          <CuteCharacter size="sm" isWalking={false} className="ml-auto opacity-80" />
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gray-100 text-[#141414] font-bold"
                    : "text-gray-500 hover:text-[#141414] hover:bg-gray-50 font-medium"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="text-xs uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#BEF264] opacity-20 blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#BEF264] text-[8px] font-black uppercase tracking-widest rounded text-[#141414]">AI Agent</span>
            </div>
            <p className="text-[10px] text-gray-600 mb-3 font-medium leading-relaxed">Optimize your profile for more matches.</p>
            <button 
              onClick={fetchAiSuggestions}
              className="w-full py-2 bg-white border border-gray-200 text-[#141414] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:shadow-md transition-all">
              Ask AI
            </button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 px-2 flex items-center justify-between gap-3">
           <div className="flex items-center gap-3 min-w-0">
             <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#141414] flex items-center justify-center text-white text-xs font-serif italic">
                     {userData?.name?.charAt(0) || (role === 'creator' ? 'A' : 'B')}
                  </div>
                )}
             </div>
             <div className="min-w-0">
                <p className="text-xs font-bold text-[#141414] truncate">{userData?.name || (role === 'creator' ? 'Alex Carter' : 'Acme Brands')}</p>
                <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest">{role}</p>
             </div>
           </div>
           <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-800 transition-colors" title="Log out">
             <LogOut className="w-4 h-4" />
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto flex flex-col bg-[#FAFAFA]">
        {/* Unified Top Header Bar */}
        <header className="h-16 border-b border-gray-150 bg-white px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Workspace /</span>
            <span className="text-[10px] font-black text-[#141414] uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
              {location.pathname.replace("/", "") || "Home"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Center Trigger */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-gray-500 hover:text-[#141414] hover:bg-gray-50 rounded-xl transition-all relative border border-gray-200 flex items-center justify-center bg-white"
                title="Notifications"
                id="notification-bell-btn"
              >
                <Bell className="w-4 h-4" />
                {pendingNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-black text-[8px] flex items-center justify-center rounded-full animate-bounce">
                    {pendingNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown popover */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 p-4"
                    id="notification-dropdown-panel"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-[#141414]">Collaboration Invites</h4>
                      {pendingNotifsCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-wider rounded">
                          {pendingNotifsCount} New
                        </span>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                          <Bell className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">All caught up!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={cn(
                              "p-3 rounded-xl border transition-all flex flex-col gap-2.5",
                              notif.status === "pending" 
                                ? "bg-gray-50 border-gray-100" 
                                : notif.status === "accepted"
                                ? "bg-green-50/50 border-green-100/50"
                                : "bg-gray-50/30 border-gray-100/30 opacity-60"
                            )}
                          >
                            <div className="flex items-start gap-2.5">
                              <img src={notif.brandAvatar} alt={notif.brandName} className="w-7 h-7 rounded-lg object-cover shrink-0 border border-gray-200" />
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-xs text-[#141414] truncate">{notif.brandName}</h5>
                                <p className="text-[10px] text-gray-500 font-semibold truncate mt-0.5">{notif.campaignTitle}</p>
                                <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1 rounded inline-block mt-1">
                                  {notif.budget}
                                </span>
                              </div>
                            </div>

                            {notif.status === "pending" ? (
                              <div className="flex gap-2 border-t border-gray-100 pt-2 mt-1">
                                <button 
                                  onClick={() => handleAcceptInvite(notif.id, notif.brandName, notif.campaignTitle)}
                                  className="flex-1 py-1.5 bg-[#BEF264] text-[#141414] text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-[#a6e03f] transition-all flex items-center justify-center gap-1 shadow-sm"
                                >
                                  <Check className="w-3 h-3" /> Accept
                                </button>
                                <button 
                                  onClick={() => handleDeclineInvite(notif.id, notif.brandName)}
                                  className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-[#141414] hover:bg-gray-50 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1"
                                >
                                  <X className="w-3 h-3" /> Decline
                                </button>
                              </div>
                            ) : (
                              <div className="text-[9px] font-mono uppercase tracking-widest text-center py-1 border-t border-dashed mt-1 border-gray-100">
                                {notif.status === "accepted" ? (
                                  <span className="text-emerald-600 font-black">● Accepted</span>
                                ) : (
                                  <span className="text-gray-400 font-black">● Declined</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="text-[10px] font-mono text-gray-400 uppercase font-black hidden sm:block">
              CRYOVA Score: <span className="text-[#A855F7] font-extrabold">98.7</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Outlet Content */}
        <div className="flex-grow pb-16 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav for Mobile - Clean minimal tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-16 px-4 pb-safe z-50">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                isActive ? "text-[#141414]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className={cn("text-[9px] uppercase tracking-widest", isActive ? "font-black" : "font-medium")}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* AI Suggestions Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative border border-gray-100 max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#BEF264]/20 text-[#141414] rounded-2xl flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">AI Optimization</h3>
                <p className="text-xs text-gray-500 font-medium">Personalized suggestions for your profile</p>
              </div>
            </div>

            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Analyzing Profile...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion, idx) => {
                  const Icon = IconMap[suggestion.icon] || Star;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex gap-4">
                      <div className="mt-1 bg-white p-2 rounded-xl shadow-sm h-fit">
                         <Icon className="w-4 h-4 text-[#A855F7]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1">{suggestion.title}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{suggestion.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {!isAiLoading && (
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="mt-6 w-full py-3 bg-[#141414] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                Got it, thanks!
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
