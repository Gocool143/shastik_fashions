import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';

const WishlistPage: React.FC = () => {
  const { items, removeFromWishlist, clearWishlist, moveAllToCart } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    console.log(product);

    if (product.colors && product.colors.length > 0) {
      toast({
        title: 'Select Variant',
        description: `Please select a color for ${product.name} before adding to cart.`,
        variant: 'destructive',
      });
      return;
    }

    addToCart(product);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleMoveAllToCart = () => {
    const hasVariants = items.some(item => item.colors && item.colors.length > 0);

    if (hasVariants) {
      toast({
        title: 'Action Required',
        description: 'Some products have variants. Please select colors for them individually.',
        variant: 'destructive',
      });
      return;
    }

    const itemCount = items.length;
    moveAllToCart();
    toast({
      title: 'Moving items to cart',
      description: `${itemCount} items are being added to your cart.`,
    });
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>My Wishlist | Shastik Fashions</title>
        </Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 flex items-center justify-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-3">
                Your Wishlist is Empty
              </h1>
              <p className="text-muted-foreground mb-6">
                Save your favorite sarees for later.
              </p>
              <Button asChild variant="gold" size="lg">
                <Link to="/shop">
                  Explore Collection
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`My Wishlist (${items.length}) | Shastik Fashions`}</title>
        <meta name="description" content="Your saved sarees at Shastik Fashions. Move them to cart when you're ready to purchase." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl lg:text-3xl font-bold text-foreground"
              >
                My Wishlist <span className="text-muted-foreground font-normal text-lg">({items.length} items)</span>
              </motion.h1>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={clearWishlist}>
                  Clear All
                </Button>
                <Button variant="gold" size="sm" onClick={handleMoveAllToCart}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Move All to Cart
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((product, index) => {
                const productId = product._id || (product as any).id;
                const productImage = product.images?.[0] || product.image_url;
                const originalPrice = product.original_price || product.originalPrice;

                return (
                  <motion.div
                    key={productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-elegant transition-all"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Link to={`/product/${productId}`}>
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>

                      {/* Remove button */}
                      <button
                        onClick={() => removeFromWishlist(productId)}
                        className="absolute top-3 right-3 p-2 bg-card/90 rounded-full shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.featured && (
                          <span className="px-3 py-1 bg-royal text-primary-foreground text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        )}
                        {originalPrice && originalPrice > product.price && (
                          <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
                            {Math.round((1 - product.price / originalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {product.category?.name || product.fabric}
                      </p>
                      <Link
                        to={`/product/${productId}`}
                        className="block font-display font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="font-semibold text-primary text-lg">
                          {formatPrice(product.price)}
                        </span>
                        {originalPrice && originalPrice > product.price && (
                          <span className="text-muted-foreground text-sm line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleAddToCart(product)}
                        variant="outline"
                        className="w-full"
                      >
                        <ShoppingBag size={16} className="mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8 text-center">
              <Link to="/shop" className="inline-flex items-center gap-2 text-primary hover:underline">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WishlistPage;
