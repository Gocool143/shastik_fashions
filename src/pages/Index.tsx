import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { BestsellerProducts } from '@/components/home/BestsellerProducts';
import PromoBanner from '@/components/home/PromoBanner';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import USPSection from '@/components/home/USPSection';

const Index: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Shastik Fashions - Premium Sarees & Traditional Indian Fashion</title>
        <meta 
          name="description" 
          content="Discover exquisite handcrafted sarees at Shastik Fashions. Shop Kanchipuram silk, cotton, designer & bridal sarees. Free shipping across India on orders above ₹4,999." 
        />
        <meta name="keywords" content="sarees, silk sarees, Kanchipuram sarees, bridal sarees, Indian fashion, traditional wear" />
        <link rel="canonical" href="https://shastikfashions.com" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <HeroSection />
          <USPSection />
          <CategoriesSection />
          <FeaturedProducts title="New Arrivals" filter="new" />
          <PromoBanner />
          <BestsellerProducts />
          <TestimonialsSection />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
