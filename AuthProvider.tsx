import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { SplashLoader, WalkingLoader } from "./ui/Loader";
import { User, CreatorProfile, BrandProfile } from "../types";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [splashLoading, setSplashLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const pathForOnSnapshot = `users/${firebaseUser.uid}`;
        const unsubDoc = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (snapshot) => {
            if (snapshot.exists()) {
              setUserData({ id: snapshot.id, ...snapshot.data() } as User);
            } else {
              setUserData(null);
            }
            setAuthLoading(false);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
            setAuthLoading(false);
          }
        );
        return () => unsubDoc();
      } else {
        setUserData(null);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (splashLoading) {
    return <SplashLoader onComplete={() => setSplashLoading(false)} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <WalkingLoader />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading: authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
