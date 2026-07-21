import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, UserCircle, Briefcase, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { CuteCharacter } from "../components/ui/CuteCharacter";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { useAuth } from "../components/AuthProvider";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"creator" | "brand" | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  useEffect(() => {
    if (user && userData && step === 1) {
      navigate("/dashboard");
    } else if (user && !userData && step === 1) {
      setStep(2);
    }
  }, [user, userData, navigate, step]);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        setStep(2);
        toast.success("Account created! Let's set up your profile.");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
      setLoading(false);
    }
  };

  const handleRoleSelection = async () => {
    if (!role || !auth.currentUser) return;
    setLoading(true);
    
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        email: auth.currentUser.email,
        name: name || auth.currentUser.email?.split("@")[0] || "User",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=random`,
        role: role,
        createdAt: Date.now(),
        lastLogin: Date.now()
      });
      
      navigate("/dashboard");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "users");
      toast.error("Failed to complete profile setup");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <CuteCharacter size="sm" isWalking={false} />
          <span className="font-bold text-2xl tracking-tight text-gray-900">CRYOVA</span>
        </Link>
        
        <div className="bg-white py-8 px-4 shadow-xl shadow-purple-500/5 sm:rounded-3xl sm:px-10 border border-gray-100">
          {step === 1 ? (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{isLogin ? "Welcome back" : "Create an account"}</h2>
                <p className="text-sm text-gray-500 mt-2">
                  {isLogin ? "Enter your details to sign in" : "Sign up to get started"}
                </p>
              </div>
              <form className="space-y-4" onSubmit={handleAuth}>
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <div className="mt-1">
                      <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Alex Carter" className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white" />
                    </div>
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1">
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white" />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1">
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white" />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-purple-600 hover:text-purple-500 font-medium">
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 text-purple-600 mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">How do you use CRYOVA?</h2>
                <p className="text-sm text-gray-500 mt-2">Choose your profile type to customize your experience.</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setRole("creator")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${role === 'creator' ? 'border-purple-600 bg-purple-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === 'creator' ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-500'}`}>
                      <UserCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-bold ${role === 'creator' ? 'text-purple-900' : 'text-gray-900'}`}>I'm a Creator</h3>
                      <p className="text-xs text-gray-500">I want to find brands and get paid.</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${role === 'creator' ? 'text-purple-600' : 'text-gray-300'}`} />
                </button>

                <button 
                  onClick={() => setRole("brand")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${role === 'brand' ? 'border-purple-600 bg-purple-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === 'brand' ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-500'}`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-bold ${role === 'brand' ? 'text-purple-900' : 'text-gray-900'}`}>I'm a Brand</h3>
                      <p className="text-xs text-gray-500">I want to hire creators and launch campaigns.</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${role === 'brand' ? 'text-purple-600' : 'text-gray-300'}`} />
                </button>
              </div>

              <div className="mt-8">
                <button 
                  disabled={!role || loading}
                  onClick={handleRoleSelection}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter CRYOVA'} {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
