import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PromoBanner: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1604502369947-e1e25e56eb66?w=1920&q=80"
          alt="Bridal saree collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon/95 via-maroon/80 to-maroon/60" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-royal/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full">
              <Sparkles className="w-4 h-4 text-gold-light" />
              <span className="text-sm font-medium text-gold-light">Exclusive Bridal Collection</span>
            </div>

            <h2 className="font-display text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground leading-tight">
              Make Your Special Day
              <span className="block text-gold-light">Unforgettable</span>
            </h2>

            <p className="text-primary-foreground/80 text-lg max-w-lg">
              Handpicked bridal sarees with exquisite craftsmanship, 
              rich zari work, and timeless designs for your most precious moments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="gold" size="xl">
                <Link to="/shop?category=bridal">
                  Shop Bridal Collection
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="xl">
                <Link to="/shop">
                  Book Consultation
                </Link>
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 pt-6">
              {['Free Blouse Stitching', 'Premium Packaging', 'Expert Styling'].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-primary-foreground/90">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
