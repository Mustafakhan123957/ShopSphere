import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import api from '../lib/axios';
import { Category, Product, ApiResponse } from '../types';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get<ApiResponse<Product[]>>('/products?featured=true&limit=8'),
          api.get<ApiResponse<Category[]>>('/categories'),
        ]);
        setFeatured(prodRes.data.data);
        setCategories(catRes.data.data);
      } catch {
        // Handled gracefully with empty state
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-primary-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-200">
              New Season Collection
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Elevated essentials for work, home, and everywhere between.
            </h1>
            <p className="mt-4 text-lg text-secondary-300">
              Discover precision-crafted electronics, minimalist homeware, and durable everyday
              apparel—delivered straight to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products?category=electronics"
                className="inline-flex items-center rounded-lg border border-secondary-600 px-6 py-3 text-sm font-semibold text-secondary-100 transition hover:bg-secondary-800"
              >
                Explore Electronics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-b border-secondary-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary-900">Free Shipping Over $100</p>
              <p className="text-xs text-secondary-500">Fast, tracked delivery nationwide</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary-900">2-Year Quality Guarantee</p>
              <p className="text-xs text-secondary-500">Built to last with verified materials</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary-900">30-Day Easy Returns</p>
              <p className="text-xs text-secondary-500">Hassle-free exchanges and refunds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-secondary-900">Shop by Category</h2>
            <Link to="/products" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              View all &rarr;
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group rounded-xl border border-secondary-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-sm"
              >
                <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-secondary-500">
                  {cat.productCount ?? 0} products
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">Featured Products</h2>
            <p className="mt-1 text-sm text-secondary-500">
              Customer favorites and hand-picked highlights
            </p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Browse catalog &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-secondary-200" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-secondary-300 bg-white p-10 text-center text-secondary-500">
            No featured products available yet.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
