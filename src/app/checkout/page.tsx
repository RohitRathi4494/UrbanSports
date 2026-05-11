'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, CreditCard, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'whatsapp_cod'>('razorpay');

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="min-h-screen" />;

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal >= 999 ? 0 : 79;
  const discount = parseInt(searchParams.get('discount') || '0');
  const promoCode = searchParams.get('promo') || '';
  const total = subtotal + deliveryCharge - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-text-primary mb-4">CART IS EMPTY</h1>
          <Link href="/products" className="text-accent hover:underline">Browse products</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!name || !phone || !address || !city || !state || !pincode) {
      toast.error('Please fill in all required fields');
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: { address, city, state, pincode },
        items: items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          mrp: item.product.mrp,
          quantity: item.quantity,
          image: item.product.images?.[0] || '',
        })),
        subtotal,
        discount,
        promo_code: promoCode,
        payment_method: paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        if (paymentMethod === 'whatsapp_cod') {
          // WhatsApp order flow
          const waPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
          const itemsList = items.map(i => `• ${i.product.name} x${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`).join('\n');
          const waMessage = `🏏 *New Order from Urban Sports*\n\n*Order ID:* ${data.order_number}\n*Customer:* ${name}\n*Phone:* ${phone}\n\n*Items:*\n${itemsList}\n\n*Total:* ${formatPrice(data.total)}\n\n*Delivery Address:*\n${address}, ${city}, ${state} - ${pincode}\n\n*Payment:* Cash on Delivery`;
          window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`, '_blank');
        }

        // Mock payment success for Razorpay
        if (paymentMethod === 'razorpay') {
          await fetch(`/api/orders/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_status: 'paid', razorpay_payment_id: 'mock_' + Date.now() }),
          });
        }

        clearCart();
        router.push(`/order/${data.id}`);
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl text-text-primary mb-8">CHECKOUT</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => s < step && setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s <= step ? 'bg-accent text-bg-primary' : 'bg-bg-surface border border-border text-text-secondary'
                }`}
              >
                {s < step ? <CheckCircle size={16} /> : s}
              </button>
              <span className={`text-sm hidden sm:inline ${s <= step ? 'text-text-primary' : 'text-text-secondary'}`}>
                {s === 1 ? 'Customer Info' : s === 2 ? 'Review Order' : 'Payment'}
              </span>
              {s < 3 && <ChevronRight size={14} className="text-text-secondary mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            {/* Step 1: Customer Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4"
              >
                <h2 className="font-display text-xl text-text-primary tracking-wider">SHIPPING DETAILS</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">Full Name *</label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50"
                      placeholder="John Doe" required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">Phone Number *</label>
                    <input
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50"
                      placeholder="+91 99999 99999" required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-1 block">Address *</label>
                  <textarea
                    value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50 resize-none h-20"
                    placeholder="House/Flat number, Street, Landmark" required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">Pincode *</label>
                    <input
                      type="text" value={pincode} onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50"
                      placeholder="122001" required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">City *</label>
                    <input
                      type="text" value={city} onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50"
                      placeholder="Gurugram" required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary mb-1 block">State *</label>
                    <input
                      type="text" value={state} onChange={(e) => setState(e.target.value)}
                      className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent/50"
                      placeholder="Haryana" required
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!name || !phone || !address || !city || !state || !pincode) {
                      toast.error('Please fill all required fields');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full bg-accent text-bg-primary py-3.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors"
                >
                  Continue to Review
                </button>
              </motion.div>
            )}

            {/* Step 2: Order Review */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4"
              >
                <h2 className="font-display text-xl text-text-primary tracking-wider">ORDER REVIEW</h2>
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="w-14 h-14 bg-bg-surface-light rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-white/20 text-xs">IMG</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-text-secondary text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-accent font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-sm text-text-secondary"><strong className="text-text-primary">Shipping to:</strong> {name}, {address}, {city}, {state} - {pincode}</p>
                  <p className="text-sm text-text-secondary mt-1"><strong className="text-text-primary">Phone:</strong> {phone}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border border-border text-text-primary py-3 rounded-xl font-medium hover:bg-white/5 transition-colors">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-accent text-bg-primary py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors">
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-bg-surface rounded-2xl border border-border p-6 space-y-4"
              >
                <h2 className="font-display text-xl text-text-primary tracking-wider">PAYMENT METHOD</h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'razorpay' ? 'border-accent bg-accent/5' : 'border-border hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio" name="payment" value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'razorpay' ? 'border-accent' : 'border-border'} flex items-center justify-center`}>
                      {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 bg-accent rounded-full" />}
                    </div>
                    <CreditCard size={20} className="text-accent" />
                    <div>
                      <p className="text-text-primary font-medium">Pay Online</p>
                      <p className="text-text-secondary text-xs">UPI, Cards, Net Banking, Wallets (Razorpay)</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'whatsapp_cod' ? 'border-accent bg-accent/5' : 'border-border hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio" name="payment" value="whatsapp_cod"
                      checked={paymentMethod === 'whatsapp_cod'}
                      onChange={() => setPaymentMethod('whatsapp_cod')}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'whatsapp_cod' ? 'border-accent' : 'border-border'} flex items-center justify-center`}>
                      {paymentMethod === 'whatsapp_cod' && <div className="w-2.5 h-2.5 bg-accent rounded-full" />}
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <div>
                      <p className="text-text-primary font-medium">Pay via WhatsApp</p>
                      <p className="text-text-secondary text-xs">COD / Manual payment via WhatsApp</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)} className="flex-1 border border-border text-text-primary py-3 rounded-xl font-medium hover:bg-white/5 transition-colors">
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-accent text-bg-primary py-3.5 rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Placing Order...' : `Pay ${formatPrice(total)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-bg-surface rounded-2xl border border-border p-6 space-y-3">
              <h3 className="font-display text-lg text-text-primary tracking-wider">SUMMARY</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal ({items.length} items)</span>
                  <span className="text-text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-success' : 'text-text-primary'}>
                    {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Discount ({promoCode})</span>
                    <span className="text-success">-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-text-primary">Total</span>
                <span className="font-display text-2xl text-accent">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="skeleton w-20 h-20 rounded-full" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
