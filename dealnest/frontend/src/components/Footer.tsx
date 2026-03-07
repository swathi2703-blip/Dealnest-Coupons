import { Tag, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = {
    marketplace: [
      { name: "Browse Coupons", href: "/browse" },
      { name: "Sell Coupons", href: "/sell" },
      { name: "Categories", href: "/#categories" },
      { name: "How It Works", href: "/#how-it-works" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refunds" },
      { name: "FAQs", href: "/faqs" },
    ],
  };

  return (
    <footer className="bg-foreground text-background section-padding">
      <div className="container-main">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Tag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">CouponBazaar</span>
            </Link>
            <p className="text-background/70 mb-6 max-w-sm">
              India's #1 marketplace for buying and selling unused coupons, gift cards, and vouchers. Turn your unused coupons into cash!
            </p>
            <div className="space-y-3 text-background/70">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>hello@couponbazaar.in</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Marketplace</h4>
            <ul className="space-y-3">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/50 text-sm">
              © 2024 CouponBazaar. All rights reserved. Made with ❤️ in India
            </p>
            <div className="flex items-center gap-4">
              <span className="text-background/50 text-sm">Secure payments via</span>
              <div className="flex gap-2">
                <span className="bg-background/10 px-3 py-1 rounded text-xs">UPI</span>
                <span className="bg-background/10 px-3 py-1 rounded text-xs">Paytm</span>
                <span className="bg-background/10 px-3 py-1 rounded text-xs">Cards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;