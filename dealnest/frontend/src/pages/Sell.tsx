import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tag, IndianRupee, Calendar, FileText } from "lucide-react";

const categories = [
  "Shopping",
  "Food & Dining",
  "Travel",
  "Electronics",
  "Entertainment",
  "Fashion",
  "Cafes",
  "Gift Cards",
];

const Sell = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: "",
    description: "",
    couponCode: "",
    originalValue: "",
    sellingPrice: "",
    category: "",
    expiryDate: "",
    websiteLink: "",
    payoutMethod: "UPI",
    accountHolderName: "",
    payoutUpiId: "",
    payoutBankName: "",
    payoutBankAccountNumber: "",
    payoutBankIfsc: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to list your coupon",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.brandName || !formData.originalValue || !formData.sellingPrice || !formData.category || !formData.websiteLink || !formData.accountHolderName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields including payout details",
        variant: "destructive",
      });
      return;
    }

    if (formData.payoutMethod === "UPI" && !formData.payoutUpiId) {
      toast({
        title: "Missing payout details",
        description: "Please enter your UPI ID",
        variant: "destructive",
      });
      return;
    }

    if (formData.payoutMethod === "BANK" && (!formData.payoutBankName || !formData.payoutBankAccountNumber || !formData.payoutBankIfsc)) {
      toast({
        title: "Missing payout details",
        description: "Please enter bank name, account number and IFSC",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await api.createListing({
        brand_name: formData.brandName,
        description: formData.description || null,
        coupon_code: formData.couponCode || null,
        original_value: parseFloat(formData.originalValue),
        selling_price: parseFloat(formData.sellingPrice),
        category: formData.category,
        expiry_date: formData.expiryDate || null,
        website_link: formData.websiteLink.trim(),
        payout_method: formData.payoutMethod as "UPI" | "BANK",
        account_holder_name: formData.accountHolderName.trim(),
        payout_upi_id: formData.payoutMethod === "UPI" ? formData.payoutUpiId.trim() : null,
        payout_bank_name: formData.payoutMethod === "BANK" ? formData.payoutBankName.trim() : null,
        payout_bank_account_number: formData.payoutMethod === "BANK" ? formData.payoutBankAccountNumber.trim() : null,
        payout_bank_ifsc: formData.payoutMethod === "BANK" ? formData.payoutBankIfsc.trim().toUpperCase() : null,
      });

      toast({
        title: "Coupon listed!",
        description: "Your coupon has been listed successfully. Buyers can now see it.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const discount = formData.originalValue && formData.sellingPrice
    ? Math.round(((parseFloat(formData.originalValue) - parseFloat(formData.sellingPrice)) / parseFloat(formData.originalValue)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-main px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                Sell Your <span className="gradient-text">Coupon</span>
              </h1>
              <p className="text-muted-foreground">
                List your unused coupons and start earning. Free to list, pay only when sold.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-6 md:p-8 shadow-card space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  placeholder="e.g., Myntra, Swiggy, MakeMyTrip"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalValue">Original Value (₹) *</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="originalValue"
                      type="number"
                      placeholder="e.g., 2000"
                      value={formData.originalValue}
                      onChange={(e) => setFormData({ ...formData, originalValue: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="sellingPrice"
                      type="number"
                      placeholder="e.g., 1500"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {discount > 0 && (
                <div className="bg-primary/10 text-primary px-4 py-3 rounded-xl text-center font-semibold">
                  Buyers will save {discount}% on this coupon!
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="couponCode">Coupon Code (optional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="couponCode"
                    placeholder="Enter the coupon code (only shared after purchase)"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The code will only be revealed to the buyer after purchase
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional details about the coupon..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteLink">Website Link *</Label>
                <Input
                  id="websiteLink"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.websiteLink}
                  onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
                />
              </div>

              <div className="rounded-2xl border border-border p-4 space-y-4">
                <h3 className="text-base font-semibold">Seller Payout Details *</h3>

                <div className="space-y-2">
                  <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                  <Input
                    id="accountHolderName"
                    placeholder="Enter full name as per payout account"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payoutMethod">Payout Method *</Label>
                  <Select
                    value={formData.payoutMethod}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        payoutMethod: value,
                        payoutUpiId: "",
                        payoutBankName: "",
                        payoutBankAccountNumber: "",
                        payoutBankIfsc: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="BANK">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.payoutMethod === "UPI" ? (
                  <div className="space-y-2">
                    <Label htmlFor="payoutUpiId">UPI ID *</Label>
                    <Input
                      id="payoutUpiId"
                      placeholder="name@upi"
                      value={formData.payoutUpiId}
                      onChange={(e) => setFormData({ ...formData, payoutUpiId: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="payoutBankName">Bank Name *</Label>
                      <Input
                        id="payoutBankName"
                        placeholder="e.g., HDFC Bank"
                        value={formData.payoutBankName}
                        onChange={(e) => setFormData({ ...formData, payoutBankName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payoutBankAccountNumber">Account Number *</Label>
                      <Input
                        id="payoutBankAccountNumber"
                        placeholder="Enter account number"
                        value={formData.payoutBankAccountNumber}
                        onChange={(e) => setFormData({ ...formData, payoutBankAccountNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payoutBankIfsc">IFSC *</Label>
                      <Input
                        id="payoutBankIfsc"
                        placeholder="e.g., HDFC0001234"
                        value={formData.payoutBankIfsc}
                        onChange={(e) => setFormData({ ...formData, payoutBankIfsc: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full btn-primary py-6 text-lg">
                {loading ? "Listing..." : "List Coupon for Sale"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                By listing, you agree to our Terms of Service and confirm the coupon is valid.
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sell;