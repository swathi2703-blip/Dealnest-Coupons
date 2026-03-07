import { ArrowRight, Shield, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";

const PartnerCTA = () => {
  const benefits = [
    {
      icon: Shield,
      title: "100% Secure",
      description: "All transactions are protected with escrow payments",
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Our team verifies coupons within 24 hours",
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join 25,000+ verified buyers and sellers",
    },
  ];

  return (
    <section id="partner" className="section-padding">
      <div className="container-main">
        <div className="relative bg-gradient-hero rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative px-6 py-16 md:px-12 lg:px-20 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-primary-foreground">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold mb-6">
                  Start Selling Your Unused Coupons Today
                </h2>
                <p className="text-lg opacity-90 mb-8 max-w-lg">
                  Don't let your gift cards and coupons go to waste. Turn them into cash instantly. Free to list, pay only when you sell.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/sell"
                    className="group flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform duration-300"
                  >
                    Start Selling
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/browse"
                    className="flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-colors duration-300"
                  >
                    Browse Coupons
                  </Link>
                </div>
              </div>

              {/* Right - Benefits */}
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white text-lg mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-white/80 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTA;