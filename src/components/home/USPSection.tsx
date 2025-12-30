import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Shield, Sparkles, HeadphonesIcon } from 'lucide-react';

const usps = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free delivery on orders above ₹4,999 across India',
  },
  {
    icon: Shield,
    title: 'Authentic Products',
    description: '100% genuine handloom and handwoven sarees',
  },
  {
    icon: Sparkles,
    title: 'Premium Quality',
    description: 'Carefully curated collection with quality assurance',
  },
  {
    icon: HeadphonesIcon,
    title: 'Expert Support',
    description: 'Dedicated styling assistance and customer care',
  },
];

const USPSection: React.FC = () => {
  return (
    <section className="py-12 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {usps.map((usp, index) => (
            <motion.div
              key={usp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center lg:flex-row lg:text-left gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <usp.icon className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{usp.title}</h3>
                <p className="text-sm text-muted-foreground">{usp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default USPSection;
