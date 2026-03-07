import { ArrowRight, Tag, ShoppingCart, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center section-padding pt-24 md:pt-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      <div className="container-main relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">India's #1 Coupon Marketplace</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-tight mb-6 animate-fade-up delay-100">
              Buy & Sell{" "}
              <span className="gradient-text">Unused Coupons</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-up delay-200">
              Don't let your coupons expire! Sell unused coupons or buy amazing deals from verified sellers across India. Save up to 70% on your favourite brands.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up delay-300">
              <Link to="/browse" className="group flex items-center justify-center gap-3 bg-gradient-hero text-primary-foreground px-8 py-4 rounded-2xl hover:scale-105 transition-transform duration-300 font-semibold">
                <ShoppingCart className="w-5 h-5" />
                Buy Coupons
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/sell" className="group flex items-center justify-center gap-3 bg-secondary text-secondary-foreground px-8 py-4 rounded-2xl hover:scale-105 transition-transform duration-300 font-semibold">
                <Wallet className="w-5 h-5" />
                Sell Your Coupons
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start animate-fade-up delay-400">
              <div className="text-center lg:text-left">
                <p className="font-display font-bold text-2xl text-foreground">₹50L+</p>
                <p className="text-sm text-muted-foreground">Savings Generated</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center lg:text-left">
                <p className="font-display font-bold text-2xl text-foreground">10,000+</p>
                <p className="text-sm text-muted-foreground">Active Listings</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center lg:text-left">
                <p className="font-display font-bold text-2xl text-foreground">25,000+</p>
                <p className="text-sm text-muted-foreground">Happy Users</p>
              </div>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative flex justify-center lg:justify-end animate-slide-right delay-200">
            <div className="relative">
              {/* Main Card Stack */}
              <div className="relative w-80 md:w-96 floating">
                <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-2xl opacity-30" />
                
                {/* Featured Coupon Card */}
                <div className="relative bg-card rounded-3xl p-6 shadow-2xl border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <span className="text-3xl">🛍️</span>
                    </div>
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                      40% OFF
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-1">Myntra Gift Card</h3>
                  <p className="text-muted-foreground text-sm mb-4">₹2000 value • Valid till Dec 2024</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-display font-bold text-primary">₹1,200</span>
                      <span className="text-muted-foreground line-through text-sm ml-2">₹2,000</span>
                    </div>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -left-8 top-1/4 bg-card p-4 rounded-2xl shadow-card floating-delayed border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Tag className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Swiggy ₹500</p>
                    <p className="text-xs text-muted-foreground">Selling at ₹350</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-card p-4 rounded-2xl shadow-card floating border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-bold text-sm text-primary">Sold!</p>
                    <p className="text-xs text-muted-foreground">₹800 earned</p>
                  </div>
                </div>
              </div>

              <div className="absolute right-8 -top-4 bg-card p-3 rounded-xl shadow-card border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-medium">12 new today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;