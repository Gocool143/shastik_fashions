import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, Heart, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useBackendAuth } from '@/hooks/useBackendAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  searchProducts as searchProductsThunk,
  selectSearchResults,
  selectSearchStatus,
  clearSearchResults
} from '@/store/searchSlice';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import logo from '@/assets/logo-new.png';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Soft Silk', path: '/shop?category=soft-silk' },
  { name: 'Cotton Sarees', path: '/shop?category=cotton' },
  { name: 'Bridal', path: '/shop?category=bridal' },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { user } = useBackendAuth();
  const dispatch = useAppDispatch();
  const searchResults = useAppSelector(selectSearchResults);
  const searchStatus = useAppSelector(selectSearchStatus);
  const isSearching = searchStatus === 'loading';
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 400);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      dispatch(searchProductsThunk({ query: debouncedQuery }));
    } else {
      dispatch(clearSearchResults());
    }
  }, [debouncedQuery, dispatch]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleProductClick = (productId: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top announcement bar */}
      <div className="bg-gradient-maroon text-primary-foreground py-2 text-center text-sm">
        <p>✨ Free Shipping on orders above ₹4,999 | Use code <span className="font-semibold text-gold-light">SHASTIK10</span> for 10% off</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo - centered on mobile */}
          <Link to="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <motion.img
              src={logo}
              alt="Shastik Fashions"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-12 lg:h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`link-underline text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path
                  ? 'text-primary'
                  : 'text-muted-foreground'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link to="/wishlist" className="hidden lg:block relative p-2 hover:bg-muted rounded-full transition-colors" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {wishlistItems}
                </motion.span>
              )}
            </Link>

            <Link
              to={user ? '/account' : '/auth'}
              className={`hidden lg:flex relative p-2 hover:bg-muted rounded-full transition-colors items-center justify-center ${user ? 'bg-primary/10' : ''}`}
              aria-label={user ? 'Account' : 'Login'}
            >
              <User size={20} className={user ? 'text-primary' : ''} />
            </Link>

            <Link to="/cart" className="hidden lg:block relative p-2 hover:bg-muted rounded-full transition-colors">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              ref={searchContainerRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-visible pb-4"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for sarees, fabrics, colors..."
                  className="w-full pl-12 pr-4 py-3 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" size={20} />
                )}
              </div>

              {/* Search Results Dropdown */}
              {debouncedQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 mt-2 mx-4 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm">Searching...</p>
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.slice(0, 6).map((product) => (
                        <button
                          key={product._id || (product as any).id}
                          onClick={() => handleProductClick(product._id || (product as any).id)}
                          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted transition-colors text-left"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {product.category?.name || 'Uncategorized'}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </button>
                      ))}
                      {searchResults.length > 6 && (
                        <button
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigate(`/shop?q=${encodeURIComponent(debouncedQuery)}`);
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-3 text-center text-primary hover:bg-muted transition-colors font-medium border-t border-border"
                        >
                          View all {searchResults.length} results
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <p className="text-sm">No products found for "{debouncedQuery}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-[104px] bg-background z-40 lg:hidden"
          >
            <nav className="flex flex-col p-6 gap-4 bg-background">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block py-3 text-lg font-medium border-b border-border ${location.pathname === link.path
                      ? 'text-primary'
                      : 'text-foreground'
                      }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Account Link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Link
                  to={user ? '/account' : '/auth'}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 py-3 text-lg font-medium border-b border-border ${user ? 'text-primary' : 'text-foreground'
                    }`}
                >
                  <User size={20} />
                  {user ? 'My Account' : 'Login / Sign Up'}
                </Link>
              </motion.div>

              {/* Mobile Wishlist Link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navLinks.length + 1) * 0.1 }}
              >
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 py-3 text-lg font-medium border-b border-border text-foreground"
                >
                  <Heart size={20} />
                  Wishlist {wishlistItems > 0 && `(${wishlistItems})`}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
