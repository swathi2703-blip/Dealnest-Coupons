import { ShoppingBag, Utensils, Plane, Smartphone, Film, Coffee, Shirt, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const Categories = () => {
  const categories = [
    {
      icon: ShoppingBag,
      name: "Shopping",
      count: "500+ coupons",
      color: "from-orange-400 to-red-500",
    },
    {
      icon: Utensils,
      name: "Food & Dining",
      count: "320+ coupons",
      color: "from-amber-400 to-orange-500",
    },
    {
      icon: Plane,
      name: "Travel",
      count: "180+ coupons",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: Smartphone,
      name: "Electronics",
      count: "150+ coupons",
      color: "from-violet-400 to-purple-500",
    },
    {
      icon: Film,
      name: "Entertainment",
      count: "200+ coupons",
      color: "from-pink-400 to-rose-500",
    },
    {
      icon: Shirt,
      name: "Fashion",
      count: "400+ coupons",
      color: "from-emerald-400 to-teal-500",
    },
    {
      icon: Coffee,
      name: "Cafes",
      count: "120+ coupons",
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: Gift,
      name: "Gift Cards",
      count: "250+ coupons",
      color: "from-fuchsia-400 to-pink-500",
    },
  ];

  return (
    <section id="categories" className="section-padding bg-muted/30">
      <div className="container-main">
        <div className="text-center mb-12">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Categories
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold mb-4">
            Browse by{" "}
            <span className="gradient-text">Category</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find coupons for your favourite brands across all categories - from Zomato to Myntra, Flipkart to MakeMyTrip.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              to={`/browse?category=${category.name}`}
              key={category.name}
              className="group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-card rounded-3xl p-6 text-center shadow-card hover:shadow-glow transition-all duration-300 group-hover:-translate-y-2">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg mb-1">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;