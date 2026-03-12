import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, RevealCouponResponse } from "@/lib/api";

const RevealCoupon = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<RevealCouponResponse | null>(null);

  useEffect(() => {
    const token = searchParams.get("token") || "";
    if (!token) {
      setError("Invalid reveal link.");
      setLoading(false);
      return;
    }

    const fetchCoupon = async () => {
      try {
        const response = await api.revealCoupon(token);
        setData(response);
      } catch (err: any) {
        setError(err?.message || "Unable to reveal coupon. The link may have expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-main px-4 max-w-2xl">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h1 className="text-3xl font-display font-bold mb-4">Coupon Reveal</h1>

            {loading && <p className="text-muted-foreground">Validating link...</p>}

            {!loading && error && (
              <div className="rounded-xl bg-destructive/10 text-destructive p-4 text-sm">{error}</div>
            )}

            {!loading && data && (
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Coupon Code:</strong> {data.coupon_code || "No coupon code provided"}
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  {data.website_link ? (
                    <a href={data.website_link} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {data.website_link}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p className="text-muted-foreground">
                  This reveal session expires at: {new Date(data.reveal_expires_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RevealCoupon;
