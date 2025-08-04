import Header from '@/components/Header';
import DynamicHeroSection from '@/components/DynamicHeroSection';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import ProductsSection from '@/components/ProductsSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import FloatingChatBot from '@/components/FloatingChatBot';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <DynamicHeroSection />
        <AboutSection />
        <ServicesSection />
        <ProductsSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingChatBot />
    </div>
  );
};

export default Index;
