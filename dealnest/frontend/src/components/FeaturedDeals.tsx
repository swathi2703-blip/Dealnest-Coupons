import { Clock, Percent, User, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";

const FeaturedDeals = () => {
  const deals = [
    {
      id: 1,
      image: "🛍️",
      title: "Myntra Gift Card",
      seller: "Rahul S.",
      originalValue: 2000,
      sellingPrice: 1200,
      discount: 40,
      validUntil: "Dec 2024",
      category: "Fashion",
    },
    {
      id: 2,
      image: "🍔",
      title: "Swiggy Voucher",
      seller: "Priya M.",
      originalValue: 500,
      sellingPrice: 350,
      discount: 30,
      validUntil: "Jan 2025",
      category: "Food",
    },
    {
      id: 3,
      image: "✈️",
      title: "MakeMyTrip Coupon",
      seller: "Amit K.",
      originalValue: 5000,
      sellingPrice: 3500,
      discount: 30,
      validUntil: "Mar 2025",
      category: "Travel",
    },
    {
      id: 4,
      image: "📱",
      title: "Flipkart Gift Card",
      seller: "Sneha R.",
      originalValue: 1000,
      sellingPrice: 750,
      discount: 25,
      validUntil: "Feb 2025",
      category: "Shopping",
    },
    {
      id: 5,
      image: "☕",
      title: "Starbucks Card",
      seller: "Vikram P.",
      originalValue: 800,
      sellingPrice: 500,
      discount: 38,
      validUntil: "Dec 2024",
      category: "Cafes",
    },
    {
      id: 6,
      image: "🎬",
      title: "BookMyShow Voucher",
      seller: "Neha G.",
      originalValue: 1500,
      sellingPrice: 1000,
      discount: 33,
      validUntil: "Jan 2025",
      category: "Entertainment",
    },
  ];

  return (
    <section id="deals" className="section-padding">
      <div className="container-main">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Featured Listings
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold">
              Hot Coupons{" "}
              <span className="gradient-text">Available Now</span>
            </h2>
          </div>
          <Link to="/browse" className="btn-outline mt-6 md:mt-0">View All Coupons</Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
            <div
              key={deal.id}
              className="card-deal group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image/Emoji Section */}
              <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                  {deal.image}
                </span>
                
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {deal.discount}% OFF
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                  {deal.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                  {deal.title}
                </h3>
                
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <User className="w-4 h-4" />
                  <span>Sold by {deal.seller}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    Value: ₹{deal.originalValue}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {deal.validUntil}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display font-bold text-primary">
                      ₹{deal.sellingPrice}
                    </span>
                    <span className="text-muted-foreground line-through text-sm">
                      ₹{deal.originalValue}
                    </span>
                  </div>
                  <button className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDeals;