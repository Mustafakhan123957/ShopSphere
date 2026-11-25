import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../lib/axios';
import { Product, ApiResponse } from '../types';
import { useCart } from '../context/CartContext';

export const ProductDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiResponse<Product>>(`/products/${idOrSlug}`);
        setProduct(res.data.data);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    if (idOrSlug) fetchProduct();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-secondary-200" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-secondary-200" />
            <div className="h-6 w-1/4 animate-pulse rounded bg-secondary-200" />
            <div className="h-24 w-full animate-pulse rounded bg-secondary-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-secondary-900">{error || 'Product not found'}</p>
        <Link to="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Catalog
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-secondary-200 bg-white">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          {product.category && (
            <Link
              to={`/products?category=${product.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-primary-600 hover:underline"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold text-secondary-900">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-secondary-900">
            ${product.price.toFixed(2)}
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-medium text-red-600">
                <AlertCircle className="h-4 w-4" /> Currently Out of Stock
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-secondary-600">{product.description}</p>

          {product.stock > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-lg border border-secondary-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-lg font-medium text-secondary-700 hover:bg-secondary-50"
                >
                  -
                </button>
                <span className="min-w-[40px] text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-2 text-lg font-medium text-secondary-700 hover:bg-secondary-50"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => addToCart(product.id, quantity)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
