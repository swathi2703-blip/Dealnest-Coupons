import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Mumbai",
      avatar: "PS",
      rating: 5,
      text: "Sold my unused Myntra gift cards within hours! Got ₹3,500 for coupons I was going to let expire. Amazing platform!",
      role: "Seller",
    },
    {
      id: 2,
      name: "Rahul Verma",
      location: "Delhi",
      avatar: "RV",
      rating: 5,
      text: "Saved ₹2,000 on my MakeMyTrip booking by buying a coupon at 35% discount. Totally legit and secure.",
      role: "Buyer",
    },
    {
      id: 3,
      name: "Sneha Patel",
      location: "Bangalore",
      avatar: "SP",
      rating: 5,
      text: "I regularly sell my corporate gift cards here. Great way to make some extra money from unused vouchers!",
      role: "Seller",
    },
    {
      id: 4,
      name: "Amit Kumar",
      location: "Hyderabad",
      avatar: "AK",
      rating: 5,
      text: "Found a Zomato Pro membership at half price. Verification was quick and the code worked perfectly.",
      role: "Buyer",
    },
  ];

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-main">
        <div className="text-center mb-12">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold mb-4">
            Loved by <span className="gradient-text">25,000+ Users</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of smart Indians who are saving and earning with DealNest.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-3xl p-6 shadow-card hover:shadow-glow transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold">{testimonial.name}</h4>
                      <p className="text-muted-foreground text-sm">{testimonial.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      testimonial.role === 'Seller' 
                        ? 'bg-secondary/10 text-secondary' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {testimonial.role}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Quote className="w-8 h-8 text-primary/10 absolute -top-2 -left-2" />
                <p className="text-foreground pl-6">{testimonial.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;