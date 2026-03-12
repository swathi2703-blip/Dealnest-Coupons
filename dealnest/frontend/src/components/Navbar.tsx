import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AccountMode, applyAccountModeTheme, getAccountMode, setAccountMode } from "@/lib/accountMode";
import BrandLogo from "@/components/BrandLogo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [accountMode, setLocalAccountMode] = useState<AccountMode>("buyer");
  const navigate = useNavigate();

  useEffect(() => {
    const mode = getAccountMode();
    setLocalAccountMode(mode);
    applyAccountModeTheme(mode);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleModeSwitch = (mode: AccountMode) => {
    setLocalAccountMode(mode);
    setAccountMode(mode);
    setIsOpen(false);

    if (mode === "buyer") {
      navigate("/browse");
      return;
    }

    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const navLinks = accountMode === "seller"
    ? [
        { name: "Sell Coupon", href: "/sell" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "How it Works", href: "/#how-it-works" },
        { name: "Categories", href: "/#categories" },
      ]
    : [
        { name: "Browse Coupons", href: "/browse" },
        { name: "How it Works", href: "/#how-it-works" },
        { name: "Categories", href: "/#categories" },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container-main px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <BrandLogo imageClassName="h-10 md:h-11 w-auto" textClassName="font-display font-bold text-xl text-foreground" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 mr-1">
                <button
                  onClick={() => handleModeSwitch("buyer")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    accountMode === "buyer"
                      ? "bg-[#ff9f2a] text-white"
                      : "bg-background text-[#ff9f2a] border border-[#ff9f2a]/40 hover:bg-[#ff9f2a]/10"
                  }`}
                >
                  Buyer
                </button>
                <button
                  onClick={() => handleModeSwitch("seller")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    accountMode === "seller"
                      ? "bg-[#20c8be] text-white"
                      : "bg-background text-[#20c8be] border border-[#20c8be]/40 hover:bg-[#20c8be]/10"
                  }`}
                >
                  Seller
                </button>
              </div>
            )}
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button onClick={handleLogout} className="btn-outline text-sm py-2">Log Out</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-outline text-sm py-2">Log In</Link>
                <Link to="/auth?mode=signup" className="btn-primary text-sm py-2">Sign Up Free</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-up">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <div className="flex items-center gap-2 py-2">
                  <button
                    onClick={() => handleModeSwitch("buyer")}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      accountMode === "buyer"
                        ? "bg-[#ff9f2a] text-white"
                        : "text-[#ff9f2a] border border-[#ff9f2a]/40 hover:bg-[#ff9f2a]/10"
                    }`}
                  >
                    Buyer
                  </button>
                  <button
                    onClick={() => handleModeSwitch("seller")}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      accountMode === "seller"
                        ? "bg-[#20c8be] text-white"
                        : "text-[#20c8be] border border-[#20c8be]/40 hover:bg-[#20c8be]/10"
                    }`}
                  >
                    Seller
                  </button>
                </div>
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link to="/profile" className="btn-outline text-sm py-2 text-center" onClick={() => setIsOpen(false)}>Profile</Link>
                    <button onClick={handleLogout} className="btn-primary text-sm py-2">Log Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" className="btn-outline text-sm py-2 text-center" onClick={() => setIsOpen(false)}>Log In</Link>
                    <Link to="/auth?mode=signup" className="btn-primary text-sm py-2 text-center" onClick={() => setIsOpen(false)}>Sign Up Free</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;