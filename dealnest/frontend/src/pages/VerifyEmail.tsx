import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged, reload, sendEmailVerification, signOut, User as FirebaseUser } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { getNextVerifiedRoute } from "@/lib/verification";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MailCheck } from "lucide-react";

const getVerificationErrorMessage = (error: unknown) => {
  if (!(error instanceof FirebaseError)) {
    return "Please try again later.";
  }

  switch (error.code) {
    case "auth/user-token-expired":
    case "auth/invalid-user-token":
      return "Your session expired. Please sign in again and retry.";
    case "auth/unauthorized-continue-uri":
      return "Current domain is not authorized in Firebase. Add localhost in Firebase Authentication authorized domains.";
    case "auth/invalid-continue-uri":
      return "Invalid verification redirect URL configuration.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    case "auth/operation-not-allowed":
      return "Email/Password authentication is disabled in Firebase.";
    default:
      return error.message || "Unable to send verification email.";
  }
};

const VerifyEmail = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const sendVerificationEmail = async (currentUser: FirebaseUser) => {
    await currentUser.getIdToken(true);
    await sendEmailVerification(currentUser, {
      url: `${window.location.origin}/auth`,
      handleCodeInApp: false,
    });
  };

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
        // Use current cached user state if reload fails
      }

      setUser(auth.currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || user.emailVerified) return;

    const sentKey = `dealnest_email_verification_sent_${user.uid}`;
    if (sessionStorage.getItem(sentKey) === "1") return;

    const sendInitialEmail = async () => {
      try {
        setSending(true);
        await sendVerificationEmail(user);
        sessionStorage.setItem(sentKey, "1");
        toast({
          title: "Verification email sent",
          description: "Please check your inbox and spam folder.",
        });
      } catch (error: unknown) {
        toast({
          variant: "destructive",
          title: "Unable to send email",
          description: getVerificationErrorMessage(error),
        });
      } finally {
        setSending(false);
      }
    };

    void sendInitialEmail();
  }, [user, toast]);

  const handleResend = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setSending(true);
      await sendVerificationEmail(currentUser);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder.",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Unable to send email",
        description: getVerificationErrorMessage(error),
      });
    } finally {
      setSending(false);
    }
  };

  const handleIHaveVerified = async () => {
    if (!user) return;

    try {
      setChecking(true);
      await reload(user);

      const refreshedUser = auth.currentUser;
      if (!refreshedUser) {
        navigate("/auth", { replace: true });
        return;
      }

      if (!refreshedUser.emailVerified) {
        toast({
          variant: "destructive",
          title: "Email not verified yet",
          description: "Click the link in your email first, then try again.",
        });
        return;
      }

      navigate(getNextVerifiedRoute(refreshedUser), { replace: true });
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/auth", { replace: true });
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.emailVerified) return <Navigate to={getNextVerifiedRoute(user)} replace />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-card text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center">
          <MailCheck className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold">Verify your email</h1>
        <p className="text-muted-foreground">
          We sent a verification link to <span className="font-medium text-foreground">{user.email}</span>. Verify first to continue.
        </p>

        <Button className="w-full" onClick={handleIHaveVerified} disabled={checking}>
          {checking ? "Checking..." : "I have verified"}
        </Button>

        <Button className="w-full" variant="outline" onClick={handleResend} disabled={sending}>
          {sending ? "Sending..." : "Resend verification email"}
        </Button>

        <Button className="w-full" variant="ghost" onClick={handleSignOut}>
          Sign out
        </Button>

        <p className="text-sm text-muted-foreground">
          Need a different account? <Link to="/auth" className="text-primary font-semibold">Go to login</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
