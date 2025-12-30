import { useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBestSellers } from '@/store/homeSlice';

export const BestsellerProducts = () => {
  const dispatch = useAppDispatch();
  const { bestSellers, bestSellersStatus } = useAppSelector(state => state.home);
  const isLoading = bestSellersStatus === 'loading';

  useEffect(() => {
    dispatch(fetchBestSellers());
  }, [dispatch]);

  const products = bestSellers.slice(0, 4);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Top Selling
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Bestseller Collection
            </h2>
            <p className="text-muted-foreground mt-2">
              Our most loved pieces that customers can't get enough of
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex">
            <Link to="/shop?bestseller=true">
              View All Bestsellers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <ProductCard key={product._id || (product as any).id} product={product} index={index} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No bestseller products yet
            </div>
          )}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link to="/shop?bestseller=true">
              View All Bestsellers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
