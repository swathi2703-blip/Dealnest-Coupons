import { UserPlus, Tag, ShoppingCart, Wallet } from "lucide-react";

const HowItWorks = () => {
  const buyerSteps = [
    {
      icon: UserPlus,
      title: "Create Account",
      description: "Sign up for free in seconds with your email or phone number.",
    },
    {
      icon: Tag,
      title: "Browse Coupons",
      description: "Explore thousands of verified coupons from trusted sellers.",
    },
    {
      icon: ShoppingCart,
      title: "Buy & Save",
      description: "Purchase coupons at discounted prices and use them instantly.",
    },
  ];

  const sellerSteps = [
    {
      icon: UserPlus,
      title: "List Your Coupon",
      description: "Add your unused coupons with details and set your price.",
    },
    {
      icon: Tag,
      title: "Get Verified",
      description: "Our team verifies your coupon for authenticity.",
    },
    {
      icon: Wallet,
      title: "Get Paid",
      description: "Receive payment directly to your bank account or UPI.",
    },
  ];

  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-main">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold mb-4">
            Simple & <span className="gradient-text">Secure</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you want to buy coupons at a discount or sell your unused ones, we make it easy and safe.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Buyers */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-2xl">For Buyers</h3>
            </div>
            
            <div className="space-y-6">
              {buyerSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    {index < buyerSteps.length - 1 && (
                      <div className="w-0.5 h-16 bg-primary/20 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-display font-bold text-lg mb-1">{step.title}</h4>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Sellers */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-secondary flex items-center justify-center">
                <Wallet className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-display font-bold text-2xl">For Sellers</h3>
            </div>
            
            <div className="space-y-6">
              {sellerSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-secondary" />
                    </div>
                    {index < sellerSteps.length - 1 && (
                      <div className="w-0.5 h-16 bg-secondary/20 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h4 className="font-display font-bold text-lg mb-1">{step.title}</h4>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 bg-card rounded-3xl p-8 shadow-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-display font-bold text-3xl text-primary mb-1">100%</p>
              <p className="text-muted-foreground text-sm">Verified Coupons</p>
            </div>
            <div>
              <p className="font-display font-bold text-3xl text-primary mb-1">24hr</p>
              <p className="text-muted-foreground text-sm">Quick Verification</p>
            </div>
            <div>
              <p className="font-display font-bold text-3xl text-primary mb-1">Secure</p>
              <p className="text-muted-foreground text-sm">Payments via UPI/Bank</p>
            </div>
            <div>
              <p className="font-display font-bold text-3xl text-primary mb-1">5★</p>
              <p className="text-muted-foreground text-sm">User Ratings</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;