import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";
import type { AdminEarningsSummary } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, Package, ShoppingCart, Trash2, IndianRupee } from "lucide-react";

interface CouponListing {
  id: string;
  brand_name: string;
  original_value: number;
  selling_price: number;
  category: string;
  is_sold: boolean;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [listings, setListings] = useState<CouponListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [adminSummary, setAdminSummary] = useState<AdminEarningsSummary | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        navigate("/auth");
        setListings([]);
        setAdminSummary(null);
        setLoading(false);
      } else {
        fetchListings(currentUser.uid);
        fetchAdminSummary();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchAdminSummary = async () => {
    setAdminLoading(true);
    try {
      const response = await api.getAdminEarningsSummary();
      setAdminSummary(response.data);
    } catch {
      setAdminSummary(null);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchListings = async (userId: string) => {
    try {
      const response = await api.getListings({ sellerId: userId });
      setListings(response.data);
    } catch {
      setListings([]);
      toast({
        title: "Error",
        description: "Failed to load listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    if (!user) return;

    const shouldDelete = window.confirm("Delete this listing? This action cannot be undone.");
    if (!shouldDelete) {
      return;
    }

    setDeletingListingId(id);

    try {
      await api.deleteListing(id);
      setListings((prev) => prev.filter((listing) => listing.id !== id));
      toast({
        title: "Deleted",
        description: "Listing removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete listing",
        variant: "destructive",
      });
    } finally {
      setDeletingListingId(null);
    }
  };

  const activeListings = listings.filter((l) => !l.is_sold);
  const soldListings = listings.filter((l) => l.is_sold);
  const totalEarnings = soldListings.reduce((sum, l) => sum + l.selling_price, 0);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-main px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">
                My <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user.displayName || user.email}
              </p>
            </div>
            <Link to="/sell">
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                List New Coupon
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Active Listings</p>
                  <p className="text-2xl font-display font-bold">{activeListings.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Coupons Sold</p>
                  <p className="text-2xl font-display font-bold">{soldListings.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Earnings</p>
                  <p className="text-2xl font-display font-bold">₹{totalEarnings}</p>
                </div>
              </div>
            </div>
          </div>

          {adminLoading ? (
            <div className="bg-card rounded-3xl p-6 shadow-card mb-8">Loading admin earnings...</div>
          ) : adminSummary ? (
            <div className="bg-card rounded-3xl p-6 shadow-card mb-8 space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl">Admin Earnings Profile</h2>
                <p className="text-sm text-muted-foreground">15% platform share summary from successful transactions</p>
              </div>

              <div className="grid sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Total Admin Amount</p>
                  <p className="text-xl font-display font-bold">₹{adminSummary.total_admin_amount.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Gross Volume</p>
                  <p className="text-xl font-display font-bold">₹{adminSummary.total_gross_amount.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Seller Payout Total</p>
                  <p className="text-xl font-display font-bold">₹{adminSummary.total_seller_payout_amount.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Successful Transactions</p>
                  <p className="text-xl font-display font-bold">{adminSummary.total_successful_transactions}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Seller Payout Success/Queued</p>
                  <p className="text-lg font-display font-bold">{adminSummary.successful_seller_payouts}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Seller Payout Failed</p>
                  <p className="text-lg font-display font-bold text-destructive">{adminSummary.failed_seller_payouts}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Recent Settlements</h3>
                <div className="space-y-2">
                  {adminSummary.recent_transactions.slice(0, 8).map((tx) => (
                    <div key={tx.id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{tx.transaction_id}</p>
                        <p className="text-xs text-muted-foreground">Payout: {tx.seller_payout_status || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Admin: ₹{(tx.platform_fee_amount || 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Seller: ₹{(tx.seller_payout_amount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Listings */}
          <div className="bg-card rounded-3xl p-6 shadow-card">
            <h2 className="font-display font-bold text-xl mb-6">My Listings</h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-muted rounded-xl">
                    <div className="w-16 h-16 bg-muted-foreground/10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted-foreground/10 rounded w-1/3" />
                      <div className="h-3 bg-muted-foreground/10 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start selling your unused coupons today!
                </p>
                <Link to="/sell">
                  <Button>List Your First Coupon</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      listing.is_sold ? "bg-muted/50 border-border" : "bg-background border-border"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                      🎟️
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold truncate">{listing.brand_name}</h3>
                        {listing.is_sold && (
                          <span className="bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full font-medium">
                            Sold
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{listing.category}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-display font-bold text-primary">₹{listing.selling_price}</p>
                      <p className="text-muted-foreground text-sm line-through">₹{listing.original_value}</p>
                    </div>

                    {!listing.is_sold && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteListing(listing.id)}
                          disabled={deletingListingId === listing.id}
                          aria-label={`Delete ${listing.brand_name} listing`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;