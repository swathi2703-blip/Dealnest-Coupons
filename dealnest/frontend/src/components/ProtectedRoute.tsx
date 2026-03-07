import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, reload, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getNextVerifiedRoute } from "@/lib/verification";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await reload(currentUser);
      } catch {
        // Continue with current cached auth state when reload fails
      }

      setUser(auth.currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const nextRoute = getNextVerifiedRoute(user);
  if (nextRoute !== "/dashboard") {
    return <Navigate to={nextRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
