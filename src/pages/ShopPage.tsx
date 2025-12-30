import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/categorySlice';
import { fetchProducts, setFilters } from '@/store/productsSlice';
import { getColorHex } from '@/hooks/useProducts'; // Keep utility function
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const priceRanges = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { label: 'Above ₹5,000', min: 5000, max: undefined },
];

const colorOptions = ['Red', 'Maroon', 'Gold', 'Blue', 'Green', 'Pink', 'White', 'Black'];
const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortOption, setSortOption] = useState('newest');

  const categoryFilter = searchParams.get('category') || '';
  const bestsellerFilter = searchParams.get('bestseller') === 'true';
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max?: number } | null>(null);

  const dispatch = useAppDispatch();
  const { items: products, status: productStatus, hasMore, page: currentPage, isFetchingMore } = useAppSelector(state => state.products);
  const { categories, status: categoryStatus } = useAppSelector(state => state.categories);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const observer = useRef<IntersectionObserver>();
  const lastProductElementRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetchingMore && productStatus === 'succeeded') {
      dispatch(fetchProducts({
        page: currentPage + 1,
        filters: {
          category: categoryFilter ? [categoryFilter] : [],
          color: selectedColors,
          fabric: [],
          priceRange: selectedPriceRange ? [selectedPriceRange.min, selectedPriceRange.max || 100000] : [0, 100000]
        },
        sort: sortOption,
        type: bestsellerFilter ? 'best-sellers' : 'all',
        append: true
      }));
    }
  }, [dispatch, hasMore, isFetchingMore, productStatus, currentPage, categoryFilter, selectedColors, selectedPriceRange, sortOption, bestsellerFilter]);

  useEffect(() => {
    if (productStatus === 'loading') return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (lastProductElementRef.current) {
      observer.current.observe(lastProductElementRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loadMore, hasMore, productStatus]);

  useEffect(() => {
    dispatch(fetchProducts({
      filters: {
        category: categoryFilter ? [categoryFilter] : [],
        color: selectedColors,
        fabric: [], // Or add fabric filter if needed
        priceRange: selectedPriceRange ? [selectedPriceRange.min, selectedPriceRange.max || 100000] : [0, 100000]
      },
      sort: sortOption,
      type: bestsellerFilter ? 'best-sellers' : 'all'
    }));
  }, [dispatch, categoryFilter, selectedColors, selectedPriceRange, bestsellerFilter, sortOption]);

  const isLoading = productStatus === 'loading';
  const filteredProducts = products;

  const clearFilters = () => {
    setSearchParams({});
    setSelectedColors([]);
    setSelectedPriceRange(null);
    setSearchQuery('');
  };

  const hasActiveFilters = categoryFilter || selectedColors.length > 0 || selectedPriceRange || bestsellerFilter;

  const currentCategory = categories?.find(c => c.slug === categoryFilter);

  return (
    <>
      <Helmet>
        <title>Shop Sarees - Shastik Fashions | Silk, Cotton, Designer & Bridal</title>
        <meta
          name="description"
          content="Browse our exclusive collection of handcrafted sarees. Filter by category, fabric, color, and price. Find your perfect Kanchipuram silk, cotton, or designer saree."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Page Header */}
          <section className="bg-gradient-to-r from-cream to-cream-dark py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
                  {currentCategory?.name || 'Shop All Sarees'}
                </h1>
                <p className="text-muted-foreground">
                  Discover {filteredProducts.length} beautiful sarees
                </p>
              </motion.div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(true)}
                  className="flex-1"
                >
                  <SlidersHorizontal size={18} />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {(categoryFilter ? 1 : 0) + selectedColors.length + (selectedPriceRange ? 1 : 0)}
                    </span>
                  )}
                </Button>

                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Desktop Sidebar Filters */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      placeholder="Search sarees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <X size={16} />
                      Clear all filters
                    </button>
                  )}

                  {/* Category Filter */}
                  <FilterSection title="Category">
                    <div className="space-y-2">
                      <button
                        onClick={() => setSearchParams({})}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!categoryFilter ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                          }`}
                      >
                        All Sarees
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat._id || (cat as any).id}
                          onClick={() => setSearchParams({ category: cat.slug })}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${categoryFilter === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                            }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Price Filter */}
                  <FilterSection title="Price Range">
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <button
                          key={range.label}
                          onClick={() => setSelectedPriceRange(
                            selectedPriceRange?.min === range.min ? null : range
                          )}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedPriceRange?.min === range.min ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                            }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  {/* Color Filter */}
                  <FilterSection title="Color">
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            if (selectedColors.includes(color)) {
                              setSelectedColors(selectedColors.filter(c => c !== color));
                            } else {
                              setSelectedColors([...selectedColors, color]);
                            }
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color) ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                            }`}
                          style={{ backgroundColor: getColorHex(color) }}
                          title={color}
                        />
                      ))}
                    </div>
                  </FilterSection>
                </div>
              </aside>

              <div className="flex-1">
                {isLoading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[3/4] rounded-xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-muted-foreground">
                        Showing {filteredProducts.length} results
                      </p>
                      <div className="relative">
                        <select
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value)}
                          className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none pr-8"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="price_high">Price: Low to High</option>
                          <option value="price_low">Price: High to Low</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground w-4 h-4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      {filteredProducts.map((product, index) => (
                        <ProductCard key={product._id || (product as any).id} product={product as any} index={index} />
                      ))}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    <div ref={lastProductElementRef} className="h-20 mt-8 flex justify-center items-center">
                      {isFetchingMore && (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground p-10">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-sm font-medium">Discovering more beautiful sarees...</p>
                        </div>
                      )}
                      {!hasMore && filteredProducts.length > 0 && (
                        <p className="text-muted-foreground text-sm italic py-10">
                          You've viewed all our currently available sarees.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg mb-4">No sarees found matching your filters</p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-foreground/50 z-50"
                onClick={() => setIsFilterOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween' }}
                className="fixed inset-y-0 left-0 w-80 bg-card z-50 overflow-y-auto"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-semibold">Filters</h2>
                    <button onClick={() => setIsFilterOpen(false)}>
                      <X size={24} />
                    </button>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-sm text-primary hover:underline mb-4"
                    >
                      <X size={16} />
                      Clear all filters
                    </button>
                  )}

                  <div className="space-y-6">
                    <FilterSection title="Category">
                      <div className="space-y-2">
                        <button
                          onClick={() => { setSearchParams({}); setIsFilterOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!categoryFilter ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                            }`}
                        >
                          All Sarees
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat._id || (cat as any).id}
                            onClick={() => { setSearchParams({ category: cat.slug }); setIsFilterOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${categoryFilter === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                              }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </FilterSection>

                    <FilterSection title="Price Range">
                      <div className="space-y-2">
                        {priceRanges.map((range) => (
                          <button
                            key={range.label}
                            onClick={() => setSelectedPriceRange(
                              selectedPriceRange?.min === range.min ? null : range
                            )}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedPriceRange?.min === range.min ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                              }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </FilterSection>

                    <FilterSection title="Color">
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              if (selectedColors.includes(color)) {
                                setSelectedColors(selectedColors.filter(c => c !== color));
                              } else {
                                setSelectedColors([...selectedColors, color]);
                              }
                            }}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color) ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                              }`}
                            style={{ backgroundColor: getColorHex(color) }}
                            title={color}
                          />
                        ))}
                      </div>
                    </FilterSection>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 font-semibold text-foreground"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;
