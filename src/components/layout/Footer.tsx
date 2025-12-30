import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';
import logo from '@/assets/logo-new.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground pb-20 lg:pb-0">
      <div className="bg-gradient-maroon py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-display text-2xl lg:text-3xl mb-3">Join the Shastik Family</h3>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Subscribe to receive exclusive offers, new arrivals, and styling tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-gold text-foreground font-semibold rounded-lg hover:shadow-gold transition-shadow"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="Shastik Fashions" className="h-16 lg:h-24 w-auto brightness-0 invert" />
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Celebrating the timeless elegance of Indian tradition with exquisite sarees crafted for the modern woman.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-gold hover:text-foreground transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-gold hover:text-foreground transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-gold hover:text-foreground transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="text-primary-foreground/70 hover:text-gold transition-colors">All Sarees</Link></li>
              <li><Link to="/shop?category=silk" className="text-primary-foreground/70 hover:text-gold transition-colors">Silk Sarees</Link></li>
              <li><Link to="/shop?category=cotton" className="text-primary-foreground/70 hover:text-gold transition-colors">Cotton Sarees</Link></li>
              <li><Link to="/shop?category=bridal" className="text-primary-foreground/70 hover:text-gold transition-colors">Bridal Collection</Link></li>
              <li><Link to="/shop?category=designer" className="text-primary-foreground/70 hover:text-gold transition-colors">Designer Sarees</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-primary-foreground/70 hover:text-gold transition-colors">Track Order</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-gold transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-gold transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-gold transition-colors">Size Guide</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-gold transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/70">
                  123 Silk Street, T. Nagar,<br />Chennai, Tamil Nadu 600017
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gold flex-shrink-0" />
                <a href="tel:+919876543210" className="text-primary-foreground/70 hover:text-gold transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gold flex-shrink-0" />
                <a href="mailto:hello@shastikfashions.com" className="text-primary-foreground/70 hover:text-gold transition-colors">
                  hello@shastikfashions.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>© 2024 Shastik Fashions. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
