import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart, updatingItemId } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const shippingCost = totalPrice >= 4999 ? 0 : 199;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Your Cart | Shastik Fashions</title>
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
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-3">
                Your Cart is Empty
              </h1>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any sarees yet.
              </p>
              <Button asChild variant="gold" size="lg">
                <Link to="/shop">
                  Continue Shopping
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
        <title>{`Your Cart (${items.length} items) | Shastik Fashions`}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl lg:text-3xl font-bold text-foreground"
              >
                Your Shopping Cart
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground"
              >
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </motion.p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => {
                    const productId = item.product._id || (item.product as any).id;
                    const productImage = item.selectedImage || item.product.images?.[0] || item.product.image_url;
                    const isUpdating = updatingItemId === productId;

                    return (
                      <motion.div
                        key={productId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 bg-card p-4 rounded-xl shadow-sm border border-border/50 hover:border-primary/20 transition-colors relative transition-opacity duration-300"
                        style={{ opacity: isUpdating ? 0.7 : 1 }}
                      >
                        {/* Image */}
                        <Link to={`/product/${productId}`} className="flex-shrink-0 relative group">
                          <img
                            src={productImage}
                            alt={item.product.name}
                            className="w-24 h-32 lg:w-32 lg:h-40 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300"
                          />
                          {isUpdating && (
                            <div className="absolute inset-0 bg-background/40 flex items-center justify-center rounded-lg">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          )}
                        </Link>

                        {/* Info */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <Link
                                to={`/product/${productId}`}
                                className="font-display font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                              >
                                {item.product.name}
                              </Link>
                              <button
                                onClick={() => removeFromCart(productId)}
                                disabled={isUpdating}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                aria-label="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.product.category?.name}
                            </p>
                            {item.selectedColor && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded-full">
                                  Color: {item.selectedColor}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
                              <button
                                onClick={() => updateQuantity(productId, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-2 hover:bg-background hover:text-primary disabled:opacity-30 rounded-md transition-all shadow-sm"
                                aria-label="Decrease quantity"
                              >
                                {item.quantity <= 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                              </button>
                              <span className="w-10 text-center text-sm font-bold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(productId, item.quantity + 1)}
                                disabled={isUpdating}
                                className="p-2 hover:bg-background hover:text-primary disabled:opacity-30 rounded-md transition-all shadow-sm"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-0.5">
                                {formatPrice(item.product.price)} x {item.quantity}
                              </p>
                              <p className="font-bold text-primary text-lg">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Clear Cart */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your entire cart?')) {
                        clearCart();
                      }
                    }}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Clear entire cart
                  </button>
                  <Button asChild variant="link" className="text-primary p-0 h-auto">
                    <Link to="/shop" className="flex items-center gap-1">
                      Add more items
                      <Plus size={14} />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-card p-6 rounded-xl shadow-elegant border border-border sticky top-24">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gold" />
                    Order Summary
                  </h2>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({items.length} items)</span>
                      <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>Shipping</span>
                        {shippingCost > 0 && (
                          <div className="group relative">
                            <span className="cursor-help text-[10px] bg-muted px-1 rounded-full">?</span>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              Free shipping on orders over ₹4,999
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="font-medium">
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-bold uppercase tracking-wider text-[10px]">FREE</span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>

                    {shippingCost > 0 && (
                      <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <p className="text-xs text-primary font-medium flex items-center gap-2">
                          <Truck className="w-3 h-3" />
                          Add {formatPrice(4999 - totalPrice)} more for free shipping
                        </p>
                        <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (totalPrice / 4999) * 100)}%` }}
                            className="h-full bg-gold"
                          />
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border pt-4 mt-2">
                      <div className="flex justify-between items-end">
                        <span className="font-semibold text-base">Total Amount</span>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Inclusive of all taxes</p>
                          <span className="font-bold text-2xl text-primary leading-none">
                            {formatPrice(finalTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="mt-8">
                    <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Apply Coupon</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                      />
                      <Button variant="outline" size="sm" className="px-4">Apply</Button>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button asChild variant="gold" size="xl" className="w-full mt-8 shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all group">
                    <Link to="/checkout" className="flex items-center justify-center gap-2">
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  {/* Trust guarantees */}
                  <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-gold-dark shrink-0" />
                      <span>100% Secure SSL encrypted payments & authentic products.</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                      <Truck className="w-5 h-5 text-gold-dark shrink-0" />
                      <span>Reliable express delivery across India.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-12 flex justify-center">
              <Button asChild variant="ghost" className="hover:bg-transparent hover:underline text-primary">
                <Link to="/shop" className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Return to Collection
                </Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CartPage;
