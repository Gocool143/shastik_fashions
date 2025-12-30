import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  Loader2,
  ShoppingBag,
  Trash2,
  Plus,
  Edit
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBackendAuth } from '@/hooks/useBackendAuth';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/store/addressSlice';
import { updateProfile, getProfile } from '@/store/userSlice';
import * as orderService from '@/services/orderService';

interface Profile {
  name: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  razorpayOrderId: string;
  products: any[];
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, signOut, loading: authLoading } = useBackendAuth();
  const { toast } = useToast();

  const addresses = useAppSelector(state => state.address.addresses);
  const addressStatus = useAppSelector(state => state.address.status);

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [profile, setProfile] = useState<Profile>({
    name: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const hasFetched = React.useRef(false);

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    addressType: 'Home' as 'Home' | 'Work',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !hasFetched.current) {
      dispatch(getProfile());
      fetchOrders();
      hasFetched.current = true;
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    console.log(user);
    if (!user) return;

    setProfile({
      name: user.name || '',
      mobile: (user as any).mobile || '',
      address: (user as any).address || '',
      city: (user as any).city || '',
      state: (user as any).state || '',
      pincode: (user as any).pincode || '',
    });
    setIsLoading(false);
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const data = await orderService.getOrders();
      console.log(data);

      setOrders(data as any);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { updateProfile } = await import('@/store/userSlice');
      await dispatch(updateProfile(profile));
      toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await dispatch(setDefaultAddress(id)).unwrap();
      toast({ title: 'Default Address Updated', description: 'Your default shipping address has been updated.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update default address.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed Out', description: 'Come back soon!' });
    navigate('/');
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingAddressId) {
        await dispatch(updateAddress({ id: editingAddressId, updatedAddress: newAddress })).unwrap();
        toast({ title: 'Address Updated', description: 'Your address has been updated.' });
      } else {
        await dispatch(addAddress(newAddress)).unwrap();
        toast({ title: 'Address Added', description: 'Your new address has been saved.' });
      }
      setIsAddingAddress(false);
      setEditingAddressId(null);
      setNewAddress({
        fullName: '',
        phone: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        addressType: 'Home',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingAddressId ? 'update' : 'add'} address.`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id || (addr as any)._id);
    setNewAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      email: addr.email || '',
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || 'India',
      addressType: addr.addressType,
    });
    setIsAddingAddress(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>My Account | Shastik Fashions</title>
        <meta name="description" content="Manage your Shastik Fashions account, view orders, and update your profile." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-8"
            >
              My Account
            </motion.h1>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-card p-4 rounded-xl shadow-sm">
                  <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-sm text-muted-foreground">Logged in as</p>
                    <p className="font-medium text-foreground truncate">{user.email}</p>
                  </div>

                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${activeTab === 'profile'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <User size={18} />
                        Profile
                      </span>
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${activeTab === 'orders'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <Package size={18} />
                        Orders
                      </span>
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={() => setActiveTab('addresses')}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${activeTab === 'addresses'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <MapPin size={18} />
                        Addresses
                      </span>
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </nav>
                </div>
              </motion.div>

              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3"
              >
                {activeTab === 'profile' && (
                  <div className="bg-card p-6 rounded-xl shadow-sm">
                    <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Profile Information
                    </h2>

                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={profile.name}
                            onChange={handleProfileChange}
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="mobile">Phone Number</Label>
                          <Input
                            id="mobile"
                            name="mobile"
                            value={profile.mobile}
                            onChange={handleProfileChange}
                            placeholder="10-digit mobile number"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={profile.address || ''}
                          onChange={handleProfileChange}
                          placeholder="House no, Street, Landmark"
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={profile.city || ''}
                            onChange={handleProfileChange}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            name="state"
                            value={profile.state || ''}
                            onChange={handleProfileChange}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            value={profile.pincode || ''}
                            onChange={handleProfileChange}
                            placeholder="6-digit code"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleSaveProfile}
                        variant="gold"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="bg-card p-6 rounded-xl shadow-sm">
                    <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Order History
                    </h2>

                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start shopping to see your orders here
                        </p>
                        <Button asChild variant="gold">
                          <Link to="/shop">Browse Collection</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div>
                                <p className="font-medium text-foreground">
                                  Order #{order.razorpayOrderId || (order as any).order_number || order.id?.slice(-8)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.createdAt)} • {(order as any).paymentMethod ? ((order as any).paymentMethod === 'cod' ? 'Cash on Delivery' : (order as any).paymentMethod) : 'Online'}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.orderStatus)}`}>
                                  {order.orderStatus}
                                </span>
                                <span className="font-semibold text-primary">
                                  {formatPrice(order.totalAmount)}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {order.products.slice(0, 4).map((item: any, idx: number) => (
                                <img
                                  key={idx}
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                                />
                              ))}
                              {order.products.length > 4 && (
                                <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground flex-shrink-0">
                                  +{order.products.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="bg-card p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        My Addresses
                      </h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => dispatch(fetchAddresses())}>
                          Refresh
                        </Button>
                        <Button variant="gold" size="sm" onClick={() => {
                          setIsAddingAddress(!isAddingAddress);
                          if (isAddingAddress) {
                            setEditingAddressId(null);
                            setNewAddress({
                              fullName: '',
                              phone: '',
                              email: '',
                              addressLine1: '',
                              addressLine2: '',
                              city: '',
                              state: '',
                              pincode: '',
                              country: 'India',
                              addressType: 'Home',
                            });
                          }
                        }}>
                          {isAddingAddress ? 'Cancel' : (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              Add New
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {isAddingAddress && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-8 p-4 border border-primary/20 bg-primary/5 rounded-xl text-foreground"
                      >
                        <h3 className="font-semibold mb-4">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                        <form onSubmit={handleAddNewAddress} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="fullName">Full Name</Label>
                              <Input
                                id="fullName"
                                name="fullName"
                                value={newAddress.fullName}
                                onChange={handleAddressInputChange}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                name="phone"
                                value={newAddress.phone}
                                onChange={handleAddressInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={newAddress.email}
                              onChange={handleAddressInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="addressLine1">Address Line 1</Label>
                            <Input
                              id="addressLine1"
                              name="addressLine1"
                              value={newAddress.addressLine1}
                              onChange={handleAddressInputChange}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                            <Input
                              id="addressLine2"
                              name="addressLine2"
                              value={newAddress.addressLine2}
                              onChange={handleAddressInputChange}
                            />
                          </div>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                name="city"
                                value={newAddress.city}
                                onChange={handleAddressInputChange}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                name="state"
                                value={newAddress.state}
                                onChange={handleAddressInputChange}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="pincode">Pincode</Label>
                              <Input
                                id="pincode"
                                name="pincode"
                                value={newAddress.pincode}
                                onChange={handleAddressInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <Label htmlFor="addressType">Address Type</Label>
                              <select
                                id="addressType"
                                name="addressType"
                                value={newAddress.addressType}
                                onChange={handleAddressInputChange as any}
                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                              </select>
                            </div>
                          </div>
                          <Button type="submit" variant="gold" className="w-full" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Address'}
                          </Button>
                        </form>
                      </motion.div>
                    )}

                    {addressStatus === 'loading' ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">No addresses saved</h3>
                        <p className="text-muted-foreground mb-4">
                          Add an address to speed up your checkout process
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id || (addr as any)._id}
                            className="border border-border rounded-lg p-4 relative"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-foreground">{addr.fullName}</p>
                                <p className="text-sm text-muted-foreground">{addr.phone}</p>
                              </div>
                              <div className="flex gap-2 text-foreground">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary"
                                  onClick={() => handleEditAddress(addr)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => dispatch(deleteAddress(addr.id || (addr as any)._id))}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-foreground">
                              {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            {addr.email && <p className="text-sm text-muted-foreground mt-1">{addr.email}</p>}
                            <div className="mt-3 flex items-center justify-between">
                              <div>
                                {addr.isDefault ? (
                                  <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded">
                                    Default
                                  </span>
                                ) : (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-xs text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() => handleSetDefault(addr.id || (addr as any)._id)}
                                  >
                                    Set as Default
                                  </Button>
                                )}
                              </div>
                              <span className="text-[10px] font-medium text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                                {addr.addressType}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AccountPage;
