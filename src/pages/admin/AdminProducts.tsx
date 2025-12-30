import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, X, ImagePlus } from 'lucide-react';
import * as adminService from '@/services/adminService';
import * as categoryService from '@/services/categoryService';

const AVAILABLE_COLORS = [
  'Red', 'Blue', 'Green', 'Black', 'White', 'Navy', 'Gray', 'Brown',
  'Pink', 'Purple', 'Orange', 'Yellow', 'Beige', 'Cream', 'Maroon', 'Teal'
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40'];

const initialFormData = {
  _id: '',
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  images: [] as string[],
  fabric: '',
  color: '',
  stock: '',
  isBestSeller: false,
  isNewArrival: false,
  colors: [] as string[],
  sizes: [] as string[],
  color_images: {} as Record<string, string>,
};

export const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<adminService.AdminProduct | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [newImageUrl, setNewImageUrl] = useState('');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminService.fetchAdminProducts(1, 100),
  });

  const products = productsData?.products || [];

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createAdminProduct({
      ...data,
      price: parseFloat(data.price),
      originalPrice: parseFloat(data.originalPrice) || 0,
      stock: parseInt(data.stock) || 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created successfully');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminService.updateAdminProduct({
      ...data,
      price: parseFloat(data.price),
      originalPrice: parseFloat(data.originalPrice) || 0,
      stock: parseInt(data.stock) || 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated successfully');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  const handleEdit = (product: adminService.AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      _id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: typeof product.category === 'object' ? product.category._id : product.category,
      images: product.images || [],
      fabric: product.fabric || '',
      color: product.color || '',
      stock: product.stock.toString(),
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      colors: product.colors || [],
      sizes: product.sizes || [],
      color_images: product.color_images || {},
    });
    setIsDialogOpen(true);
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const toggleColor = (color: string) => {
    if (formData.colors.includes(color)) {
      const newColorImages = { ...formData.color_images };
      delete newColorImages[color];
      setFormData({
        ...formData,
        colors: formData.colors.filter(c => c !== color),
        color_images: newColorImages
      });
    } else {
      setFormData({ ...formData, colors: [...formData.colors, color] });
    }
  };

  const handleColorImageChange = (color: string, imageUrl: string) => {
    setFormData({
      ...formData,
      color_images: {
        ...formData.color_images,
        [color]: imageUrl
      }
    });
  };

  const toggleSize = (size: string) => {
    if (formData.sizes.includes(size)) {
      setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) });
    } else {
      setFormData({ ...formData, sizes: [...formData.sizes, size] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product catalog</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData(initialFormData)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fabric">Fabric</Label>
                    <Input
                      id="fabric"
                      value={formData.fabric}
                      onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Product Images (General Assets)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Enter image URL and click Add"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddImage}>
                      <ImagePlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-full aspect-square object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced Colors Section */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <Label className="text-base font-semibold">Available Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map((color) => (
                      <Badge
                        key={color}
                        variant={formData.colors.includes(color) ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1"
                        onClick={() => toggleColor(color)}
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>

                  {/* Color-specific image URLs */}
                  {formData.colors.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <Label className="text-sm text-muted-foreground">Assign Image URL to Each Color</Label>
                      {formData.colors.map((color) => (
                        <div key={color} className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg">
                          <div
                            className="w-8 h-8 rounded-full border shadow-sm flex-shrink-0"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                          <span className="text-sm font-medium w-20">{color}</span>
                          <Input
                            value={formData.color_images[color] || ''}
                            onChange={(e) => handleColorImageChange(color, e.target.value)}
                            placeholder={`Image URL for ${color}`}
                            className="flex-1 bg-background"
                          />
                          {formData.color_images[color] && (
                            <img
                              src={formData.color_images[color]}
                              alt={color}
                              className="w-10 h-10 object-cover rounded border"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced Sizes Section */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <Label className="text-base font-semibold">Available Sizes</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map((size) => (
                      <Badge
                        key={size}
                        variant={formData.sizes.includes(size) ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1"
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isBestSeller"
                      checked={formData.isBestSeller}
                      onCheckedChange={(checked) => setFormData({ ...formData, isBestSeller: checked })}
                    />
                    <Label htmlFor="isBestSeller">Bestseller</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isNewArrival"
                      checked={formData.isNewArrival}
                      onCheckedChange={(checked) => setFormData({ ...formData, isNewArrival: checked })}
                    />
                    <Label htmlFor="isNewArrival">New Arrival</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingProduct ? 'Update' : 'Create'} Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Package className="h-5 w-5" />
              All Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Attributes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        ₹{product.price.toLocaleString()}
                        {product.originalPrice && (
                          <span className="text-muted-foreground line-through ml-2">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {product.colors && product.colors.length > 0 && (
                            <div className="flex gap-1">
                              {product.colors.slice(0, 3).map(c => <div key={c} className="w-3 h-3 rounded-full border" title={c} style={{ backgroundColor: c.toLowerCase() }} />)}
                              {product.colors.length > 3 && <span className="text-[10px]">+{product.colors.length - 3}</span>}
                            </div>
                          )}
                          <div className="flex gap-1 flex-wrap">
                            {product.isBestSeller && (
                              <span className="text-[10px] px-1 rounded-full bg-primary/20 text-primary">
                                Bestseller
                              </span>
                            )}
                            {product.isNewArrival && (
                              <span className="text-[10px] px-1 rounded-full bg-accent/20 text-accent-foreground">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                deleteMutation.mutate(product._id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">No products found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
