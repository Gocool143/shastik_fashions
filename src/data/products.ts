export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'silk' | 'cotton' | 'designer' | 'bridal';
  fabric: string;
  colors: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  description: string;
  details: string[];
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Kanchipuram Pure Silk Saree',
    price: 15999,
    originalPrice: 19999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    category: 'silk',
    fabric: 'Pure Silk',
    colors: ['Maroon', 'Gold'],
    isNew: true,
    description: 'Exquisite Kanchipuram silk saree with traditional temple border and rich zari work.',
    details: ['Handwoven', 'Pure Mulberry Silk', '6.3 meters with blouse piece', 'Dry clean only']
  },
  {
    id: '2',
    name: 'Banarasi Tissue Silk Saree',
    price: 22999,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
    category: 'silk',
    fabric: 'Tissue Silk',
    colors: ['Royal Blue', 'Gold'],
    isBestSeller: true,
    description: 'Luxurious Banarasi tissue silk with intricate brocade patterns and golden zari.',
    details: ['Traditional weave', 'Tissue Silk', '6.3 meters with blouse piece', 'Dry clean only']
  },
  {
    id: '3',
    name: 'Soft Cotton Handloom Saree',
    price: 3499,
    originalPrice: 4499,
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80',
    category: 'cotton',
    fabric: 'Handloom Cotton',
    colors: ['White', 'Red'],
    description: 'Comfortable handloom cotton saree perfect for daily wear with elegant border.',
    details: ['Handloom', 'Pure Cotton', '6.3 meters with blouse piece', 'Machine washable']
  },
  {
    id: '4',
    name: 'Designer Georgette Saree',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80',
    category: 'designer',
    fabric: 'Georgette',
    colors: ['Pink', 'Silver'],
    isNew: true,
    description: 'Contemporary designer georgette saree with sequin work and modern patterns.',
    details: ['Designer piece', 'Pure Georgette', '5.5 meters with blouse piece', 'Dry clean only']
  },
  {
    id: '5',
    name: 'Bridal Red Silk Saree',
    price: 45999,
    image: 'https://images.unsplash.com/photo-1604502369947-e1e25e56eb66?w=600&q=80',
    category: 'bridal',
    fabric: 'Heavy Silk',
    colors: ['Red', 'Gold'],
    isBestSeller: true,
    description: 'Stunning bridal red silk saree with heavy zari work and intricate embroidery.',
    details: ['Bridal wear', 'Heavy Silk with Zari', '6.3 meters with blouse piece', 'Professional dry clean']
  },
  {
    id: '6',
    name: 'Mysore Crepe Silk Saree',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80',
    category: 'silk',
    fabric: 'Crepe Silk',
    colors: ['Green', 'Gold'],
    description: 'Elegant Mysore crepe silk saree with subtle patterns and smooth drape.',
    details: ['Mysore weave', 'Crepe Silk', '6.3 meters with blouse piece', 'Dry clean only']
  },
  {
    id: '7',
    name: 'Chettinad Cotton Saree',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    category: 'cotton',
    fabric: 'Chettinad Cotton',
    colors: ['Blue', 'White'],
    description: 'Traditional Chettinad cotton with distinctive checks and comfortable wear.',
    details: ['Traditional weave', 'Pure Cotton', '6.3 meters with blouse piece', 'Machine washable']
  },
  {
    id: '8',
    name: 'Heavy Embroidered Designer Saree',
    price: 18999,
    originalPrice: 24999,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80',
    category: 'designer',
    fabric: 'Net with Embroidery',
    colors: ['Black', 'Gold'],
    isBestSeller: true,
    description: 'Glamorous designer saree with heavy embroidery work perfect for parties.',
    details: ['Designer piece', 'Net fabric with embroidery', '5.5 meters with blouse piece', 'Dry clean only']
  },
];

export const categories = [
  { id: 'silk', name: 'Silk Sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80', count: 156 },
  { id: 'cotton', name: 'Cotton Sarees', image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&q=80', count: 89 },
  { id: 'designer', name: 'Designer Sarees', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80', count: 67 },
  { id: 'bridal', name: 'Bridal Sarees', image: 'https://images.unsplash.com/photo-1604502369947-e1e25e56eb66?w=400&q=80', count: 45 },
];

export const fabrics = ['Pure Silk', 'Cotton', 'Georgette', 'Chiffon', 'Net', 'Crepe'];
export const colorOptions = ['Red', 'Maroon', 'Gold', 'Blue', 'Green', 'Pink', 'White', 'Black'];
export const priceRanges = [
  { label: 'Under ₹5,000', min: 0, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
  { label: 'Above ₹20,000', min: 20000, max: Infinity },
];
