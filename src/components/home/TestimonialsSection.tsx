import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Chennai',
    rating: 5,
    text: 'Absolutely stunning sarees! The Kanchipuram silk I bought for my wedding was breathtaking. The quality exceeded my expectations.',
    // image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
  },
  {
    id: 2,
    name: 'Kavitha Rajan',
    location: 'Bangalore',
    rating: 5,
    text: 'Shastik Fashions never disappoints. The attention to detail and authentic weaves make every purchase worthwhile.',
    // image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
  {
    id: 3,
    name: 'Meera Krishnan',
    location: 'Coimbatore',
    rating: 5,
    text: 'Found my dream bridal saree here. The team helped me choose the perfect piece. Highly recommend!',
    // image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&q=80',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-gold text-sm font-semibold uppercase tracking-wider">Testimonials</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2">
            What Our Customers Say
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-card p-6 lg:p-8 rounded-2xl shadow-md hover:shadow-elegant transition-shadow duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-gold/20" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gold/30"
                /> */}
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
