import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useBackendAuth } from '@/hooks/useBackendAuth';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Shop', path: '/shop', icon: Store },
  { name: 'Wishlist', path: '/wishlist', icon: Heart },
  { name: 'Cart', path: '/cart', icon: ShoppingBag },
  { name: 'Account', path: '/account', icon: User, authPath: '/auth' },
];

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { user } = useBackendAuth();

  // Hide bottom nav on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getPath = (item: typeof navItems[0]) => {
    if (item.authPath && !user) return item.authPath;
    return item.path;
  };

  const getBadgeCount = (name: string) => {
    if (name === 'Cart') return totalItems;
    if (name === 'Wishlist') return wishlistItems;
    return 0;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path) || (item.authPath && location.pathname === item.authPath);
          const badgeCount = getBadgeCount(item.name);
          
          return (
            <Link
              key={item.name}
              to={getPath(item)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <item.icon 
                  size={22} 
                  className={active ? 'text-primary' : ''} 
                  strokeWidth={active ? 2.5 : 2}
                />
                {badgeCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </motion.span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? 'text-primary' : ''}`}>
                {item.name}
              </span>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
