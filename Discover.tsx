import { useState, useEffect } from "react";
import { Search, Filter, Play, Heart, MessageCircle, Bookmark, Star, Sparkles, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Campaign, Post } from "../types";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import CollabMap from "../components/CollabMap";

export default function Discover() {
  const [activeTab, setActiveTab] = useState<"feed" | "campaigns" | "map">("feed");
  const [selectedRegion, setSelectedRegion] = useState<"all" | "egy" | "uae" | "ksa">("all");

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
          <button 
            onClick={() => setActiveTab("feed")}
            className={cn("px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors", activeTab === "feed" ? "bg-white shadow-sm text-[#141414]" : "text-gray-400 hover:text-[#141414]")}
          >
            Social Feed
          </button>
          <button 
            onClick={() => setActiveTab("campaigns")}
            className={cn("px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors", activeTab === "campaigns" ? "bg-white shadow-sm text-[#141414]" : "text-gray-400 hover:text-[#141414]")}
          >
            Marketplace
          </button>
          <button 
            onClick={() => setActiveTab("map")}
            className={cn("px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors flex items-center gap-1.5", activeTab === "map" ? "bg-white shadow-sm text-purple-600 font-bold" : "text-gray-400 hover:text-[#141414]")}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Collab Map</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-purple-500/20 w-64 transition-all"
            />
          </div>
          <button className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Regional Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-3xl border border-purple-500/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[#141414]">Regional Hubs</h3>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">Explore handpicked collaborations, social content, and studios across our key focus regions.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Regions", flag: "🌍" },
              { id: "egy", label: "Egypt", flag: "🇪🇬" },
              { id: "uae", label: "UAE", flag: "🇦🇪" },
              { id: "ksa", label: "KSA", flag: "🇸🇦" },
            ].map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id as any)}
                className={cn(
                  "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border cursor-pointer",
                  selectedRegion === region.id
                    ? "bg-[#141414] text-white border-transparent shadow-md animate-scale"
                    : "bg-white text-gray-600 border-gray-150 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                <span>{region.flag}</span>
                <span>{region.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeTab === "feed" ? (
          <FeedView selectedRegion={selectedRegion} />
        ) : activeTab === "campaigns" ? (
          <CampaignsView selectedRegion={selectedRegion} />
        ) : (
          <CollabMap selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
        )}
      </div>
    </div>
  );
}

const REGIONAL_POSTS: (Post & { region: "egy" | "uae" | "ksa"; creatorId: string; likes: number; comments: number; caption: string; mediaUrl: string; type: "image" | "video" })[] = [
  {
    id: "egy-post-1",
    userId: "user-egy-1",
    content: "Sunset photography along the Cairo Nile Corniche 🌅",
    media: ["https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&q=80"],
    creatorId: "Farida_Cairo",
    mediaUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&q=80",
    type: "image",
    likes: 1420,
    comments: 98,
    caption: "Sunset photography along the Cairo Nile Corniche 🌅 The golden hour light bouncing off the water is just sublime. Planning a streetwear collab next week around Zamalek, drop a DM to join the squad! 🇪🇬 #CairoPhotographer #NileVibes",
    region: "egy",
    createdAt: Date.now() - 3600000
  },
  {
    id: "uae-post-1",
    userId: "user-uae-1",
    content: "Midnight drift aesthetics at Downtown Dubai 🎥",
    media: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80"],
    creatorId: "Zayd_Dubai_Films",
    mediaUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    type: "video",
    likes: 3820,
    comments: 184,
    caption: "Midnight drift aesthetics at Downtown Dubai 🎥 Testing out the cinematic low-light sensor with the DJI Ronin setup. Looking to partner with automotive lifestyle creators in UAE for an upcoming brand reel! 🇦🇪 #DubaiFilm #Ronin4D",
    region: "uae",
    createdAt: Date.now() - 7200000
  },
  {
    id: "ksa-post-1",
    userId: "user-ksa-1",
    content: "Our new custom lighting rig is finally live at Riyadh Boulevard studio space! 🇸🇦",
    media: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"],
    creatorId: "Sarah_Riyadh_Creative",
    mediaUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    type: "image",
    likes: 940,
    comments: 52,
    caption: "Our new custom lighting rig is finally live at Riyadh Boulevard studio space! 🇸🇦 Ideal for high-key tech unboxing, cosmetics and interview formats. Ready to rent or co-create with other creators. #RiyadhStyle #SaudiCreators",
    region: "ksa",
    createdAt: Date.now() - 10800000
  },
  {
    id: "egy-post-2",
    userId: "user-egy-2",
    content: "Chasing classic cinematic tones around Alexandria's coastal tram lines.",
    media: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"],
    creatorId: "Youssef_Alex_Cine",
    mediaUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80",
    type: "image",
    likes: 720,
    comments: 39,
    caption: "Chasing classic cinematic tones around Alexandria's coastal tram lines. The Mediterranean light hits differently! DaVinci Resolve graded. 🌊 #AlexandriaVisuals #VintageEgypt",
    region: "egy",
    createdAt: Date.now() - 14400000
  }
];

const REGIONAL_CAMPAIGNS: (Campaign & { region: "egy" | "uae" | "ksa"; brandId: string; title: string; description: string; budget: string; deadline: string })[] = [
  {
    id: "egy-camp-1",
    brandId: "CairoModa",
    title: "Eco-Linen Heritage Summer Shoot",
    description: "Looking for 5 fashion, travel, and lifestyle creators based in Egypt (Cairo/Alexandria) to highlight our upcoming local sustainable linen collection. Shoots will take place against iconic backdrops like Al-Muizz street and Stanly Bridge.",
    budget: "EGP 30,000",
    requirements: "Fashion/lifestyle focus, high engagement, 4K reel capability",
    deadline: "2026-08-25",
    region: "egy",
    createdAt: Date.now() - 86400000
  },
  {
    id: "uae-camp-1",
    brandId: "SkylineDubai",
    title: "Luxury Penthouse Experience Showcase",
    description: "Seeking premium GCC travel and architectural videographers to craft immersive transition reels of our new residential tower in Dubai Marina. Exclusive access, private dining, and full production coverage included.",
    budget: "$5,000 USD",
    requirements: "Cinematic drone (licensed), high-end lifestyle curation, 10k+ reach",
    deadline: "2026-09-05",
    region: "uae",
    createdAt: Date.now() - 172800000
  },
  {
    id: "ksa-camp-1",
    brandId: "RiyadhHub",
    title: "Boulevard Entertainment & Tech Vlog",
    description: "Co-produce an engaging multi-part vlog series highlighting cutting-edge entertainment and virtual experiences at Riyadh Boulevard. Ideal for entertainment, tech, and cultural lifestyle creators.",
    budget: "SAR 20,000",
    requirements: "Charismatic storytelling, active Saudi demographic, 4K master delivery",
    deadline: "2026-09-15",
    region: "ksa",
    createdAt: Date.now() - 259200000
  }
];

const renderRegionBadge = (region?: "egy" | "uae" | "ksa") => {
  if (!region) return null;
  const labels = {
    egy: { text: "Egypt", flag: "🇪🇬", color: "bg-red-50 text-red-700 border-red-100" },
    uae: { text: "UAE", flag: "🇦🇪", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    ksa: { text: "KSA", flag: "🇸🇦", color: "bg-green-50 text-green-700 border-green-100" }
  };
  const config = labels[region];
  if (!config) return null;
  return (
    <span className={cn("px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border rounded-full flex items-center gap-1.5 shadow-sm", config.color)}>
      <span>{config.flag}</span>
      <span>{config.text}</span>
    </span>
  );
};

interface FeedViewProps {
  selectedRegion: "all" | "egy" | "uae" | "ksa";
}

function FeedView({ selectedRegion }: FeedViewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        setPosts(data);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading feed...</div>;

  const regionMapping = ["egy", "uae", "ksa"] as const;
  const getDeterministicRegion = (id: string, index: number) => {
    const charCodeSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return regionMapping[(charCodeSum + index) % regionMapping.length];
  };

  const allPosts = [
    ...REGIONAL_POSTS,
    ...posts.map((p, idx) => ({
      ...p,
      creatorId: (p as any).creatorId || p.userId || "creator",
      likes: (p as any).likes || 120,
      comments: (p as any).comments || 15,
      caption: (p as any).caption || p.content || "",
      mediaUrl: (p as any).mediaUrl || (p.media && p.media[0]) || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
      type: (p as any).type || "image",
      region: (p as any).region || getDeterministicRegion(p.id, idx)
    }))
  ];

  const filteredPosts = selectedRegion === "all"
    ? allPosts
    : allPosts.filter(p => p.region === selectedRegion);

  if (filteredPosts.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto">
        <p className="text-gray-500 text-sm">No social posts found for this region yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {filteredPosts.map(post => (
        <div key={post.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-serif italic text-xl font-bold text-[#141414]">
                {post.creatorId?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#141414]">Creator {post.creatorId?.slice(0, 10)}</h4>
                  {renderRegionBadge(post.region as any)}
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">@{post.creatorId?.toLowerCase().replace(/\s+/g, "")}</span>
              </div>
            </div>
            <button className="px-4 py-1.5 bg-[#141414] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-gray-800">
              Follow
            </button>
          </div>
          <div className="aspect-[4/5] bg-gray-100 relative group cursor-pointer">
            <img src={post.mediaUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"} alt="Media thumbnail" className="w-full h-full object-cover" />
            {post.type === 'video' && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 group">
                  <Heart className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
                  <span className="text-sm font-semibold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 group">
                  <MessageCircle className="w-6 h-6 text-gray-500 group-hover:text-black transition-colors" />
                  <span className="text-sm font-semibold">{post.comments}</span>
                </button>
              </div>
              <button>
                <Bookmark className="w-6 h-6 text-gray-500 hover:text-black transition-colors" />
              </button>
            </div>
            <p className="text-sm">
              <span className="font-bold mr-2">@{post.creatorId?.toLowerCase().replace(/\s+/g, "")}</span>
              {post.caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface CampaignsViewProps {
  selectedRegion: "all" | "egy" | "uae" | "ksa";
}

function CampaignsView({ selectedRegion }: CampaignsViewProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const q = query(collection(db, "campaigns"), orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
        setCampaigns(data);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "campaigns");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading campaigns...</div>;

  const regionMapping = ["egy", "uae", "ksa"] as const;
  const getDeterministicRegion = (id: string, index: number) => {
    const charCodeSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return regionMapping[(charCodeSum + index) % regionMapping.length];
  };

  const allCampaigns = [
    ...REGIONAL_CAMPAIGNS,
    ...campaigns.map((c, idx) => ({
      ...c,
      brandId: c.brandId || "brand",
      region: (c as any).region || getDeterministicRegion(c.id, idx)
    }))
  ];

  const filteredCampaigns = selectedRegion === "all"
    ? allCampaigns
    : allCampaigns.filter(c => c.region === selectedRegion);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Campaign Marketplace</h2>
          <p className="text-gray-500 font-medium">Find and apply to top brand collaborations.</p>
        </div>
        <div className="hidden md:flex gap-2">
           <span className="px-3 py-1.5 bg-white border border-gray-100 text-[#141414] rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"><Star className="w-3 h-3 fill-[#BEF264] text-[#BEF264]"/> For You</span>
           <span className="px-3 py-1.5 bg-white border border-gray-100 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">Highest Paid</span>
           <span className="px-3 py-1.5 bg-white border border-gray-100 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">Ending Soon</span>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="bg-white border border-gray-150 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-gray-500 text-sm">No campaigns found for this region. Check back later!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-[#A855F7] transition-all flex flex-col h-full group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-sm text-[#141414]">{c.brandId?.slice(0, 2).toUpperCase()}</div>
                  <span className="font-bold text-sm text-[#141414]">Brand {c.brandId?.slice(0, 8)}</span>
                </div>
                {renderRegionBadge(c.region as any)}
              </div>
              <h3 className="font-bold text-xl mb-2 text-[#141414]">{c.title}</h3>
              <p className="text-xs font-medium text-gray-500 mb-6 flex-1 line-clamp-3 leading-relaxed">{c.description}</p>
              
              <div className="mt-auto space-y-4">
                <div className="flex justify-between text-sm border-t border-gray-50 pt-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Budget</span>
                  <span className="font-black text-purple-600">{c.budget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deadline</span>
                  <span className="font-bold text-gray-700">
                    {c.deadline.includes("-") ? new Date(c.deadline).toLocaleDateString() : c.deadline}
                  </span>
                </div>
                <button className="w-full py-3 bg-[#A855F7] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-sm">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
