import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNewArrivals, fetchBestSellers } from '@/store/homeSlice';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  filter: 'featured' | 'new';
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ title, subtitle, filter }) => {
  const dispatch = useAppDispatch();
  const { newArrivals, bestSellers, newArrivalsStatus, bestSellersStatus } = useAppSelector(state => state.home);

  useEffect(() => {
    if (filter === 'new') {
      dispatch(fetchNewArrivals());
    } else if (filter === 'featured') {
      dispatch(fetchBestSellers());
    }
  }, [filter, dispatch]);

  const products = filter === 'new' ? newArrivals : bestSellers;
  const isLoading = filter === 'new' ? newArrivalsStatus === 'loading' : bestSellersStatus === 'loading';

  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-16 lg:py-24 bg-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-12"
        >
          <div>
            <span className="text-gold text-sm font-semibold uppercase tracking-wider">
              {subtitle || (filter === 'featured' ? 'Customer Favorites' : 'Just Arrived')}
            </span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2">
              {title}
            </h2>
          </div>
          <Button asChild variant="ghost" className="mt-4 lg:mt-0 group">
            <Link to="/shop">
              View All
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {displayProducts.map((product, index) => (
              <ProductCard key={product._id || (product as any).id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
