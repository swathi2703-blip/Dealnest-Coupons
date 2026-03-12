import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ALLOWED_EMAIL_DOMAIN, isAllowedKlhEmail } from "@/lib/auth";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { z } from "zod";

const emailSchema = z
  .string()
  .email("Please enter a valid email")
  .refine((value) => isAllowedKlhEmail(value), `Only ${ALLOWED_EMAIL_DOMAIN} emails are allowed`);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid phone number (e.g. +919876543210 or 9876543210)");

const normalizeIndianPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return value.trim();
};

const getAuthErrorMessage = (error: unknown) => {
  if (!(error instanceof FirebaseError)) {
    return "Authentication failed";
  }

  switch (error.code) {
    case "auth/invalid-api-key":
      return "Firebase API key is invalid. Check frontend .env configuration.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is disabled in Firebase. Enable it in Firebase Console → Authentication → Sign-in method.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please login instead.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/network-request-failed":
      return "Network error while contacting Firebase. Check your internet connection.";
    default:
      return error.message || "Authentication failed";
  }
};

const getPasswordResetErrorMessage = (error: unknown) => {
  if (!(error instanceof FirebaseError)) {
    return "Unable to send password reset email";
  }

  switch (error.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";
    case "auth/network-request-failed":
      return "Network error while contacting Firebase. Check your internet connection.";
    default:
      return error.message || "Unable to send password reset email";
  }
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; phoneNumber?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string; phoneNumber?: string } = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (isSignUp && !fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (isSignUp) {
      try {
        phoneSchema.parse(phoneNumber);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.phoneNumber = e.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isSignUp) {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        const normalizedPhone = normalizeIndianPhone(phoneNumber);
        if (fullName.trim()) {
          await updateProfile(credentials.user, {
            displayName: fullName.trim(),
          });
        }

        await api.upsertProfile({
          full_name: fullName.trim(),
          phone_number: normalizedPhone,
        });

        toast({
          title: "Account created!",
          description: "Welcome to DealNest. Your phone number has been saved.",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Login successful",
          description: "Welcome back to DealNest.",
        });
      }

      navigate("/dashboard");
    } catch (error: unknown) {
      const message = getAuthErrorMessage(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const newErrors: { email?: string; password?: string; fullName?: string; phoneNumber?: string } = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast({
        title: "Reset email sent",
        description: "Check your inbox for a password reset link.",
      });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: getPasswordResetErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-8">
            <BrandLogo imageClassName="h-10 w-auto" textClassName="font-display font-bold text-xl" />
          </div>

          <h1 className="text-3xl font-display font-bold mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? "Start buying and selling coupons today"
              : "Login to access your dashboard"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-destructive text-sm">{errors.fullName}</p>
                )}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                {errors.phoneNumber && (
                  <p className="text-destructive text-sm">{errors.phoneNumber}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password}</p>
              )}
              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-sm text-primary font-semibold hover:underline disabled:opacity-60"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Login"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold hover:underline"
            >
              {isSignUp ? "Login" : "Sign up"}
            </button>
          </p>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground text-center">
          <div className="text-6xl mb-6">🎟️</div>
          <h2 className="text-3xl font-display font-bold mb-4">
            Turn Unused Coupons Into Cash
          </h2>
          <p className="text-lg opacity-90">
            Join 25,000+ users who are saving and earning with India's largest coupon marketplace.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold">₹50L+</p>
              <p className="text-sm opacity-80">Total Savings</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold">10,000+</p>
              <p className="text-sm opacity-80">Active Listings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;