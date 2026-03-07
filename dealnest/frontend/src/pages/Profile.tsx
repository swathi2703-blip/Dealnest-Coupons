import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, updateProfile, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (/^\+[1-9]\d{7,14}$/.test(value.trim())) return value.trim();
  return "";
};

const getRollNumber = (email: string | null | undefined) => {
  if (!email) return "";
  const [prefix] = email.toLowerCase().split("@");
  return prefix || "";
};

const Profile = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/auth");
        return;
      }

      setUser(currentUser);
      setFullName(currentUser.displayName || "");
      loadProfile(currentUser.displayName || "");
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadProfile = async (fallbackName: string) => {
    try {
      const response = await api.getProfile();
      setFullName(response.data.full_name || fallbackName);
      setPhoneNumber(response.data.phone_number || "");
    } catch {
      setFullName(fallbackName);
      setPhoneNumber("");
    } finally {
      setLoading(false);
    }
  };

  const rollNumber = useMemo(() => getRollNumber(user?.email), [user?.email]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Use 10-digit number or +91 format.",
      });
      return;
    }

    if (!fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Full name required",
        description: "Please enter your full name.",
      });
      return;
    }

    try {
      setSaving(true);
      await api.upsertProfile({
        full_name: fullName.trim(),
        phone_number: normalizedPhone,
      });

      if (auth.currentUser && auth.currentUser.displayName !== fullName.trim()) {
        await updateProfile(auth.currentUser, {
          displayName: fullName.trim(),
        });
      }

      setPhoneNumber(normalizedPhone);
      toast({
        title: "Profile updated",
        description: "Your details were saved successfully.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-main px-4 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              My <span className="gradient-text">Profile</span>
            </h1>
            <p className="text-muted-foreground">Edit your account details. Roll number is fixed from your KLH email.</p>
          </div>

          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card">
            {loading ? (
              <p className="text-muted-foreground">Loading profile...</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email || ""} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input id="rollNumber" value={rollNumber} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="9876543210 or +919876543210"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
