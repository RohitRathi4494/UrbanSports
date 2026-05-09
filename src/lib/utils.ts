export function formatPrice(price: number): string {
  return '₹' + price.toLocaleString('en-IN');
}

export function calculateDiscount(mrp: number, price: number): number {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `US-${year}-${rand}`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  brand: string;
  sku: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  price: number;
  mrp: number;
  images: string[];
  variants?: string[];
  stock: number;
  low_stock_threshold: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  is_featured: boolean;
  is_new_arrival: boolean;
  tags: string[];
  meta_title: string;
  meta_description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_slug?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  promo_code: string;
  payment_method: 'razorpay' | 'whatsapp_cod';
  payment_status: 'pending' | 'paid' | 'failed';
  razorpay_order_id: string;
  razorpay_payment_id: string;
  fulfillment_status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  city: string;
  rating: number;
  review: string;
  photo_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Banner {
  id: string;
  headline: string;
  subtext: string;
  cta_label: string;
  cta_link: string;
  bg_image_url?: string;
  bg_color: string;
  is_active: boolean;
  display_order: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_value: number;
  expiry_date: string;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
}

export interface Settings {
  store_name: string;
  whatsapp_number: string;
  store_email: string;
  delivery_free_above: string;
  delivery_charge: string;
  gst_number: string;
  instagram_url: string;
  youtube_url: string;
  facebook_url: string;
  footer_text: string;
  [key: string]: string;
}
