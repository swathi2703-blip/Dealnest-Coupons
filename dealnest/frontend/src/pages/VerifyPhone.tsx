import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
  PhoneAuthProvider,
  RecaptchaVerifier,
  reload,
  signOut,
  updatePhoneNumber,
  User as FirebaseUser,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { getNextVerifiedRoute } from "@/lib/verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Smartphone } from "lucide-react";

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (value.trim().startsWith("+") && /^\+[1-9]\d{7,14}$/.test(value.trim())) {
    return value.trim();
  }

  return "";
};

const getPhoneAuthErrorMessage = (error: unknown) => {
  if (!(error instanceof FirebaseError)) {
    return "Please try again.";
  }

  const errorText = (error.message || "").toUpperCase();
  if (errorText.includes("BILLING_NOT_ENABLED") || errorText.includes("BILLING")) {
    return "Phone OTP requires billing enabled for your Firebase project. Upgrade to Blaze plan and enable billing in Google Cloud.";
  }

  switch (error.code) {
    case "auth/invalid-phone-number":
      return "Invalid phone number. Use a valid mobile number.";
    case "auth/missing-phone-number":
      return "Phone number is required.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA verification failed. Refresh and try again.";
    case "auth/too-many-requests":
      return "Too many OTP requests. Please wait and try again.";
    case "auth/quota-exceeded":
      return "SMS quota exceeded for Firebase project. Try later.";
    case "auth/internal-error":
      return "Firebase internal error. If this mentions billing, enable Blaze plan and retry.";
    case "auth/operation-not-allowed":
      return "Phone auth is not enabled in Firebase Authentication.";
    case "auth/app-not-authorized":
      return "Current domain is not authorized for Firebase Auth. Add localhost in authorized domains.";
    case "auth/invalid-app-credential":
      return "Invalid app verification credential. Retry after page refresh.";
    case "auth/network-request-failed":
      return "Network error. Check internet connection and retry.";
    default:
      return error.message || "Failed to send OTP.";
  }
};

const VerifyPhone = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const hasSentOtp = useMemo(() => verificationId.length > 0, [verificationId]);

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
        // Use cached auth state when reload fails
      }

      setUser(auth.currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const getRecaptchaVerifier = () => {
    const existing = (window as any).recaptchaVerifier as RecaptchaVerifier | undefined;
    if (existing) return existing;

    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
    (window as any).recaptchaVerifier = verifier;
    return verifier;
  };

  const resetRecaptchaVerifier = () => {
    const existing = (window as any).recaptchaVerifier as RecaptchaVerifier | undefined;
    if (existing) {
      existing.clear();
      (window as any).recaptchaVerifier = null;
    }
  };

  const sendOtp = async (isResend = false) => {
    if (!user) return;

    const normalizedNumber = normalizePhoneNumber(phoneNumber);
    if (!normalizedNumber) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Use Indian number format like 9876543210 or +919876543210",
      });
      return;
    }

    try {
      if (isResend) {
        setResending(true);
      } else {
        setSending(true);
      }

      const recaptchaVerifier = getRecaptchaVerifier();
      await recaptchaVerifier.render();
      const provider = new PhoneAuthProvider(auth);
      const newVerificationId = await provider.verifyPhoneNumber(normalizedNumber, recaptchaVerifier);
      setVerificationId(newVerificationId);
      toast({
        title: "OTP sent",
        description: `Enter the code sent to ${normalizedNumber}`,
      });
    } catch (error: unknown) {
      resetRecaptchaVerifier();
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: getPhoneAuthErrorMessage(error),
      });
    } finally {
      setSending(false);
      setResending(false);
    }
  };

  const verifyOtp = async () => {
    if (!user || !verificationId) return;

    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Enter the 6-digit code.",
      });
      return;
    }

    try {
      setVerifying(true);
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await updatePhoneNumber(user, credential);
      await reload(user);

      const refreshedUser = auth.currentUser;
      if (!refreshedUser) {
        navigate("/auth", { replace: true });
        return;
      }

      navigate(getNextVerifiedRoute(refreshedUser), { replace: true });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "OTP verification failed",
        description: getPhoneAuthErrorMessage(error),
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/auth", { replace: true });
  };

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  if (user.phoneNumber) return <Navigate to={getNextVerifiedRoute(user)} replace />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-card space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center">
          <Smartphone className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold text-center">Verify phone number</h1>
        <p className="text-muted-foreground text-center">
          Complete phone verification to continue to your dashboard.
        </p>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+919876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {!hasSentOtp ? (
          <Button className="w-full" onClick={() => sendOtp(false)} disabled={sending}>
            {sending ? "Sending OTP..." : "Send OTP"}
          </Button>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                inputMode="numeric"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={verifyOtp} disabled={verifying}>
              {verifying ? "Verifying..." : "Verify OTP"}
            </Button>

            <Button className="w-full" variant="outline" onClick={() => sendOtp(true)} disabled={resending}>
              {resending ? "Resending..." : "Resend OTP"}
            </Button>
          </>
        )}

        <Button className="w-full" variant="ghost" onClick={handleSignOut}>
          Sign out
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Need another account? <Link to="/auth" className="text-primary font-semibold">Go to login</Link>
        </p>
        <div id="recaptcha-container" />
      </div>
    </div>
  );
};

export default VerifyPhone;
