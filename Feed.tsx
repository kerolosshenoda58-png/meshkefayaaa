import React, { useState, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Send, 
  Sparkles, 
  Play, 
  Plus, 
  Search, 
  Filter, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Eye, 
  Sliders, 
  ArrowRight,
  Loader2,
  X,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../components/AuthProvider";
import { collection, addDoc, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface Post {
  id: string;
  creatorId: string;
  creatorName: string;
  avatarSeed: string;
  mediaUrl: string;
  type: "video" | "image";
  caption: string;
  likes: number;
  comments: number;
  category: string;
  engagement: string;
  createdAt: any;
}

export default function Feed() {
  const { userData } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Interactive comments state
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsList, setCommentsList] = useState<{ [postId: string]: string[] }>({});
  const [newCommentText, setNewCommentText] = useState("");

  // AI pitch modal state
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [selectedCreatorForPitch, setSelectedCreatorForPitch] = useState<any>(null);
  const [generatedPitch, setGeneratedPitch] = useState("");
  const [generatingPitch, setGeneratingPitch] = useState(false);

  // New Post form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Skincare");
  const [newPostMediaType, setNewPostMediaType] = useState<"video" | "image">("video");
  const [newPostMediaUrl, setNewPostMediaUrl] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Liked and Bookmarked states (client-side dynamic tracking)
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);

  // Dummy Fallback Posts in case Firestore is empty or loading fails
  const initialFallbackPosts: Post[] = [
    {
      id: "fallback-1",
      creatorId: "sienna_rivers",
      creatorName: "Sienna Rivers",
      avatarSeed: "sienna",
      mediaUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
      type: "video",
      caption: "Unboxing the brand new vegan glow lip serum! 💋 The hydration is unreal and it stays shiny for up to 6 hours. Loving this formula so much! #skincare #cleanbeauty",
      likes: 412,
      comments: 34,
      category: "Skincare",
      engagement: "8.4%",
      createdAt: new Date()
    },
    {
      id: "fallback-2",
      creatorId: "elijah_vance",
      creatorName: "Elijah Vance",
      avatarSeed: "elijah",
      mediaUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      type: "image",
      caption: "Early morning yoga flow with the breathable organic bamboo fabric mat. Best start to my week. 🧘‍♂️🌱 #wellness #mindfulness #lifestyle",
      likes: 289,
      comments: 18,
      category: "Fitness",
      engagement: "9.1%",
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      id: "fallback-3",
      creatorId: "amelia_thorne",
      creatorName: "Amelia Thorne",
      avatarSeed: "amelia",
      mediaUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
      type: "video",
      caption: "Night routine skin prep using micro-capsule active ingredients. Wake up looking like you got 10 hours of sleep! ✨💤 #esthetics #healthyskin",
      likes: 654,
      comments: 72,
      category: "Skincare",
      engagement: "7.6%",
      createdAt: new Date(Date.now() - 7200000)
    },
    {
      id: "fallback-4",
      creatorId: "marcus_tech",
      creatorName: "Marcus Kane",
      avatarSeed: "marcus",
      mediaUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      type: "video",
      caption: "Quick unboxing and sound test of these spatial audio noise-cancelling headphones. Bass is deep, mids are pristine. Full review in bio! 🎧💻 #smarttech #gadgetlife",
      likes: 915,
      comments: 114,
      category: "Tech",
      engagement: "11.2%",
      createdAt: new Date(Date.now() - 14400000)
    }
  ];

  const categories = ["All", "Skincare", "Cosmetics", "Apparel", "Tech", "Fitness"];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const item = doc.data();
        return {
          id: doc.id,
          creatorId: item.creatorId || "unknown",
          creatorName: item.creatorName || `Creator ${item.creatorId?.slice(0, 4) || "UGC"}`,
          avatarSeed: item.avatarSeed || "user",
          mediaUrl: item.mediaUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
          type: item.type || "video",
          caption: item.caption || "",
          likes: item.likes || 0,
          comments: item.comments || 0,
          category: item.category || "Skincare",
          engagement: item.engagement || "6.5%",
          createdAt: item.createdAt?.toDate() || new Date()
        } as Post;
      });

      if (data.length === 0) {
        setPosts(initialFallbackPosts);
      } else {
        setPosts(data);
      }
    } catch (err) {
      console.warn("Firestore error loading posts, falling back to mock assets:", err);
      setPosts(initialFallbackPosts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter & Search logic
  const filteredPosts = posts.filter(post => {
    const categoryMatch = selectedCategory === "All" || post.category.toLowerCase() === selectedCategory.toLowerCase();
    const searchMatch = searchQuery === "" || 
      post.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleLike = (postId: string) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(prev => prev.filter(id => id !== postId));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
    } else {
      setLikedPosts(prev => [...prev, postId]);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      toast.success("Added to liked posts");
    }
  };

  const handleBookmark = (postId: string) => {
    if (bookmarkedPosts.includes(postId)) {
      setBookmarkedPosts(prev => prev.filter(id => id !== postId));
      toast.info("Removed from saved list");
    } else {
      setBookmarkedPosts(prev => [...prev, postId]);
      toast.success("Saved to collections catalog!");
    }
  };

  // Comments submit
  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;
    
    const existing = commentsList[postId] || [];
    setCommentsList({
      ...commentsList,
      [postId]: [...existing, newCommentText.trim()]
    });
    
    // Increment comments count visually
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setNewCommentText("");
    toast.success("Comment added live!");
  };

  // Generate AI pitch via endpoint or direct fallback if key not configured
  const triggerAiPitch = async (creator: Post) => {
    setSelectedCreatorForPitch(creator);
    setIsPitchModalOpen(true);
    setGeneratingPitch(true);
    setGeneratedPitch("");

    try {
      // Use the live Gemini endpoint we created to build a highly targeted strategic outreach pitch
      const response = await fetch("/api/gemini/a2ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Write a hyper-personalized digital brand sponsorship outreach email pitching creator ${creator.creatorName} (Niche: ${creator.category}, Engagement: ${creator.engagement}) for a luxury marketing campaign. Keep it professional, crisp, and under 150 words. Format beautifully with subject line.`
            }
          ],
          role: "brand"
        })
      });

      if (!response.ok) {
        throw new Error("Could not connect to Gemini API");
      }

      const resJson = await response.json();
      setGeneratedPitch(resJson.textResponse || "Failed to structure pitch advice.");
    } catch (err) {
      // Elegant customized fallback if key is missing
      setTimeout(() => {
        setGeneratedPitch(`Subject: CRYOVA Campaign Proposal x ${creator.creatorName} 🚀\n\nHi ${creator.creatorName},\n\nI love your creative aesthetic and recent ${creator.category} UGC work (especially your impressive ${creator.engagement} engagement stats)!\n\nWe would love to sponsor a video showcase of our premium products on your page. We offer competitive rates and full creative freedom. Let us know if you're open to collaborating!\n\nBest,\nCampaign Manager\nCRYOVA Collective`);
      }, 1000);
    } finally {
      setGeneratingPitch(false);
    }
  };

  // Submit new post to feed
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostCaption.trim()) {
      toast.error("Please add a caption to present your work.");
      return;
    }

    setSubmittingPost(true);
    const mediaPool = {
      skincare: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
      cosmetics: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
      apparel: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
      tech: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      fitness: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
    };

    const targetMedia = newPostMediaUrl.trim() || mediaPool[newPostCategory.toLowerCase() as keyof typeof mediaPool] || mediaPool.skincare;

    const postData = {
      creatorId: userData?.id || "anonymous_user",
      creatorName: userData?.name || "CRYOVA Ambassador",
      avatarSeed: userData?.name?.toLowerCase() || "user",
      mediaUrl: targetMedia,
      type: newPostMediaType,
      caption: newPostCaption.trim(),
      likes: Math.floor(Math.random() * 50) + 12,
      comments: 0,
      category: newPostCategory,
      engagement: "8.1%",
      createdAt: new Date()
    };

    try {
      // Save to Firebase database
      await addDoc(collection(db, "posts"), postData);
      toast.success("Post live-published successfully to feed!");
      
      // Update local state to show immediately
      const newLocal: Post = {
        id: `post-${Date.now()}`,
        ...postData
      };
      setPosts(prev => [newLocal, ...prev]);
      
      // Clear values and close
      setNewPostCaption("");
      setNewPostMediaUrl("");
      setIsCreateModalOpen(false);
    } catch (err) {
      console.warn("Firestore save failed, falling back to memory publish", err);
      const newLocal: Post = {
        id: `post-${Date.now()}`,
        ...postData
      };
      setPosts(prev => [newLocal, ...prev]);
      toast.success("Post published to local feed view!");
      setIsCreateModalOpen(false);
    } finally {
      setSubmittingPost(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#FAFAFA] overflow-hidden w-full h-full min-h-screen">
      
      {/* LEFT CONTENT AREA: Main Social Feed Stream & Custom Post Creator */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        
        {/* Modern Interactive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#141414] uppercase tracking-tight flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" /> Trending UGC Feed
            </h1>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
              Live Creative showcase & engagement analytics
            </p>
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 bg-[#BEF264] hover:bg-[#aade4b] text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Post UGC Showcase
          </button>
        </div>

        {/* Categories Bar & Search Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
          
          {/* Scrollable Categories List */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                    ? "bg-[#141414] text-white shadow-sm" 
                    : "bg-gray-50 hover:bg-gray-150 text-gray-400 hover:text-black border border-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Instant Client-side Search Input */}
          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search creator, niche, brand keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-gray-50 hover:bg-gray-100/50 border border-gray-200 rounded-full text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 hover:text-black"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Feed Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Tuning Social Feed Channels...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center max-w-md mx-auto my-10">
            <Sliders className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-black text-sm uppercase tracking-tight text-[#141414] mb-2">No Matches Found</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
              We couldn't find any UGC posts matching the keyword "{searchQuery}". Try searching for categories like "skincare", "fitness", or clear filters.
            </p>
            <button 
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="px-4 py-2 bg-[#141414] text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-150 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                >
                  
                  {/* Card Creator Header */}
                  <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-bold text-sm text-[#A855F7] uppercase shrink-0 shadow-inner">
                        {post.creatorName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#141414] uppercase tracking-tight">{post.creatorName}</h4>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">@{post.creatorId}</span>
                      </div>
                    </div>
                    
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[8px] font-black uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>

                  {/* Media Content Stage */}
                  <div className="aspect-[4/3] bg-black/5 relative group overflow-hidden">
                    <img 
                      src={post.mediaUrl} 
                      alt="UGC Video Cover" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#BEF264]" /> {post.engagement} ENG
                      </span>
                    </div>

                    {post.type === "video" && (
                      <div className="absolute inset-0 bg-black/20 opacity-40 group-hover:opacity-10 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Button Rails */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-1.5 group transition-all ${likedPosts.includes(post.id) ? "text-rose-500 scale-105" : "text-gray-400 hover:text-rose-500"}`}
                          >
                            <Heart className={`w-5 h-5 ${likedPosts.includes(post.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                            <span className="text-xs font-black">{post.likes}</span>
                          </button>
                          
                          <button 
                            onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                            className={`flex items-center gap-1.5 transition-all ${activeCommentsPostId === post.id ? "text-blue-500" : "text-gray-400 hover:text-black"}`}
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-xs font-black">{post.comments}</span>
                          </button>
                        </div>

                        <button 
                          onClick={() => handleBookmark(post.id)}
                          className={`transition-all ${bookmarkedPosts.includes(post.id) ? "text-amber-500" : "text-gray-400 hover:text-black"}`}
                        >
                          <Bookmark className={`w-5 h-5 ${bookmarkedPosts.includes(post.id) ? "fill-amber-500" : ""}`} />
                        </button>
                      </div>

                      <p className="text-xs text-gray-700 font-semibold leading-relaxed mb-4">
                        <span className="font-bold text-[#141414] mr-1.5">@{post.creatorId}</span>
                        {post.caption}
                      </p>
                    </div>

                    {/* Interactive Comments Container */}
                    {activeCommentsPostId === post.id && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100 space-y-3">
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-200/50 pb-1.5">Live Comments Stream</p>
                        
                        <div className="space-y-1.5 max-h-24 overflow-y-auto">
                          {(commentsList[post.id] || []).length === 0 ? (
                            <p className="text-[10px] text-gray-400 italic">No comments yet. Start the conversation!</p>
                          ) : (
                            (commentsList[post.id] || []).map((cmt, idx) => (
                              <div key={idx} className="text-[10px] text-gray-700 leading-snug">
                                <span className="font-bold text-[#141414] mr-1.5">You:</span>{cmt}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Add comment..." 
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                            className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-semibold outline-none focus:ring-1 focus:ring-blue-500/20"
                          />
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            className="px-3 bg-[#141414] text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Footer: AI Pitch and Direct Action */}
                    <div className="pt-3 border-t border-gray-100 flex gap-2">
                      <button 
                        onClick={() => triggerAiPitch(post)}
                        className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 text-[#BEF264]" /> AI Pitch outreach
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: UGC Leaderboard & Creator Spotlights */}
      <div className="lg:w-[350px] bg-white border-l border-gray-200 h-full overflow-y-auto p-6 shrink-0 flex flex-col gap-6">
        
        {/* Leaderboard Header */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> UGC Leaderboard
          </h2>
          <p className="text-lg font-black text-[#141414] uppercase">Trending Creators</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Based on average engagement</p>
        </div>

        {/* Creator Leaders List */}
        <div className="space-y-4">
          {[
            { name: "Sienna Rivers", niche: "Skincare", followers: "140K", engagement: "8.4%", badge: "🔥 Spark" },
            { name: "Elijah Vance", niche: "Fitness & Wellness", followers: "85K", engagement: "9.1%", badge: "⭐ Top Rate" },
            { name: "Amelia Thorne", niche: "Esthetics", followers: "250K", engagement: "7.6%", badge: "👑 Elite" },
            { name: "Marcus Kane", niche: "Consumer Tech", followers: "195K", engagement: "11.2%", badge: "⚡ Super" }
          ].map((creator, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black text-gray-400 w-4">#{i + 1}</span>
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-xs text-[#141414]">
                  {creator.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#141414] truncate uppercase tracking-tight">{creator.name}</h4>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider">{creator.niche}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black uppercase tracking-widest block bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 mb-1">{creator.badge}</span>
                <span className="text-[10px] font-black text-[#141414] block">{creator.engagement} ENG</span>
              </div>
            </div>
          ))}
        </div>

        {/* Campaign Tips Box */}
        <div className="bg-gradient-to-tr from-[#141414] to-gray-800 text-white p-5 rounded-2xl relative overflow-hidden mt-2">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#BEF264] opacity-20 blur-2xl"></div>
          <span className="px-2 py-0.5 bg-[#BEF264] text-[8px] font-black uppercase tracking-widest text-black rounded mb-2.5 inline-block">Pro UGC Tip</span>
          <h4 className="font-bold text-xs uppercase tracking-tight mb-1 text-white">Drive Higher ROAS</h4>
          <p className="text-[10px] leading-relaxed text-gray-300 font-medium">
            UGC clips focusing on product textures and immediate result application see on average 43% higher conversion ratios on TikTok ads. Look for creators with higher raw engagement scores.
          </p>
        </div>
      </div>

      {/* ==========================================
         MODAL 1: AI PERSONALIZED PITCH PROPOSAL
         ========================================== */}
      <AnimatePresence>
        {isPitchModalOpen && selectedCreatorForPitch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-gray-150 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsPitchModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <X className="w-4 h-4 text-gray-500 hover:text-black" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-gray-400">CRYOVA AI Agent</h3>
                  <h2 className="text-xl font-black text-[#141414] uppercase">UGC Outreach Campaign Generator</h2>
                </div>
              </div>

              {generatingPitch ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Formulating Campaign Pitch & Offer...</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150 text-[10px] font-bold text-gray-600 flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 font-black uppercase text-[8px] tracking-widest">Creator Profile</p>
                      <p className="text-xs text-[#141414] font-black uppercase mt-0.5">{selectedCreatorForPitch.creatorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 font-black uppercase text-[8px] tracking-widest">Calculated Engagement</p>
                      <p className="text-xs text-emerald-600 font-black mt-0.5">{selectedCreatorForPitch.engagement}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-400 font-black tracking-widest uppercase block">Personalized Email Draft</label>
                    <textarea
                      readOnly
                      rows={10}
                      value={generatedPitch}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold leading-relaxed text-gray-800 outline-none focus:ring-1 focus:ring-blue-500/10 font-mono"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPitch);
                        toast.success("Outreach pitch text copied to clipboard!");
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#141414] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      Copy Pitch Text
                    </button>
                    
                    <button
                      onClick={() => {
                        toast.success(`Opening integrated professional outreach chat with ${selectedCreatorForPitch.creatorName}!`);
                        setIsPitchModalOpen(false);
                      }}
                      className="flex-1 py-3 bg-black hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md"
                    >
                      Open Messages Chat &rarr;
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
         MODAL 2: PUBLISH NEW UGC SHOWCASE POST
         ========================================== */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-150 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <X className="w-4 h-4 text-gray-500 hover:text-black" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-black text-[#BEF264] flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#BEF264] stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-gray-400">Creator Studio</h3>
                  <h2 className="text-xl font-black text-[#141414] uppercase">Publish UGC Showcase</h2>
                </div>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <label className="text-[8px] text-gray-400 font-black tracking-widest uppercase block mb-1">Niche Category</label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-[#141414] outline-none"
                    >
                      {categories.filter(c => c !== "All").map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <label className="text-[8px] text-gray-400 font-black tracking-widest uppercase block mb-1">Media Type</label>
                    <select
                      value={newPostMediaType}
                      onChange={(e) => setNewPostMediaType(e.target.value as any)}
                      className="w-full bg-transparent text-xs font-bold text-[#141414] outline-none"
                    >
                      <option value="video">Video Showcase</option>
                      <option value="image">Image Snapshot</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                  <label className="text-[8px] text-gray-400 font-black tracking-widest uppercase block mb-1">Custom Media Cover URL (Optional)</label>
                  <input 
                    type="url"
                    placeholder="https://images.unsplash.com/... or blank for auto"
                    value={newPostMediaUrl}
                    onChange={(e) => setNewPostMediaUrl(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-[#141414] outline-none placeholder-gray-400"
                  />
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                  <label className="text-[8px] text-gray-400 font-black tracking-widest uppercase block mb-1">Caption Details</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Write your beautiful creative caption, campaign tags, and product description details..."
                    value={newPostCaption}
                    onChange={(e) => setNewPostCaption(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-gray-700 leading-relaxed outline-none placeholder-gray-400 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="px-6 py-2 bg-[#BEF264] text-black font-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#a5df48] disabled:opacity-50 transition-all shadow-md"
                  >
                    {submittingPost ? "Publishing..." : "Publish Post"}
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
