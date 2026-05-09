'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Truck, Heart, Trophy } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-surface to-bg-primary" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-display text-6xl sm:text-7xl text-white mb-4">
              ABOUT <span className="text-accent">URBAN SPORTS</span>
            </h1>
            <p className="text-text-secondary text-xl leading-relaxed max-w-2xl mx-auto">
              Born in the heart of Gurugram, we&apos;re on a mission to make premium cricket gear 
              accessible to every aspiring cricketer in India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl text-white mb-6">OUR STORY</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Urban Sports was founded in 2024 by a group of cricket enthusiasts who noticed a gap in the market — 
                while there were many cricket stores, very few offered a truly premium, trustworthy online shopping 
                experience backed by genuine products and excellent customer service.
              </p>
              <p>
                We started with a simple belief: every cricketer, from gully cricket players to professional athletes, 
                deserves access to authentic, high-quality equipment at fair prices. We partnered directly with 
                top brands like SG, Kookaburra, GM, SS, Shrey, and Puma to bring you the real deal — no fakes, 
                no compromises.
              </p>
              <p>
                Today, Urban Sports has grown into a trusted name with over 500+ products, 10,000+ happy customers, 
                and a 4.8-star rating. But our mission remains the same — to fuel your passion for cricket with 
                the best gear, delivered with love and precision.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl text-white text-center mb-12">WHAT WE STAND FOR</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield size={32} />, title: 'Authenticity', desc: 'Every product we sell is 100% genuine, sourced directly from authorized brand dealers.' },
              { icon: <Truck size={32} />, title: 'Fast Delivery', desc: 'We dispatch within 24 hours. Free delivery on orders above ₹999 across India.' },
              { icon: <Heart size={32} />, title: 'Customer First', desc: 'From WhatsApp support to easy returns, we put your experience above everything.' },
              { icon: <Trophy size={32} />, title: 'Quality', desc: 'We hand-pick every product in our catalog to ensure only the best reaches you.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-bg-surface rounded-2xl border border-border p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl text-white mb-2 tracking-wide">{item.title.toUpperCase()}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-5xl text-white mb-4">
            READY TO <span className="text-accent">PLAY BOLD?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Explore our full collection and find the perfect gear for your game.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-accent text-bg-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            Shop Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
