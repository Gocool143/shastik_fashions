import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/types';
import { getColorHex } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const productId = product._id || (product as any).id;
  const isWishlisted = isInWishlist(productId);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ensureAuthenticated()) return;
    if (isWishlisted) {
      removeFromWishlist(productId);
      toast({ title: 'Removed from wishlist' });
    } else {
      addToWishlist(product as any);
      toast({ title: 'Added to wishlist', description: product.name });
    }
  };
  const ensureAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to perform this action.",
        variant: "destructive",
      });
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return false;
    }
    return true;
  };
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!ensureAuthenticated()) return;
    addToCart(product as any);
    toast({ title: 'Added to cart', description: product.name });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const displayImage = (product.images && product.images[0]) || (product as any).image_url || '';
  const colors = (product as any).colors || [product.color].filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-elegant transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <span className="px-3 py-1 bg-royal text-primary-foreground text-xs font-semibold rounded-full">
              Featured
            </span>
          )}
          {product.original_price && product.original_price > product.price && (
            <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
              {Math.round((1 - product.price / product.original_price) * 100)}% OFF
            </span>
          )}
          {product.in_stock === false && (
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          {/* <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full shadow-md transition-colors ${isWishlisted
              ? 'bg-primary text-primary-foreground'
              : 'bg-card hover:bg-primary hover:text-primary-foreground'
              }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button> */}
          <Link
            to={`/product/${productId}`}
            className="p-2 bg-card rounded-full shadow-md hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Quick view"
          >
            <Eye size={18} />
          </Link>
        </div>

        {/* Add to Cart Button */}
        {/* <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Button
            onClick={handleAddToCart}
            className="w-full"
            variant="gold"
            disabled={product.in_stock === false}
          >
            <ShoppingBag size={18} />
            Add to Cart
          </Button>
        </div> */}
      </div>

      {/* Product Info */}
      <Link to={`/product/${productId}`} className="block p-4">
        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
        )}
        <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary text-lg">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-muted-foreground text-sm line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Color Options */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            {colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: getColorHex(color) }}
                title={color}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-xs text-muted-foreground">+{colors.length - 4}</span>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default ProductCard;
