import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Mail
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useBackendAuth } from '@/hooks/useBackendAuth';
import { api } from '@/services/api';
import * as orderService from '@/services/orderService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAddresses, updateAddress } from '@/store/addressSlice';
import { z } from 'zod';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const shippingSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits').max(15),
  address: z.string().trim().min(10, 'Address must be at least 10 characters').max(500),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'State is required').max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

type ShippingForm = z.infer<typeof shippingSchema>;

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'upi', name: 'UPI', icon: Wallet, description: 'GPay, PhonePe, Paytm' },
  { id: 'cod', name: 'Cash on Delivery', icon: Truck, description: '₹50 extra charge' },
];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useBackendAuth();
  const dispatch = useAppDispatch();

  const addresses = useAppSelector(state => state.address.addresses);
  const addressStatus = useAppSelector(state => state.address.status);

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [formData, setFormData] = useState<ShippingForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    if (user) {
      dispatch(fetchAddresses());
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [user, dispatch]);

  // Set default address when addresses are loaded
  useEffect(() => {
    if (addressStatus === 'succeeded' && addresses.length > 0) {
      const defaultAddr = addresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id || (defaultAddr as any)._id);
        setFormData({
          fullName: defaultAddr.fullName,
          email: user?.email || defaultAddr.email || '',
          phone: defaultAddr.phone,
          address: defaultAddr.addressLine1,
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode
        });
      }
    }
  }, [addressStatus, addresses, user]);

  // State for fetched location data to ensure accurate shipping calculation
  const [fetchedState, setFetchedState] = useState('');

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (formData.pincode.length === 6 && /^\d{6}$/.test(formData.pincode)) {
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await response.json();

          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            const state = postOffice.State;
            const city = postOffice.District; // District is usually better for City, or Division

            setFetchedState(state);

            // Auto-fill city and state if they are empty or if we want to ensure correctness
            setFormData(prev => ({
              ...prev,
              state: state,
              city: city || prev.city
            }));
          }
        } catch (error) {
          console.error('Error fetching pincode details:', error);
        }
      }
    };

    fetchLocationDetails();
  }, [formData.pincode]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateShipping = () => {
    // Keep free shipping logic if it exists, or just apply the state-based logic?
    // User requested specifically based on state, but usually existing free shipping logic should persist.
    // Assuming preserving free shipping > 4999 logic as per existing code structure.
    if (totalPrice >= 4999) return 0;

    // Check state from form data or fetched state
    const currentState = fetchedState || formData.state;

    if (currentState.toLowerCase() === 'tamil nadu' || currentState.toLowerCase() === 'tamilnadu') {
      return 40;
    }
    return 60;
  };

  const shippingCost = calculateShipping();
  const codCharge = selectedPayment === 'cod' ? 50 : 0;
  const finalTotal = totalPrice + shippingCost + codCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ShippingForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateShipping = () => {
    const result = shippingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ShippingForm, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof ShippingForm;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      // If an address is selected, update it with current form data
      if (selectedAddressId && user) {
        try {
          await dispatch(updateAddress({
            id: selectedAddressId,
            updatedAddress: {
              fullName: formData.fullName,
              phone: formData.phone,
              email: formData.email,
              addressLine1: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              country: 'India', // Defaulting as it's not in checkout form
              addressType: 'Home' // Defaulting to Home or keeping existing would be better if we fetched it
            }
          })).unwrap();
        } catch (error) {
          console.error('Failed to update address during checkout:', error);
          // We don't block checkout if address update fails, just log it
        }
      }
      setStep('payment');
    }
  };

  const getOrderData = (orderNumber: string) => {
    const orderItems = items.map(item => ({
      id: item.product._id || (item.product as any).id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      variant: {
        color: item.selectedColor,
        image: item.selectedImage || item.product.images?.[0] || (item.product as any).image_url || '',
      }
    }));

    return {
      user_id: user?.id,
      order_number: orderNumber,
      items: orderItems,
      subtotal: totalPrice,
      shipping_cost: shippingCost,
      total: finalTotal,
      payment_method: selectedPayment,
      shipping_address: formData,
    };
  };

  const handleCODOrder = async () => {
    setIsProcessing(true);
    const newOrderId = `SF${Date.now().toString().slice(-8)}`;

    if (user) {
      try {
        await orderService.createOrder({
          products: items.map(item => ({
            product: item.product._id || (item.product as any).id,
            quantity: item.quantity,
            variant: {
              color: item.selectedColor,
              image: item.selectedImage || item.product.images?.[0] || (item.product as any).image_url
            }
          })),
          totalAmount: finalTotal,
          paymentStatus: 'pending',
          paymentMethod: 'COD',
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            addressLine1: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: 'India',
          },
        });
      } catch (error) {
        console.error('Error saving order:', error);
        toast({
          title: 'Order Failed',
          description: 'Failed to place order. Please try again.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }
    }

    setOrderId(newOrderId);
    clearCart();
    setStep('confirmation');
    setIsProcessing(false);

    toast({
      title: 'Order Placed Successfully!',
      description: `Your order #${newOrderId} has been confirmed.`,
    });
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: 'Please wait',
        description: 'Payment gateway is loading...',
      });
      return;
    }

    setIsProcessing(true);
    const newOrderId = `SF${Date.now().toString().slice(-8)}`;

    try {
      // Create Razorpay order
      const orderResponse = await api.post('/payments/razorpay/create-order', {
        amount: finalTotal,
        products: items.map(item => ({
          productId: item.product._id || (item.product as any).id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          variant: {
            color: item.selectedColor,
            image: item.selectedImage || item.product.images?.[0] || (item.product as any).image_url
          }
        })),
        receipt: newOrderId,
        notes: {
          customerId: user?.id || 'guest',
          source: 'web',
          customer_name: formData.fullName,
          customer_email: formData.email,
        },
        paymentMethod: 'Razorpay',
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          addressLine1: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
        },
      });

      if (orderResponse.status !== 200 && orderResponse.status !== 201) {
        throw new Error('Failed to create payment order');
      }

      const orderData = orderResponse.data;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Shastik Fashions',
        description: `Order #${newOrderId}`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        },
        theme: {
          color: '#B8860B',
        },
        method: {
          card: selectedPayment === 'card',
          upi: selectedPayment === 'upi',
          netbanking: false,
          wallet: false,
          paylater: false,
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_data: getOrderData(newOrderId),
            });

            // Check specific verified status from nested data object
            if (!verifyResponse.data?.data?.verified && !verifyResponse.data?.verified) {
              console.error('Verification failed payload:', verifyResponse.data);
              throw new Error('Payment verification failed');
            }

            setOrderId(newOrderId);
            clearCart();
            setStep('confirmation');

            toast({
              title: 'Payment Successful!',
              description: `Your order #${newOrderId} has been confirmed.`,
            });
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Verification Failed',
              description: 'Please contact support with your payment ID.',
              variant: 'destructive',
            });
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You can try again or choose a different payment method.',
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (selectedPayment === 'cod') {
      await handleCODOrder();
    } else {
      await handleRazorpayPayment();
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <>
        <Helmet>
          <title>Checkout | Shastik Fashions</title>
        </Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 flex items-center justify-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="font-display text-2xl font-bold text-foreground mb-3">
                Your Cart is Empty
              </h1>
              <p className="text-muted-foreground mb-6">
                Add some sarees to checkout.
              </p>
              <Button asChild variant="gold" size="lg">
                <Link to="/shop">Continue Shopping</Link>
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
        <title>{`Checkout | Shastik Fashions`}</title>
        <meta name="description" content="Complete your order at Shastik Fashions. Secure checkout with multiple payment options." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {['Shipping', 'Payment', 'Confirmation'].map((label, index) => {
                const stepIndex = ['shipping', 'payment', 'confirmation'].indexOf(step);
                const isActive = index <= stepIndex;
                const isCurrent = index === stepIndex;

                return (
                  <React.Fragment key={label}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                        {index < stepIndex ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>
                      <span className={`ml-2 text-sm font-medium hidden sm:block ${isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                        {label}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className={`w-12 sm:w-20 h-0.5 mx-2 ${index < stepIndex ? 'bg-primary' : 'bg-muted'
                        }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Order Summary - Shows first on mobile */}
              {step !== 'confirmation' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:hidden"
                >
                  <div className="bg-card p-4 rounded-xl shadow-sm">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <h2 className="font-display text-base font-semibold text-foreground">
                          Order Summary ({items.length} items)
                        </h2>
                        <span className="text-primary font-bold">{formatPrice(finalTotal)}</span>
                      </summary>
                      <div className="pt-4 mt-4 border-t border-border">
                        <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
                          {items.map((item) => (
                            <div key={item.product._id || (item.product as any).id} className="flex gap-3">
                              <img
                                src={item.selectedImage || item.product.images?.[0] || (item.product as any).image_url || ''}
                                alt={item.product.name}
                                className="w-12 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground line-clamp-1">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                <p className="text-sm font-semibold text-primary">
                                  {formatPrice(item.product.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatPrice(totalPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>{shippingCost === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shippingCost)}</span>
                          </div>
                          {codCharge > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">COD Charge</span>
                              <span>{formatPrice(codCharge)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                </motion.div>
              )}

              {/* Main Content */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {/* Shipping Form */}
                  {step === 'shipping' && (
                    <motion.div
                      key="shipping"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="bg-card p-6 rounded-xl shadow-sm">
                        <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Shipping Address
                          </span>
                        </h2>

                        {user && addresses.length > 0 && (
                          <div className="mb-6 grid sm:grid-cols-2 gap-3">
                            {addresses.map((addr) => (
                              <div
                                key={addr.id || (addr as any)._id}
                                onClick={() => {
                                  setSelectedAddressId(addr.id || (addr as any)._id);
                                  setFormData({
                                    fullName: addr.fullName,
                                    email: user.email || addr.email || '',
                                    phone: addr.phone,
                                    address: addr.addressLine1,
                                    city: addr.city,
                                    state: addr.state,
                                    pincode: addr.pincode
                                  });
                                }}
                                className={`border p-3 rounded-lg cursor-pointer transition-colors text-sm relative ${selectedAddressId === (addr.id || (addr as any)._id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                                  }`}
                              >
                                <p className="font-semibold">{addr.fullName}</p>
                                <p className="text-muted-foreground truncate">{addr.addressLine1}</p>
                                {addr.isDefault && (
                                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-bold uppercase rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <form onSubmit={handleShippingSubmit} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="fullName" className="flex items-center gap-1 mb-1.5">
                                <User className="w-3 h-3" /> Full Name
                              </Label>
                              <Input
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className={errors.fullName ? 'border-destructive' : ''}
                              />
                              {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                            </div>

                            <div>
                              <Label htmlFor="email" className="flex items-center gap-1 mb-1.5">
                                <Mail className="w-3 h-3" /> Email
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your@email.com"
                                className={errors.email ? 'border-destructive' : ''}
                              />
                              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="phone" className="flex items-center gap-1 mb-1.5">
                              <Phone className="w-3 h-3" /> Phone Number
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="10-digit mobile number"
                              className={errors.phone ? 'border-destructive' : ''}
                            />
                            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                          </div>

                          <div>
                            <Label htmlFor="address" className="mb-1.5">Full Address</Label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="House no, Street, Landmark"
                              className={errors.address ? 'border-destructive' : ''}
                            />
                            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                          </div>

                          <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="city" className="mb-1.5">City</Label>
                              <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="City"
                                className={errors.city ? 'border-destructive' : ''}
                              />
                              {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                            </div>

                            <div>
                              <Label htmlFor="state" className="mb-1.5">State</Label>
                              <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="State"
                                className={errors.state ? 'border-destructive' : ''}
                              />
                              {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                            </div>

                            <div>
                              <Label htmlFor="pincode" className="mb-1.5">Pincode</Label>
                              <Input
                                id="pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                placeholder="6-digit code"
                                className={errors.pincode ? 'border-destructive' : ''}
                              />
                              {errors.pincode && <p className="text-sm text-destructive mt-1">{errors.pincode}</p>}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button type="button" variant="outline" asChild className="order-2 sm:order-1">
                              <Link to="/cart">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Cart
                              </Link>
                            </Button>
                            <Button type="submit" variant="gold" className="flex-1 order-1 sm:order-2">
                              Continue to Payment
                            </Button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}

                  {/* Payment Selection */}
                  {step === 'payment' && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="bg-card p-6 rounded-xl shadow-sm">
                        <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          Payment Method
                        </h2>

                        <div className="space-y-3">
                          {paymentMethods.map((method) => (
                            <label
                              key={method.id}
                              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPayment === method.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                                }`}
                            >
                              <input
                                type="radio"
                                name="payment"
                                value={method.id}
                                checked={selectedPayment === method.id}
                                onChange={(e) => setSelectedPayment(e.target.value)}
                                className="sr-only"
                              />
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPayment === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                }`}>
                                <method.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{method.name}</p>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                              </div>
                              {selectedPayment === method.id && (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              )}
                            </label>
                          ))}
                        </div>

                        <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          <span>Your payment is secured by Razorpay</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep('shipping')}
                            className="order-2 sm:order-1"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                          </Button>
                          <Button
                            variant="gold"
                            className="flex-1 order-1 sm:order-2"
                            onClick={handlePlaceOrder}
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Processing...' : selectedPayment === 'cod' ? `Place Order • ${formatPrice(finalTotal)}` : `Pay ${formatPrice(finalTotal)}`}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Order Confirmation */}
                  {step === 'confirmation' && (
                    <motion.div
                      key="confirmation"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="bg-card p-8 rounded-xl shadow-sm text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.2 }}
                          className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </motion.div>

                        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                          Order Confirmed!
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          Thank you for shopping with Shastik Fashions
                        </p>

                        <div className="bg-muted/50 p-4 rounded-lg mb-6 inline-block">
                          <p className="text-sm text-muted-foreground">Order ID</p>
                          <p className="font-mono text-lg font-bold text-primary">{orderId}</p>
                        </div>

                        <div className="space-y-3 text-left bg-muted/30 p-4 rounded-lg mb-6">
                          <h3 className="font-semibold text-foreground">Shipping to:</h3>
                          <p className="text-sm text-muted-foreground">
                            {formData.fullName}<br />
                            {formData.address}<br />
                            {formData.city}, {formData.state} - {formData.pincode}<br />
                            Phone: {formData.phone}
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6">
                          A confirmation email has been sent to <strong>{formData.email}</strong>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button asChild variant="gold">
                            <Link to="/shop">Continue Shopping</Link>
                          </Button>
                          <Button asChild variant="outline">
                            <Link to="/">Go to Home</Link>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Order Summary Sidebar - Desktop only */}
              {step !== 'confirmation' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden lg:block lg:col-span-1"
                >
                  <div className="bg-card p-6 rounded-xl shadow-sm sticky top-24">
                    <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                      Order Summary
                    </h2>

                    <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                      {items.map((item) => (
                        <div key={item.product._id || (item.product as any).id} className="flex gap-3">
                          <img
                            src={item.selectedImage || item.product.images?.[0] || (item.product as any).image_url || ''}
                            alt={item.product.name}
                            className="w-16 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-2">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            <p className="text-sm font-semibold text-primary">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{shippingCost === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shippingCost)}</span>
                      </div>
                      {codCharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">COD Charge</span>
                          <span>{formatPrice(codCharge)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-border text-base font-semibold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-gold" />
                        100% Secure Payment
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="w-4 h-4 text-gold" />
                        Delivery in 5-7 business days
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CheckoutPage;
