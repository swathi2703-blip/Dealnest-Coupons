import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturedDeals from "@/components/FeaturedDeals";
import Categories from "@/components/Categories";
import PartnerCTA from "@/components/PartnerCTA";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturedDeals />
        <Categories />
        <PartnerCTA />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
