import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api, CouponListing, PaymentOrder } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { ArrowLeft, IndianRupee, Link as LinkIcon, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Buy = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<CouponListing | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      setLoading(true);
      try {
        const response = await api.getListingById(id);
        setListing(response.data);
      } catch (error: any) {
        toast({
          title: "Listing not found",
          description: error?.message || "This coupon may have been removed.",
          variant: "destructive",
        });
        navigate("/browse");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate, toast]);

  const handlePaymentClick = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!id || !listing) return;
    setPaymentProcessing(true);

    try {
      const order = await api.createPaymentOrder(id);
      setPaymentOrder(order);

      const options = {
        key: order.razorpay_key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "DealNest",
        description: `${listing.brand_name} Coupon - ₹${listing.selling_price}`,
        image: "/dealnest-logo.svg",
        handler: async (response: any) => {
          try {
            const verification = await api.verifyPayment({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              listing_id: id,
            });

            if (verification.success) {
              setPaymentComplete(true);
              toast({
                title: "Payment Successful! 🎉",
                description: "Your coupon has been purchased. Check your email for the reveal link.",
              });
              setTimeout(() => {
                navigate("/dashboard");
              }, 2000);
            }
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error?.message || "Could not verify your payment.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          email: user?.email || "",
          name: user?.displayName || "",
        },
        theme: {
          color: "#ff9f2a",
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          afterpay: true,
          paylater: true,
          bank_transfer: true,
        },
        upi_link: true,
        retry: {
          enabled: true,
          max_count: 3,
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setPaymentProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment. Please try again.",
              variant: "destructive",
            });
          },
        },
      };

      const paymentWindow = new window.Razorpay(options);
      paymentWindow.open();
      setPaymentProcessing(false);
    } catch (error: any) {
      setPaymentProcessing(false);
      toast({
        title: "Payment Error",
        description: error?.message || "Could not initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isOwnListing = Boolean(user && listing && user.uid === listing.seller_id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-main px-4">
          <Link to="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>

          {loading ? (
            <div className="rounded-3xl border border-border bg-card p-8">Loading listing...</div>
          ) : !listing ? (
            <div className="rounded-3xl border border-border bg-card p-8">Listing unavailable.</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <section className="rounded-3xl border border-border bg-card p-6">
                <h1 className="text-3xl font-display font-bold mb-2">{listing.brand_name}</h1>
                <p className="text-muted-foreground mb-4">{listing.description || "No additional description provided."}</p>

                <div className="space-y-2 mb-5">
                  <p className="text-sm text-muted-foreground">Original Value</p>
                  <p className="text-xl font-semibold inline-flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {listing.original_value}
                  </p>
                </div>

                <div className="space-y-2 mb-5">
                  <p className="text-sm text-muted-foreground">You Pay</p>
                  <p className="text-3xl font-display font-bold text-primary inline-flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {listing.selling_price}
                  </p>
                </div>

                {listing.website_link && (
                  <a
                    href={listing.website_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Visit Brand Website
                  </a>
                )}
              </section>

              <section className="rounded-3xl border border-border bg-card p-6">
                {isOwnListing ? (
                  <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                    This is your own listing, so purchase is disabled.
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-display font-bold mb-3">Secure Payment</h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      Pay securely via Razorpay with UPI, Cards, Wallets, and more payment methods.
                    </p>

                    {paymentComplete ? (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                        <h3 className="font-semibold text-primary">✅ Payment Successful</h3>
                        <p className="text-sm">
                          Your coupon has been purchased! Check your email for the reveal link valid for 5 minutes.
                        </p>
                        <Button className="w-full mt-4" onClick={() => navigate("/dashboard")}>
                          Go to Dashboard
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handlePaymentClick}
                        disabled={paymentProcessing}
                        className="w-full"
                        size="lg"
                      >
                        {paymentProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : !user ? (
                          <>
                            Login to Buy
                          </>
                        ) : (
                          <>
                            Pay ₹{listing.selling_price}
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Buy;
