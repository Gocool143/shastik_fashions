import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Share2, Truck, Shield, RefreshCw, Minus, Plus, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { getColorHex } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { useBackendAuth } from '@/hooks/useBackendAuth';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductDetails } from '@/store/productDetailsSlice';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useBackendAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();

  const { product, relatedProducts, status, relatedStatus } = useAppSelector(state => state.productDetails);
  const isLoading = status === 'loading';

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
    }
  }, [id, dispatch]);

  // Set initial color when product loads - REMOVED to force manual selection
  // useEffect(() => {
  //   if (product?.colors && product.colors.length > 0 && !selectedColor) {
  //     setSelectedColor(product.colors[0]);
  //   }
  // }, [product, selectedColor]);

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImage(0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
            <Link to="/shop" className="text-primary hover:underline">
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const ensureAuthenticated = () => {
    if (!user) {
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

  const handleAddToCart = () => {
    if (!ensureAuthenticated()) return;

    // Ensure color is selected if colors are available
    if (colors.length > 0 && !selectedColor) {
      toast({
        title: "Please select a color",
        description: "You must select a color before adding to cart",
        variant: "destructive",
      });
      return;
    }

    // Pass the selected color and the current image (specific to color or default)
    addToCart(product, selectedColor, quantity, currentImage || undefined);
    toast({
      title: "Added to cart!",
      description: `${product.name} ${selectedColor ? `(${selectedColor})` : ''} has been added to your cart.`,
    });
  };

  const handleBuyNow = async () => {
    if (!ensureAuthenticated()) return;

    if (colors.length > 0 && !selectedColor) {
      toast({
        title: "Please select a color",
        description: "You must select a color to proceed",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart(product, selectedColor, quantity, currentImage || undefined);
      navigate('/checkout');
    } catch (error) {
      console.error('Error in Buy Now:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this beautiful saree: ${product.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Product link copied to clipboard.",
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const isCurrentInWishlist = isInWishlist(product._id || (product as any).id);

  const handleWishlistToggle = () => {
    if (!ensureAuthenticated()) return;

    if (isCurrentInWishlist) {
      removeFromWishlist(product._id || (product as any).id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist!",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  // Build images array - use images array if available, otherwise fallback to image_url
  const images = product.images && product.images.length > 0
    ? product.images
    : product.image_url
      ? [product.image_url]
      : [];

  const colors = product.colors || [];
  const colorImages = (product.color_images as Record<string, string>) || {};

  // Get the current image to display based on selected color
  const getCurrentImage = (): string | null => {
    // If there's a color-specific image for the selected color, use it
    if (selectedColor && colorImages[selectedColor]) {
      return colorImages[selectedColor];
    }
    // Otherwise fall back to the images array
    if (images.length > selectedImage) {
      return images[selectedImage];
    }
    return images[0] || null;
  };

  const currentImage = getCurrentImage();

  return (
    <>
      <Helmet>
        <title>{product.name} | Shastik Fashions</title>
        <meta name="description" content={product.description || ''} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
        <Header />

        <main className="flex-1 overflow-x-hidden">
          {/* Breadcrumb */}
          <nav className="container mx-auto px-4 py-4">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden">
              <li className="flex-shrink-0"><Link to="/" className="hover:text-primary">Home</Link></li>
              <li className="flex-shrink-0">/</li>
              <li className="flex-shrink-0"><Link to="/shop" className="hover:text-primary">Shop</Link></li>
              <li className="flex-shrink-0">/</li>
              <li className="text-foreground truncate">{product.name}</li>
            </ol>
          </nav>

          {/* Product Section */}
          <section className="container mx-auto px-4 py-4 sm:py-8">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
              {/* Image Gallery */}
              <div className="space-y-3 sm:space-y-4">
                {/* Main Image */}
                <div
                  className="relative w-full aspect-square sm:aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-muted"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                >
                  {currentImage ? (
                    <motion.img
                      key={currentImage}
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1, scale: isZoomed ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image available
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2">
                    {product.featured && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-royal text-primary-foreground text-xs sm:text-sm font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                    {product.original_price && product.original_price > product.price && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-destructive text-destructive-foreground text-xs sm:text-sm font-semibold rounded-full">
                        {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1 sm:gap-2">
                    <button
                      onClick={handleWishlistToggle}
                      className={`p-1.5 sm:p-2 bg-card rounded-full shadow-md hover:bg-primary hover:text-primary-foreground transition-colors ${isCurrentInWishlist ? 'text-primary' : ''}`}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrentInWishlist ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-1.5 sm:p-2 bg-card rounded-full shadow-md hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Thumbnails - Only show if multiple images */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {selectedImage === index && (
                          <div className="absolute inset-0 bg-primary/10" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  {product.category && (
                    <p className="text-gold text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">
                      {product.category.name}
                    </p>
                  )}
                  <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                    {product.name}
                  </h1>
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-base sm:text-lg text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                {product.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div>
                    <p className="font-semibold mb-3">
                      Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color, index) => (
                        <button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            // If there's a specific image for this color, find its index
                            if (colorImages[color]) {
                              const imgIndex = images.indexOf(colorImages[color]);
                              if (imgIndex !== -1) {
                                setSelectedImage(imgIndex);
                              }
                            } else if (images.length > index) {
                              // Fallback: assume color index corresponds to image index
                              setSelectedImage(index);
                            }
                          }}
                          className={`relative w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color
                            ? 'border-primary scale-110 ring-2 ring-primary/30'
                            : 'border-border hover:scale-105'
                            }`}
                          style={{ backgroundColor: getColorHex(color) }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <Check
                              className="absolute inset-0 m-auto"
                              size={16}
                              style={{
                                color: ['white', 'cream', 'beige', 'yellow', 'gold', 'silver'].includes(color.toLowerCase())
                                  ? '#000'
                                  : '#fff'
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {/* <div>
                  <p className="font-semibold mb-3">Quantity</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-muted transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 hover:bg-muted transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div> */}

                {/* Stock Status */}
                {product.in_stock === false && (
                  <p className="text-destructive font-semibold">Out of Stock</p>
                )}

                {/* Add to Cart */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={handleAddToCart}
                    variant="gold"
                    size="lg"
                    className="flex-1"
                    disabled={product.in_stock === false || (colors.length > 0 && !selectedColor)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="default"
                    size="lg"
                    className="flex-1"
                    disabled={product.in_stock === false || (colors.length > 0 && !selectedColor)}
                  >
                    Buy Now
                  </Button>
                </div>

                {colors.length > 0 && !selectedColor && (
                  <p className="text-sm text-destructive mt-2 text-center sm:text-left">
                    * Please select a color to proceed
                  </p>
                )}

                {/* USPs */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-border">
                  <div className="text-center">
                    <Truck className="w-6 h-6 mx-auto mb-2 text-gold" />
                    <p className="text-xs text-muted-foreground">Free Shipping</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-gold" />
                    <p className="text-xs text-muted-foreground">Authentic Product</p>
                  </div>
                  <div className="text-center">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 text-gold" />
                    <p className="text-xs text-muted-foreground">Easy Returns</p>
                  </div>
                </div>

                {/* Sizes if available */}
                {(product as any).sizes && (product as any).sizes.length > 0 && (
                  <div className="pt-6 border-t border-border">
                    <h3 className="font-semibold mb-3">Available Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                      {(product as any).sizes.map((size: string) => (
                        <span
                          key={size}
                          className="px-3 py-1 border border-border rounded-md text-sm"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="bg-cream py-16">
              <div className="container mx-auto px-4">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-8">
                  You May Also Like
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {relatedProducts.map((relProduct, index) => (
                    <ProductCard key={relProduct._id || (relProduct as any).id} product={relProduct} index={index} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetailPage;
