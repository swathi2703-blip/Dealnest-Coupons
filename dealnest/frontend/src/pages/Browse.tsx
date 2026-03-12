import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { api, CouponListing } from "@/lib/api";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Clock, Percent, IndianRupee, Trash2 } from "lucide-react";

const categories = [
  "All",
  "Shopping",
  "Food & Dining",
  "Travel",
  "Electronics",
  "Entertainment",
  "Fashion",
  "Cafes",
  "Gift Cards",
];

const fallbackListings: CouponListing[] = [
  {
    id: "demo-1",
    brand_name: "Myntra Gift Card",
    description: "Fashion shopping coupon from trusted seller",
    original_value: 2000,
    selling_price: 1200,
    discount_percentage: 40,
    category: "Fashion",
    expiry_date: "2026-12-31",
    website_link: "https://www.myntra.com",
    created_at: new Date().toISOString(),
    seller_id: "demo-seller-1",
    is_sold: false,
    is_active: true,
  },
  {
    id: "demo-2",
    brand_name: "Swiggy Voucher",
    description: "Food coupon valid across India",
    original_value: 500,
    selling_price: 350,
    discount_percentage: 30,
    category: "Food & Dining",
    expiry_date: "2026-11-30",
    website_link: "https://www.swiggy.com",
    created_at: new Date().toISOString(),
    seller_id: "demo-seller-2",
    is_sold: false,
    is_active: true,
  },
  {
    id: "demo-3",
    brand_name: "MakeMyTrip Coupon",
    description: "Travel booking discount coupon",
    original_value: 5000,
    selling_price: 3500,
    discount_percentage: 30,
    category: "Travel",
    expiry_date: "2026-10-31",
    website_link: "https://www.makemytrip.com",
    created_at: new Date().toISOString(),
    seller_id: "demo-seller-3",
    is_sold: false,
    is_active: true,
  },
  {
    id: "demo-4",
    brand_name: "Flipkart Gift Card",
    description: "Shopping gift card at discounted price",
    original_value: 1000,
    selling_price: 750,
    discount_percentage: 25,
    category: "Shopping",
    expiry_date: "2026-09-30",
    website_link: "https://www.flipkart.com",
    created_at: new Date().toISOString(),
    seller_id: "demo-seller-4",
    is_sold: false,
    is_active: true,
  },
  {
    id: "demo-5",
    brand_name: "Starbucks Card",
    description: "Coffee and cafes discount voucher",
    original_value: 800,
    selling_price: 500,
    discount_percentage: 38,
    category: "Cafes",
    expiry_date: "2026-12-15",
    website_link: "https://www.starbucks.in",
    created_at: new Date().toISOString(),
    seller_id: "demo-seller-5",
    is_sold: false,
    is_active: true,
  },
  {
    id: "demo-6",
    brand_name: "BookMyShow Voucher",
    description: "Entertainment discount voucher",
    original_value: 1500,
    selling_price: 1000,
    discount_percentage: 33,
    category: "Entertainment",
    expiry_date: "2026-08-31",
    website_link: "https://in.bookmyshow.com",
    created_at: new Date().toISOString(),
    seller_id: "demo-seller-6",
    is_sold: false,
    is_active: true,
  },
];

const Browse = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [listings, setListings] = useState<CouponListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await api.getListings({
        category: selectedCategory,
        active: true,
      });
      setListings(response.data);
      setUsingFallback(false);
    } catch {
      const fallbackByCategory = selectedCategory === "All"
        ? fallbackListings
        : fallbackListings.filter((listing) => listing.category === selectedCategory);
      setListings(fallbackByCategory);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(
    (listing) =>
      listing.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryEmojis: Record<string, string> = {
    Shopping: "🛍️",
    "Food & Dining": "🍔",
    Travel: "✈️",
    Electronics: "📱",
    Entertainment: "🎬",
    Fashion: "👗",
    Cafes: "☕",
    "Gift Cards": "🎁",
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const shouldDelete = window.confirm("Delete this listing? This action cannot be undone.");
    if (!shouldDelete) {
      return;
    }

    setDeletingListingId(listingId);
    try {
      await api.deleteListing(listingId);
      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
      toast({
        title: "Listing deleted",
        description: "Your listing has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.message || "Unable to delete this listing right now.",
        variant: "destructive",
      });
    } finally {
      setDeletingListingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-main px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Browse <span className="gradient-text">Coupons</span>
            </h1>
            <p className="text-muted-foreground">
              Find amazing deals from verified sellers across India
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by brand or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Results */}
          {usingFallback && (
            <div className="mb-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Showing demo coupons for buyers while live listings are temporarily unavailable.
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-deal animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-display font-bold mb-2">No coupons found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try a different search term"
                  : "Be the first to list a coupon in this category!"}
              </p>
              <Button asChild>
                <a href="/sell">Sell Your Coupon</a>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const isOwnListing = Boolean(user && listing.seller_id === user.uid);

                return (
                <div key={listing.id} className="card-deal group cursor-pointer">
                  <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                      {categoryEmojis[listing.category] || "🎟️"}
                    </span>
                    
                    {listing.discount_percentage && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {listing.discount_percentage}% OFF
                      </div>
                    )}

                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      {listing.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {listing.brand_name}
                    </h3>
                    
                    {listing.description && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        Value: ₹{listing.original_value}
                      </span>
                      {listing.expiry_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(listing.expiry_date).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-display font-bold text-primary">
                          ₹{listing.selling_price}
                        </span>
                        <span className="text-muted-foreground line-through text-sm">
                          ₹{listing.original_value}
                        </span>
                      </div>
                      {isOwnListing ? (
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary px-3 py-2 rounded-xl font-semibold text-sm">
                            Your Listing
                          </span>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            disabled={deletingListingId === listing.id}
                            className="bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-semibold text-sm hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                            aria-label={`Delete ${listing.brand_name} listing`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <Trash2 className="w-3.5 h-3.5" />
                              {deletingListingId === listing.id ? "Deleting..." : "Delete"}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/buy/${listing.id}`)}
                          className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                        >
                          Buy Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Browse;