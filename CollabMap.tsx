import React, { useState, useEffect } from "react";
import { 
  MapPin, Camera, Video, Users, Sliders, Send, Star, 
  Check, Compass, Info, Phone, Mail, Award, ArrowRight,
  ExternalLink, Calendar, DollarSign, MessageSquare, AlertCircle, Sparkles, CheckCircle2, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

// API Key setup following skill guidelines
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

interface LocationItem {
  id: number;
  name: string;
  type: "studio" | "photographer" | "creator";
  rating: number;
  reviews: number;
  city: "riyadh" | "dubai" | "cairo" | "ksa" | "uae" | "egy";
  lat: number;
  lng: number;
  distance: string;
  address: string;
  description: string;
  price: string;
  features: string[];
  portfolio: string[];
  contact: {
    phone: string;
    email: string;
    instagram: string;
  };
}

interface Proposal {
  id: string;
  partnerName: string;
  partnerType: string;
  city: string;
  format: string;
  date: string;
  message: string;
  budget: string;
  status: "Pending" | "Accepted" | "Negotiating";
  createdAt: string;
}

// Highly realistic and visually stunning location profiles
const locationsData: LocationItem[] = [
  // --- Riyadh (Center: 24.7136, 46.6753) ---
  {
    id: 1,
    name: "Aura Soundstage & Production Studio",
    type: "studio",
    rating: 4.9,
    reviews: 58,
    city: "riyadh",
    lat: 24.7180,
    lng: 46.6850,
    distance: "1.4 km",
    address: "Al Olaya District, Creative Arts Block, Riyadh",
    description: "Premium soundproofed studio featuring state-of-the-art acoustic design, 4K multi-camera rig setups, high-fidelity podcast microphones, and a customizable RGB lighting stage. Ideal for high-end SaaS product demos, unboxing reels, and dynamic voiceovers.",
    price: "$180/hr",
    features: ["Acoustic Soundproofing", "4K Red Gemini Cameras", "Chroma Key Stage", "Dolby Audio Tech"],
    portfolio: [
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80"
    ],
    contact: { phone: "+966 50 123 4567", email: "bookings@aurastage.sa", instagram: "@aura.soundstage" }
  },
  {
    id: 2,
    name: "Neon Horizon GreenScreen & Podcast Lab",
    type: "studio",
    rating: 4.7,
    reviews: 34,
    city: "riyadh",
    lat: 24.7050,
    lng: 46.6620,
    distance: "2.1 km",
    address: "Al Sulaimaniyah, Creative Lane 12, Riyadh",
    description: "The ultimate cozy hub for podcasters, streamers, and green-screen composers. Equipped with multi-cam live-streaming desks, dynamic teleprompters, and custom spatial audio engineering plugins. Perfect for tech roundtables and product reviews.",
    price: "$120/hr",
    features: ["Pre-lit Green Screen", "Rodecaster Pro Mixers", "Live Stream Setup", "Dynamic Teleprompters"],
    portfolio: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80",
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80"
    ],
    contact: { phone: "+966 55 987 6543", email: "stream@neonhorizon.co", instagram: "@neon.horizon.lab" }
  },
  {
    id: 3,
    name: "Lina Al-Farsi - Creative Portrait Photographer",
    type: "photographer",
    rating: 4.8,
    reviews: 41,
    city: "riyadh",
    lat: 24.7250,
    lng: 46.6580,
    distance: "2.6 km",
    address: "Al Yasmin District, Block B, Riyadh",
    description: "Award-winning editorial and fashion portrait photographer. Specializing in crisp skincare macro loops, luxury apparel styling shoots, and authentic, warm-lit editorial lifestyle compositions for high-ticket brand partnerships.",
    price: "$350/session",
    features: ["Sony A7R V Gear", "Professional Studio Flash", "Custom Color Grading", "Skincare Macro Focus"],
    portfolio: [
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80",
      "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
    ],
    contact: { phone: "+966 53 456 7890", email: "lina@farsiphotos.com", instagram: "@lina.alfarsi" }
  },
  {
    id: 4,
    name: "Tariq Khalid - Cinematic Videographer & Colorist",
    type: "photographer",
    rating: 4.9,
    reviews: 63,
    city: "riyadh",
    lat: 24.7310,
    lng: 46.6950,
    distance: "3.5 km",
    address: "An Nakheel District, Parkside Road, Riyadh",
    description: "High-end commercial videographer and certified DaVinci Resolve colorist. Specializing in tactile, atmospheric ASMR unboxing visuals, extreme slow-motion lifestyle reels, and high-conversion social hook design for cosmetic campaigns.",
    price: "$500/day",
    features: ["RED Komodo 6K", "Sachtler Tripods", "Pro-Grade Color Grading", "Macro Probe Lens"],
    portfolio: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
      "https://images.unsplash.com/photo-1481134554430-ec3d2d474026?w=400&q=80"
    ],
    contact: { phone: "+966 50 888 1122", email: "tariq@cinegrade.co", instagram: "@tariq.khalid.cine" }
  },
  {
    id: 5,
    name: "Amara S. - Lifestyle & Beauty Creator",
    type: "creator",
    rating: 4.9,
    reviews: 112,
    city: "riyadh",
    lat: 24.6980,
    lng: 46.6790,
    distance: "1.9 km",
    address: "Al Malqa District, Riyadh",
    description: "Premium UGC creator and digital storyteller with 350K+ followers. Creates authentic skincare routines, lifestyle aesthetic vlogs, and tactile ASMR beauty tutorials that drive high-ticket audience conversions. Looking to collaborate with videographers.",
    price: "$600/collab",
    features: ["Esthetic Vlogging Style", "ASMR Audio Focus", "350k Social Reach", "Middle-East Skincare Niche"],
    portfolio: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    ],
    contact: { phone: "+966 56 444 3322", email: "collabs@amara.me", instagram: "@amara.creates" }
  },
  {
    id: 6,
    name: "Faisal Al-Otaibi - Tech & SaaS Reviewer",
    type: "creator",
    rating: 4.8,
    reviews: 79,
    city: "riyadh",
    lat: 24.7090,
    lng: 46.7110,
    distance: "3.9 km",
    address: "Al Mursalat, Riyadh",
    description: "Tech educator and professional software reviewer. Focuses on premium screen-casts, clean SaaS workflow tutorial reels, and productivity app walk-throughs. Interested in partnering with local production studios for high-fidelity audio.",
    price: "$450/collab",
    features: ["SaaS Screen-Casting", "Clean Minimalist Edits", "Active Tech Community", "Dual-Language Delivery"],
    portfolio: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80"
    ],
    contact: { phone: "+966 54 222 9900", email: "faisal@techsaas.com", instagram: "@faisal.reviews" },
  },

  // --- Dubai (Center: 25.2048, 55.2708) ---
  {
    id: 7,
    name: "Dubai Marina Creator Loft",
    type: "studio",
    rating: 4.9,
    reviews: 84,
    city: "dubai",
    lat: 25.2120,
    lng: 55.2810,
    distance: "1.2 km",
    address: "Marina Boulevard, Tower 4, Dubai",
    description: "Ultra-modern sky loft studio with panoramic views of the Dubai Marina skyline. Fully equipped with multi-point key lights, premium ring lights, professional gimbal gear, and custom high-contrast backdrop rolls.",
    price: "$250/hr",
    features: ["Panoramic Skyline View", "Aputure Studio Lighting", "DJI Ronin Gimbals", "High-Contrast Backdrops"],
    portfolio: [
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80"
    ],
    contact: { phone: "+971 4 123 4567", email: "loft@dubaimarina.ae", instagram: "@marinacreatorloft" }
  },
  {
    id: 8,
    name: "Pixel Perfect Soundstage & Cyclorama",
    type: "studio",
    rating: 4.8,
    reviews: 49,
    city: "dubai",
    lat: 25.1950,
    lng: 55.2600,
    distance: "1.8 km",
    address: "Al Quoz Creative Zone, Block G, Dubai",
    description: "Gigantic double-height cyclorama studio wall with custom overhead lighting rails and acoustic dampening. Best suited for high-production apparel showcase campaigns, product group shots, and cinematic brand intros.",
    price: "$200/hr",
    features: ["White Cyclorama Wall", "Overhead Rig System", "Silent HVAC System", "Make-up & Prep Station"],
    portfolio: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80"
    ],
    contact: { phone: "+971 50 111 2222", email: "bookings@pixelperfect.co", instagram: "@pixelperfect.ae" }
  },
  {
    id: 9,
    name: "Yousef Al-Mansoori - Luxury Brand Photographer",
    type: "photographer",
    rating: 4.9,
    reviews: 52,
    city: "dubai",
    lat: 25.2210,
    lng: 55.2550,
    distance: "2.3 km",
    address: "Downtown Boulevard, Block 4A, Dubai",
    description: "Specialized in luxury timepiece, luxury real estate, and high-fashion automotive catalog visuals. Known for exquisite natural light manipulation and masterfully graded premium product imagery.",
    price: "$750/session",
    features: ["Hasselblad Medium Format", "Natural Light Expertise", "Luxury Product Styling", "Rapid 48hr Turnaround"],
    portfolio: [
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&q=80"
    ],
    contact: { phone: "+971 52 777 8888", email: "yousef@mansooriphoto.ae", instagram: "@yousef.mansoori" }
  },
  {
    id: 10,
    name: "Sophia Rose - Cosmetic Videographer",
    type: "photographer",
    rating: 4.7,
    reviews: 36,
    city: "dubai",
    lat: 25.2340,
    lng: 55.2910,
    distance: "3.6 km",
    address: "Jumeirah Beach Road, Villa 18, Dubai",
    description: "Elite social video capture specialist. Focuses on ultra-slick skincare loops, beautiful cosmetic unboxings, and responsive micro-content with custom text track overlays that increase brand click-through-rates by up to 30%.",
    price: "$600/day",
    features: ["Macro Probe Lenses", "Glow Ring-Light Rigs", "Micro-Hook Specialist", "Text Overlay Animations"],
    portfolio: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80",
      "https://images.unsplash.com/photo-1481134554430-ec3d2d474026?w=400&q=80"
    ],
    contact: { phone: "+971 55 444 8811", email: "sophia@cosmicloops.com", instagram: "@sophia.rose.media" }
  },
  {
    id: 11,
    name: "Zainab - ASMR Soundscape Artist",
    type: "creator",
    rating: 4.9,
    reviews: 94,
    city: "dubai",
    lat: 25.1880,
    lng: 55.2720,
    distance: "2.0 km",
    address: "Business Bay, Executive Suites, Dubai",
    description: "High-engagement ASMR and tactile sound designer. Creates incredibly soothing unboxings, keyboard click tracks, and product friction audio loops using premium binaural 3D microphones. Eager to collaborate with production spaces for quiet capture.",
    price: "$500/collab",
    features: ["Binaural 3D Microphones", "High-Fidelity Soundboards", "94% Audience Retention", "Tactile Prop Collection"],
    portfolio: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    ],
    contact: { phone: "+971 56 333 4444", email: "zainab@soundscapes.ae", instagram: "@zainab.asmr" }
  },
  {
    id: 12,
    name: "Daniel Kim - Menswear & Lifestyle Creator",
    type: "creator",
    rating: 4.8,
    reviews: 65,
    city: "dubai",
    lat: 25.2010,
    lng: 55.3080,
    distance: "3.9 km",
    address: "Dubai Design District (D3), Dubai",
    description: "Fashion-forward menswear styling creator. Develops ultra-sharp get-ready-with-me transition reels and aesthetic daily outfit grids. Looking to shoot with high-end editorial portrait photographers in Downtown Dubai.",
    price: "$550/collab",
    features: ["Transitions Specialist", "High-Aesthetic Apparel Grid", "D3 Creative Network", "Dapper Styling Lens"],
    portfolio: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80"
    ],
    contact: { phone: "+971 54 999 0011", email: "daniel@styleloft.ae", instagram: "@daniel.kim.style" }
  },

  // --- Cairo (Center: 30.0444, 31.2357) ---
  {
    id: 13,
    name: "Maadi Creative Base & Studio",
    type: "studio",
    rating: 4.8,
    reviews: 42,
    city: "cairo",
    lat: 30.0520,
    lng: 31.2410,
    distance: "1.1 km",
    address: "Road 9, Maadi Arts Quarter, Cairo",
    description: "A cozy, sun-drenched industrial brick loft configured with professional overhead lighting grids, wooden tables, retro props, and premium dynamic recording kits. Highly recommended for vintage product shoots.",
    price: "$90/hr",
    features: ["Natural Brick Loft", "Vintage Retro Props", "Dynamic Podcast Kits", "Overhead Softboxes"],
    portfolio: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80",
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80"
    ],
    contact: { phone: "+20 100 123 4567", email: "maadi@creativebase.eg", instagram: "@maadi.creative" }
  },
  {
    id: 14,
    name: "District 5 Interactive Soundstage",
    type: "studio",
    rating: 4.9,
    reviews: 31,
    city: "cairo",
    lat: 30.0350,
    lng: 31.2220,
    distance: "1.5 km",
    address: "District 5 Hub, Building C, New Cairo",
    description: "Ultra-modern studio facility featuring acoustic isolation booths, high-speed 10Gbps fiber for direct live-streaming setups, professional stage wedges, and full post-production suites available on demand.",
    price: "$140/hr",
    features: ["Fiber Live-Streaming Desk", "Acoustic Isolation Booths", "Pre-installed Post-Suites", "Overhead Spotlights"],
    portfolio: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80"
    ],
    contact: { phone: "+20 111 888 7777", email: "d5@soundstage.eg", instagram: "@district5stage" }
  },
  {
    id: 15,
    name: "Yasmine Hegazi - Fine Art Portrait Photographer",
    type: "photographer",
    rating: 4.9,
    reviews: 48,
    city: "cairo",
    lat: 30.0610,
    lng: 31.2180,
    distance: "2.1 km",
    address: "Zamalek Arts Avenue, Cairo",
    description: "Exceptional fine art and cultural portrait photographer. Celebrated for rich, moody contrast lighting, artistic framing, and deep, narrative-driven visual storytelling.",
    price: "$250/session",
    features: ["Fujifilm GFX 100S", "Fine Art Contrast Styling", "Historical Prop Integration", "Digital Portfolio Booklet"],
    portfolio: [
      "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
    ],
    contact: { phone: "+20 122 345 6789", email: "yasmine@zamalekfine.com", instagram: "@yasmine.hegazi" }
  },
  {
    id: 16,
    name: "Sherif Kamal - Commercial Videographer",
    type: "photographer",
    rating: 4.8,
    reviews: 29,
    city: "cairo",
    lat: 30.0680,
    lng: 31.2550,
    distance: "3.2 km",
    address: "Heliopolis Creative Block, Cairo",
    description: "Commercial cinematographer specializing in fast-cut product unboxing reels, dynamic restaurant food styling streams, and crisp corporate storytelling for middle-east scale SaaS clients.",
    price: "$300/day",
    features: ["Sony FX3 Cinema Rig", "Fast-Cut Editing Method", "Tasty Food Styling Lens", "Wireless Audio Capture"],
    portfolio: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80",
      "https://images.unsplash.com/photo-1481134554430-ec3d2d474026?w=400&q=80"
    ],
    contact: { phone: "+20 109 555 1212", email: "sherif@heliocine.co", instagram: "@sherif.kamal.cine" }
  },
  {
    id: 17,
    name: "Malak - Skincare & Aesthetic Creator",
    type: "creator",
    rating: 4.9,
    reviews: 82,
    city: "cairo",
    lat: 30.0280,
    lng: 31.2390,
    distance: "1.9 km",
    address: "El Sheikh Zayed, Cairo",
    description: "Leading beauty and wellness lifestyle blogger. Known for crisp, high-contrast morning-routine clips, soothing tactile skincare sound loops, and dual-language product reviews. Looking to partner with portrait photographers in Zamalek.",
    price: "$350/collab",
    features: ["Morning Routine Aesthetic", "Dual-Language (AR/EN)", "High Conversion Reels", "180k Engaged Audience"],
    portfolio: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    ],
    contact: { phone: "+20 115 777 9900", email: "malak@aesthetic.me", instagram: "@malak.wellness" }
  },
  {
    id: 18,
    name: "Karim - Street & Travel Storyteller",
    type: "creator",
    rating: 4.7,
    reviews: 53,
    city: "cairo",
    lat: 30.0410,
    lng: 31.2680,
    distance: "3.1 km",
    address: "Downtown Heritage Quarter, Cairo",
    description: "Street culture and narrative travel creator with 120K+ followers. Documents beautiful heritage walks, local food discoveries, and cinematic architectural loops. Looking for dynamic videographers for drone shoot assistance.",
    price: "$400/collab",
    features: ["Street Heritage Lens", "Drone Capture Needs", "Aesthetic Food Walk Vlogs", "Engaged Local Base"],
    portfolio: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80"
    ],
    contact: { phone: "+20 120 444 5555", email: "karim@streetstories.eg", instagram: "@karim.walks" }
  },
  {
    id: 19,
    name: "Red Sea Soundstage & Production Hub",
    type: "studio",
    rating: 4.9,
    reviews: 46,
    city: "ksa",
    lat: 21.5433,
    lng: 39.1728,
    distance: "1.2 km",
    address: "Corniche Road, Creative Zone, Jeddah",
    description: "Premium state-of-the-art acoustic soundstage on the beautiful Jeddah Corniche. Fully integrated with RED Komodo cinema cameras, spatial audio mics, green screens, and full professional lighting rigs. Ideal for luxury advertising and cosmetic vlogs.",
    price: "$195/hr",
    features: ["Acoustic Soundproofing", "RED Komodo Cameras", "Ocean View Lounge", "Dolby Audio Tech"],
    portfolio: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80"
    ],
    contact: { phone: "+966 50 777 1234", email: "jeddah@soundstage.sa", instagram: "@redsea.soundstage" }
  },
  {
    id: 20,
    name: "Hassan Salem - Street & Portrait Photographer",
    type: "photographer",
    rating: 4.8,
    reviews: 32,
    city: "ksa",
    lat: 21.5164,
    lng: 39.1834,
    distance: "2.4 km",
    address: "Al-Hamra District, Jeddah",
    description: "Award-winning street culture and high-fashion portrait photographer based in Jeddah. Renowned for rich Golden Hour lighting, architectural contrast framing, and professional DaVinci Resolve color styling.",
    price: "$320/session",
    features: ["Fujifilm GFX 100S", "Natural Golden Hour Focus", "High-End Retouching", "Dual-Language Delivery"],
    portfolio: [
      "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
    ],
    contact: { phone: "+966 53 111 8899", email: "hassan@salemphoto.sa", instagram: "@hassan.salem.ph" }
  },
  {
    id: 21,
    name: "Yasmin J. - Tech & Travel Vlog Creator",
    type: "creator",
    rating: 4.9,
    reviews: 74,
    city: "ksa",
    lat: 21.4925,
    lng: 39.2124,
    distance: "3.8 km",
    address: "Al Rawdah District, Jeddah",
    description: "Highly engaged travel, lifestyle, and consumer tech creator with 220K+ active followers. Produces crisp high-definition transition reels, unboxing aesthetics, and software guides. Looking to rent studio spaces for hardware reviews.",
    price: "$450/collab",
    features: ["Slick Video Transitions", "Unboxing Sound Rigs", "Active GCC Community", "4K HDR Master Delivery"],
    portfolio: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    ],
    contact: { phone: "+966 55 222 7711", email: "collabs@yasmincreates.com", instagram: "@yasmin.j.creates" }
  },
  {
    id: 22,
    name: "Yas Island Creators Space",
    type: "studio",
    rating: 4.9,
    reviews: 55,
    city: "uae",
    lat: 24.4981,
    lng: 54.6053,
    distance: "1.5 km",
    address: "Yas Creative Hub, Abu Dhabi",
    description: "The ultimate modern production sandbox. Offers double-height professional acoustic rooms, green-screen soundstages, high-end multi-cam setups, and premium spatial podcast tables with dedicated livestream soundboards.",
    price: "$220/hr",
    features: ["Acoustic Soundproofing", "4K Live Stream Rig", "Green Screen cyclorama", "Podcast Round-Table"],
    portfolio: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80"
    ],
    contact: { phone: "+971 2 666 5555", email: "yas@creatorsspace.ae", instagram: "@yas.creators.hub" }
  },
  {
    id: 23,
    name: "Khalid Mansoor - Aerial Cinematic Photographer",
    type: "photographer",
    rating: 4.8,
    reviews: 39,
    city: "uae",
    lat: 24.4539,
    lng: 54.3773,
    distance: "2.1 km",
    address: "Al Bateen Area, Abu Dhabi",
    description: "Premium aerial videographer and commercial drone specialist. Fully licensed with high-end DJI Inspire 3 rigs for majestic real-estate and city skyline cinematography. Eager to collaborate with local content producers.",
    price: "$650/day",
    features: ["DJI Inspire 3 Drone", "Certified Drone Pilot", "4K ProRes Raw Video", "Panoramic City Capture"],
    portfolio: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
      "https://images.unsplash.com/photo-1481134554430-ec3d2d474026?w=400&q=80"
    ],
    contact: { phone: "+971 50 888 3344", email: "khalid@mansoordrones.ae", instagram: "@khalid.mansoor.cine" }
  },
  {
    id: 24,
    name: "Noora Al-Suwaidi - Beauty & Fashion Creator",
    type: "creator",
    rating: 4.9,
    reviews: 108,
    city: "uae",
    lat: 24.4285,
    lng: 54.4124,
    distance: "3.5 km",
    address: "Saadiyat Island, Abu Dhabi",
    description: "Premium lifestyle, luxury beauty, and high-apparel UGC creator with 450K+ combined audience. Creates highly aesthetic, serene morning routine vlogs and beauty reviews. Seeking high-ticket photographer partnerships on Saadiyat Island.",
    price: "$550/collab",
    features: ["Saadiyat Island Aesthetic", "ASMR Skincare Focus", "High Engagement Audience", "450k Combined Base"],
    portfolio: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    ],
    contact: { phone: "+971 56 111 2299", email: "collabs@nooralsuwaidi.ae", instagram: "@noora.suwaidi" }
  },
  {
    id: 25,
    name: "Pharos Sound & Visual Arts Lab",
    type: "studio",
    rating: 4.8,
    reviews: 29,
    city: "egy",
    lat: 31.2001,
    lng: 29.9187,
    distance: "1.4 km",
    address: "Fouad Street, Alexandria",
    description: "Sun-drenched visual arts studio in a classic historical building on Fouad Street. Styled with high-contrast wooden panels, vintage props, professional overhead softboxes, and premium Shure dynamic microphones. Exceptional space for cozy podcasts.",
    price: "$85/hr",
    features: ["Vintage Heritage Architecture", "Professional Softboxes", "Shure Podcasting Mics", "Comfortable Seating Lounge"],
    portfolio: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80",
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80"
    ],
    contact: { phone: "+20 100 999 8811", email: "pharos@artslab.eg", instagram: "@pharos.visuals" }
  },
  {
    id: 26,
    name: "Alexandria Port Marine Photographer",
    type: "photographer",
    rating: 4.7,
    reviews: 21,
    city: "egy",
    lat: 31.2134,
    lng: 29.9321,
    distance: "2.6 km",
    address: "Al-Raml Station District, Alexandria",
    description: "Creative visual chronicler specializing in atmospheric ocean-side portrait sessions, marine lifestyles, and high-contrast street aesthetic storytelling. Known for warm seaside tones and professional quick delivery.",
    price: "$180/session",
    features: ["Sony A7 IV Gear", "Seaside Sunset Specialist", "Atmospheric Editing", "Quick 48hr Delivery"],
    portfolio: [
      "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
    ],
    contact: { phone: "+20 122 777 6622", email: "marine@alexphotos.com", instagram: "@alex.marine.ph" }
  },
  {
    id: 27,
    name: "Omar El-Masry - Food & Cultural Documentarian",
    type: "creator",
    rating: 4.9,
    reviews: 63,
    city: "egy",
    lat: 31.1894,
    lng: 29.8974,
    distance: "3.2 km",
    address: "Smouha District, Alexandria",
    description: "Passionate culinary storyteller, street food reviewer, and cultural vlogger with 190K+ active fans. Produces deeply atmospheric, high-retention cinematic food reels. Seeking collaboration with high-end food videographers in Alexandria.",
    price: "$300/collab",
    features: ["Cinematic Culinary Tone", "High Retention Reels", "Aesthetic Heritage Walk", "190k Local Followers"],
    portfolio: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80"
    ],
    contact: { phone: "+20 111 333 4488", email: "omar@masryeats.eg", instagram: "@omar.elmasry.eats" }
  }
];

export interface CollabMapProps {
  selectedRegion?: "all" | "egy" | "uae" | "ksa";
  onRegionChange?: (region: "all" | "egy" | "uae" | "ksa") => void;
}

export default function CollabMap({ selectedRegion = "all", onRegionChange }: CollabMapProps = {}) {
  const [activeTab, setActiveTab] = useState<"listings" | "proposals">("listings");
  const [selectedCity, setSelectedCity] = useState<"riyadh" | "dubai" | "cairo" | "ksa" | "uae" | "egy">("riyadh");
  const [selectedType, setSelectedType] = useState<"all" | "studio" | "photographer" | "creator">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState(15); // max radius filter in km
  
  // Selected partner details drawer
  const [selectedItem, setSelectedItem] = useState<LocationItem | null>(locationsData[0]);
  
  // Custom Collab Proposal Modal State
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [proposalDate, setProposalDate] = useState("");
  const [proposalFormat, setProposalFormat] = useState("Video Reel Shoot");
  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalBudget, setProposalBudget] = useState("");
  
  // Proposals local database (persisted in localStorage)
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync regional selection from parent Discover component
  useEffect(() => {
    if (selectedRegion && selectedRegion !== "all") {
      // Map region code to compatible city or region code
      if (selectedRegion === "egy") {
        setSelectedCity("egy");
      } else if (selectedRegion === "uae") {
        setSelectedCity("uae");
      } else if (selectedRegion === "ksa") {
        setSelectedCity("ksa");
      }
    }
  }, [selectedRegion]);

  const handleCityChange = (city: "riyadh" | "dubai" | "cairo" | "ksa" | "uae" | "egy") => {
    setSelectedCity(city);
    if (onRegionChange) {
      if (city === "riyadh" || city === "ksa") {
        onRegionChange("ksa");
      } else if (city === "dubai" || city === "uae") {
        onRegionChange("uae");
      } else if (city === "cairo" || city === "egy") {
        onRegionChange("egy");
      }
    }
  };

  useEffect(() => {
    // Sync default city when selectedItem changes or loads
    const saved = localStorage.getItem("cryova_collab_proposals");
    if (saved) {
      try {
        setProposals(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update selected item if city changes to keep valid bounds
  useEffect(() => {
    const cityItems = locationsData.filter(item => item.city === selectedCity);
    if (cityItems.length > 0) {
      setSelectedItem(cityItems[0]);
    }
  }, [selectedCity]);

  // Center coordinates for map focusing
  const cityCenters = {
    riyadh: { lat: 24.7136, lng: 46.6753 },
    dubai: { lat: 25.2048, lng: 55.2708 },
    cairo: { lat: 30.0444, lng: 31.2357 },
    ksa: { lat: 21.4858, lng: 39.1925 },
    uae: { lat: 24.4539, lng: 54.3773 },
    egy: { lat: 31.2001, lng: 29.9187 }
  };

  const center = cityCenters[selectedCity];

  // Filter logic
  const filteredItems = locationsData.filter((item) => {
    if (item.city !== selectedCity) return false;
    if (selectedType !== "all" && item.type !== selectedType) return false;
    
    // Parse distance number e.g. "2.6 km" -> 2.6
    const distVal = parseFloat(item.distance);
    if (distVal > maxDistance) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchAddress = item.address.toLowerCase().includes(q);
      const matchFeatures = item.features.some(f => f.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchAddress && !matchFeatures) return false;
    }
    return true;
  });

  // Handle Send Proposal
  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !proposalDate || !proposalMessage || !proposalBudget) {
      toast.error("Please fill in all details for your collaboration proposal!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newProposal: Proposal = {
        id: "PROP-" + Math.floor(1000 + Math.random() * 9000),
        partnerName: selectedItem.name,
        partnerType: selectedItem.type,
        city: selectedCity,
        format: proposalFormat,
        date: proposalDate,
        message: proposalMessage,
        budget: proposalBudget,
        status: "Pending",
        createdAt: new Date().toLocaleDateString()
      };

      const updated = [newProposal, ...proposals];
      setProposals(updated);
      localStorage.setItem("cryova_collab_proposals", JSON.stringify(updated));

      // Reset fields
      setProposalDate("");
      setProposalMessage("");
      setProposalBudget("");
      setShowCollabModal(false);
      setIsSubmitting(false);

      toast.success(`🎉 Collaboration pitch sent to ${selectedItem.name}! Status tracked in Proposals hub.`, {
        description: "They will review your metrics and reply via direct messages."
      });
    }, 1000);
  };

  // Helper coordinate mapping for vector radar fallback
  const getSvgCoords = (itemLat: number, itemLng: number, centerLat: number, centerLng: number) => {
    const latDiff = itemLat - centerLat;
    const lngDiff = itemLng - centerLng;
    
    // Scale and center mapping to dynamic SVG coordinates (0-100)
    // Riyadh offset scaling: ~x1200 matches coordinates within 5km radius beautifully
    const x = 50 + (lngDiff * 1400);
    const y = 50 - (latDiff * 1400); // Invert y screen axis
    
    return {
      x: `${Math.max(12, Math.min(88, x))}%`,
      y: `${Math.max(12, Math.min(88, y))}%`
    };
  };

  return (
    <div className="space-y-6">
      {/* Collab Hero Header */}
      <div className="bg-gradient-to-r from-purple-950 to-indigo-950 text-white p-6 md:p-8 rounded-3xl border border-purple-500/10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-[#BEF264] text-black text-[8px] font-black uppercase tracking-widest rounded">Aura Vicinity Engine</span>
            <span className="text-xs font-mono text-purple-300">Local Physical Collaboration Portal</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif italic font-bold">Creator Vicinity Hub</h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-2xl font-medium leading-relaxed">
            Find vetted local production soundstages, portrait photographers, and premium fellow creators in your immediate neighborhood. Seamlessly arrange co-studios, joint equipment sharing, and high-ticket physical collaborations.
          </p>
        </div>

        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab("listings")}
            className={cn(
              "flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "listings" ? "bg-white text-black shadow" : "text-gray-400 hover:text-white"
            )}
          >
            Explore Vicinity
          </button>
          <button
            onClick={() => setActiveTab("proposals")}
            className={cn(
              "flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "proposals" ? "bg-white text-[#141414] shadow" : "text-gray-400 hover:text-white"
            )}
          >
            My Active Pitches ({proposals.length})
          </button>
        </div>
      </div>

      {activeTab === "listings" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Search filters and Local listings list (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-wider text-[#141414] flex items-center gap-1">
                  <Compass className="w-4 h-4 text-purple-600 animate-spin-slow" /> Discover Vicinity
                </h3>
                <span className="text-[10px] font-bold text-gray-400 font-mono">{filteredItems.length} matching found</span>
              </div>

              {/* City selector & Search */}
              <div className="space-y-3">
                <div>
                  <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Cities</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["riyadh", "dubai", "cairo"] as const).map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCityChange(city)}
                        className={cn(
                          "py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                          selectedCity === city
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100"
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Regions / Countries</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["ksa", "uae", "egy"] as const).map((region) => (
                      <button
                        key={region}
                        onClick={() => handleCityChange(region)}
                        className={cn(
                          "py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                          selectedCity === region
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100"
                        )}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {/* Search text input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search studio name, camera rigs, creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black font-mono text-[10px]"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Category tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { id: "all", label: "All Hubs", icon: Compass },
                    { id: "studio", label: "Production Studios", icon: Video },
                    { id: "photographer", label: "Photographers", icon: Camera },
                    { id: "creator", label: "Fellow Creators", icon: Users }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedType(cat.id as any)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-tight border flex items-center gap-1.5 transition-all cursor-pointer",
                        selectedType === cat.id
                          ? "bg-black text-white border-black"
                          : "bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100"
                      )}
                    >
                      <cat.icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Radius distance filter */}
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                    <span>Immediate Vicinity Distance</span>
                    <span className="text-purple-600 font-mono font-black">{maxDistance} KM</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                    className="w-full accent-purple-600 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Scrollable list of local matches */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredItems.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-gray-150 text-center space-y-2 shadow-sm">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-black text-[#141414] uppercase tracking-wide">No Local Partners Found</p>
                  <p className="text-[10px] text-gray-400 font-semibold max-w-xs mx-auto leading-normal">
                    Try expanding your search distance radius slider, clearing filters, or switching cities above.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "p-4 rounded-3xl border text-left cursor-pointer transition-all flex gap-4 items-start relative overflow-hidden",
                      selectedItem?.id === item.id
                        ? "bg-purple-50/40 border-purple-200 shadow-sm"
                        : "bg-white border-gray-150 hover:border-purple-150 hover:shadow-xs"
                    )}
                  >
                    {selectedItem?.id === item.id && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-purple-500/10 rounded-bl-3xl flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                    )}
                    {/* Visual Thumb representation */}
                    <img
                      src={item.portfolio[0]}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100 mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn(
                          "px-2 py-0.5 text-[8px] font-black uppercase rounded",
                          item.type === "studio" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                          item.type === "photographer" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        )}>
                          {item.type}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 font-mono flex items-center gap-0.5">
                          📍 {item.distance}
                        </span>
                      </div>
                      
                      <h4 className="font-black text-sm text-[#141414] tracking-tight leading-snug line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 font-medium line-clamp-2 leading-normal">{item.description}</p>
                      
                      <div className="pt-2 flex justify-between items-center flex-wrap gap-2">
                        <span className="font-mono text-[10px] font-black text-[#141414]">{item.price}</span>
                        <span className="text-[9px] font-bold text-gray-400 flex items-center gap-0.5">
                          ★ {item.rating} ({item.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Premium Map Interface & Highlights (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Interactive Map Component Container */}
            <div className="bg-white rounded-3xl border border-gray-150 p-3 shadow-sm overflow-hidden relative">
              
              {/* Optional Real Google Maps API Integration */}
              {hasValidKey ? (
                <div className="h-[360px] rounded-2xl overflow-hidden relative border border-gray-100">
                  <APIProvider apiKey={API_KEY} version="weekly">
                    <Map
                      defaultCenter={center}
                      center={center}
                      defaultZoom={12}
                      mapId="CRY_LOCATOR_MAP_ID"
                      internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                      style={{ width: "100%", height: "100%" }}
                    >
                      {/* Plot all matching vicinity locations */}
                      {filteredItems.map((pinItem) => (
                        <AdvancedMarker
                          key={pinItem.id}
                          position={{ lat: pinItem.lat, lng: pinItem.lng }}
                          onClick={() => setSelectedItem(pinItem)}
                        >
                          <Pin
                            background={
                              pinItem.id === selectedItem?.id ? "#8B5CF6" :
                              pinItem.type === "studio" ? "#3B82F6" :
                              pinItem.type === "photographer" ? "#F59E0B" :
                              "#10B981"
                            }
                            borderColor={pinItem.id === selectedItem?.id ? "#fff" : "transparent"}
                            glyphColor="#fff"
                            scale={pinItem.id === selectedItem?.id ? 1.2 : 1.0}
                          />
                        </AdvancedMarker>
                      ))}
                    </Map>
                  </APIProvider>
                </div>
              ) : (
                /* Premium Concentric Radar & Vector Grid Fallback Map */
                <div className="bg-zinc-950 h-[360px] rounded-2xl overflow-hidden relative border border-zinc-800 flex flex-col justify-between p-4 group">
                  {/* Subtle Grid overlay background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />
                  
                  {/* Glowing Radar sweeps and target rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-zinc-800 rounded-full pointer-events-none opacity-40" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 border border-dashed border-zinc-800 rounded-full pointer-events-none opacity-40" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-zinc-800 rounded-full pointer-events-none opacity-40" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500/20 rounded-full animate-ping pointer-events-none" />
                  
                  {/* Floating API notice banner (Skill Requirement C) */}
                  <div className="relative z-10 bg-zinc-900/95 border border-zinc-800 text-zinc-300 p-3 rounded-xl flex items-start gap-2.5 text-[10px] leading-relaxed max-w-lg mx-auto shadow-lg backdrop-blur">
                    <Info className="w-4 h-4 text-[#BEF264] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-black text-white uppercase tracking-wider text-[9px]">Google Maps Platform Key Inactive</p>
                      <p className="font-semibold text-zinc-400">
                        Pulsing active coordinates inside Saudi Arabia, Cairo, and Dubai. Enter your <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> in Settings (⚙️) → Secrets to mount real live interactive geographic maps.
                      </p>
                    </div>
                  </div>

                  {/* Pulsating local pins on vector space */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" style={{ pointerEvents: "auto" }}>
                      {/* Plot coordinates mapped dynamically into SVG box */}
                      {filteredItems.map((item) => {
                        const coords = getSvgCoords(item.lat, item.lng, center.lat, center.lng);
                        const isSelected = selectedItem?.id === item.id;
                        return (
                          <g
                            key={item.id}
                            transform={`translate(0, 0)`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                            className="cursor-pointer group/pin"
                            style={{ pointerEvents: "auto" }}
                          >
                            {/* Pulse Circle */}
                            <circle
                              cx={coords.x}
                              cy={coords.y}
                              r={isSelected ? "14" : "8"}
                              fill={
                                item.type === "studio" ? "#3B82F6" :
                                item.type === "photographer" ? "#F59E0B" :
                                "#10B981"
                              }
                              opacity={isSelected ? "0.3" : "0.15"}
                              className={cn(isSelected && "animate-pulse")}
                            />
                            {/* Inner Dot Pin */}
                            <circle
                              cx={coords.x}
                              cy={coords.y}
                              r={isSelected ? "6" : "4.5"}
                              fill={
                                isSelected ? "#8B5CF6" :
                                item.type === "studio" ? "#3B82F6" :
                                item.type === "photographer" ? "#F59E0B" :
                                "#10B981"
                              }
                              stroke="#ffffff"
                              strokeWidth={isSelected ? "1.5" : "1"}
                            />
                            {/* Floating tooltip label on hover */}
                            <g transform={`translate(0, -12)`} className="opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none">
                              <rect
                                x={`calc(${coords.x} - 50px)`}
                                y={`calc(${coords.y} - 25px)`}
                                width="100"
                                height="20"
                                rx="5"
                                fill="#18181b"
                                stroke="#3f3f46"
                                strokeWidth="1"
                              />
                              <text
                                x={coords.x}
                                y={`calc(${coords.y} - 12px)`}
                                fill="#ffffff"
                                fontSize="7.5"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {item.name.slice(0, 16)}...
                              </text>
                            </g>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Aesthetic grid coordinate tags */}
                  <div className="relative z-10 flex justify-between text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest pt-2">
                    <span>Center: {center.lat.toFixed(4)}° N, {center.lng.toFixed(4)}° E</span>
                    <span>Zone: CRYOVA-Grid-Sec-{selectedCity.toUpperCase()}</span>
                  </div>
                </div>
              )}

              {/* Quick statistics layout bar at base of Map */}
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-gray-100 mt-2 text-center">
                <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[8px] font-black uppercase text-gray-400 block tracking-wider">Soundstages</span>
                  <span className="text-sm font-black text-blue-600 font-mono">
                    {filteredItems.filter(p => p.type === "studio").length} Active
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[8px] font-black uppercase text-gray-400 block tracking-wider">Photographers</span>
                  <span className="text-sm font-black text-amber-600 font-mono">
                    {filteredItems.filter(p => p.type === "photographer").length} Active
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[8px] font-black uppercase text-gray-400 block tracking-wider">Local Creators</span>
                  <span className="text-sm font-black text-emerald-600 font-mono">
                    {filteredItems.filter(p => p.type === "creator").length} Active
                  </span>
                </div>
              </div>
            </div>

            {/* Right bottom detail view of the currently highlighted partner */}
            {selectedItem && (
              <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="space-y-1">
                    <span className={cn(
                      "px-2 py-0.5 text-[8px] font-black uppercase rounded",
                      selectedItem.type === "studio" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      selectedItem.type === "photographer" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    )}>
                      Selected Partner Profile
                    </span>
                    <h3 className="text-xl font-serif italic font-bold text-[#141414]">{selectedItem.name}</h3>
                    <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> {selectedItem.address}
                    </p>
                  </div>

                  <div className="bg-purple-50 px-4 py-2.5 border border-purple-100 rounded-2xl text-right">
                    <span className="text-[8px] font-black uppercase text-purple-400 block tracking-widest">Rate Card</span>
                    <span className="font-serif italic font-black text-lg text-purple-950">{selectedItem.price}</span>
                  </div>
                </div>

                {/* About Bio */}
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{selectedItem.description}</p>

                {/* Portfolio Showcase Grid */}
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Studio & Equipment / Portfolio Gallery</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedItem.portfolio.map((img, i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 relative group">
                        <img src={img} alt="Showcase" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features Badges */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Features & Amenities Included</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.features.map((feat, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-[9px] font-bold border border-gray-150 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact information details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-mono text-[11px]">{selectedItem.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate text-[11px]">{selectedItem.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-[11px] text-purple-600">{selectedItem.contact.instagram}</span>
                  </div>
                </div>

                {/* Send Pitch CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowCollabModal(true)}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 animate-bounce-horizontal" />
                    <span>Send Collaboration Proposal Pitch</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Pitch / Proposal Tracking Dashboard */
        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-serif italic font-bold text-[#141414]">Active Collaboration Pitches</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Track physical co-studio bookings, unboxing shoots, and creator meets.</p>
            </div>
            <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-100">
              Zero Commission Escrow Protected
            </span>
          </div>

          {proposals.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Compass className="w-10 h-10 text-gray-300 mx-auto animate-pulse" />
              <p className="text-xs font-black text-[#141414] uppercase tracking-wider">No Pitches Sent Yet</p>
              <p className="text-[10px] text-gray-400 font-semibold max-w-xs mx-auto leading-normal">
                Go back to the listings map, click on a local studio or creator, and send them a co-studio or physical shoot proposal to kick off your collab!
              </p>
              <button
                onClick={() => setActiveTab("listings")}
                className="mt-2 px-5 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all cursor-pointer"
              >
                Go Explore Listings Map
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="p-5 bg-gray-50/50 border border-gray-150 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-200 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-[#141414] font-mono bg-white border border-gray-200 px-2 py-0.5 rounded-lg">
                        {prop.id}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 text-[8px] font-black uppercase rounded",
                        prop.partnerType === "studio" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        prop.partnerType === "photographer" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      )}>
                        {prop.partnerType}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 font-mono">
                        📍 {prop.city.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-black text-base text-[#141414]">{prop.partnerName}</h4>
                    <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> Proposed Date: {prop.date} ● Format: {prop.format}
                    </p>
                    <p className="text-[11px] text-gray-400 italic max-w-xl font-medium">"{prop.message}"</p>
                  </div>

                  <div className="flex md:flex-col items-end justify-between md:justify-center w-full md:w-auto shrink-0 gap-3 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[8px] font-black uppercase text-gray-400 block tracking-widest">Offered Compensation</span>
                      <span className="font-mono text-sm font-black text-purple-950">{prop.budget}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl">
                        {prop.status} Review
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collaboration Pitch Overlay Modal Form */}
      {showCollabModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowCollabModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500 hover:text-black font-bold text-sm cursor-pointer"
            >
              ×
            </button>

            <div>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-[8px] font-black uppercase tracking-widest rounded border border-purple-100">
                Co-Lab Proposal Form
              </span>
              <h3 className="text-xl font-serif italic font-bold text-[#141414] mt-1">Pitch {selectedItem.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Physical location vicinity: {selectedItem.address}</p>
            </div>

            <form onSubmit={handleSendProposal} className="space-y-4">
              {/* Proposal Format Selection */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Collaboration Format</label>
                <select
                  value={proposalFormat}
                  onChange={(e) => setProposalFormat(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Video Reel Shoot">Video Reel Shoot (Joint Creative Content)</option>
                  <option value="Audio Podcast Episode">Audio Podcast Session (Recording/Streaming)</option>
                  <option value="Studio Time Sharing">Soundstage Co-Rent (Shared Space & Lights)</option>
                  <option value="Apparel & Portrait Shoot">Portrait Shoot (Fashion / Product Styling)</option>
                  <option value="Tactile Audio ASMR Sync">Macro ASMR / Sound design sync</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Proposed Date */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Proposed Date</label>
                  <input
                    type="date"
                    required
                    value={proposalDate}
                    onChange={(e) => setProposalDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-500"
                  />
                </div>

                {/* Offered Compensation / Budget */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Compensation / Split</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $150/hr, Barter, 50/50"
                    value={proposalBudget}
                    onChange={(e) => setProposalBudget(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Message / Details */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Deliverables & Co-lab Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hey, I'd love to rent out your soundstage to shoot 3 cinematic macro beauty loops next Wednesday. I can bring my probe lens and handle the color-grading in return..."
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-purple-500 leading-relaxed resize-none"
                />
              </div>

              {/* Secure Booking Notice */}
              <div className="bg-purple-50/50 border border-purple-100 p-3.5 rounded-2xl flex items-start gap-2 text-[10px] text-purple-950 leading-relaxed font-semibold">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  By sending, you authorize secure booking escrow validation. Payment or barter releases are fully protected against disputes or cancellations.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCollabModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Pitch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
