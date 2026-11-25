import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search } from 'lucide-react';
import api from '../lib/axios';
import { Category, Product, PaginationMeta, ApiResponse } from '../types';
import { ProductCard } from '../components/ProductCard';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    api.get<ApiResponse<Category[]>>('/categories').then((res) => {
      setCategories(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (inStock) params.set('inStock', 'true');
        if (sort) params.set('sort', sort);
        params.set('page', String(page));
        params.set('limit', '12');

        const res = await api.get<ApiResponse<Product[]>>(`/products?${params.toString()}`);
        setProducts(res.data.data);
        setPagination(res.data.pagination || null);
      } catch {
        setError('Unable to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, minPrice, maxPrice, inStock, sort, page]);

  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim() || null);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-secondary-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Product Catalog</h1>
          <p className="mt-1 text-sm text-secondary-500">
            {pagination ? `Showing ${products.length} of ${pagination.total} products` : 'Browse our collection'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="space-y-6 rounded-xl border border-secondary-200 bg-white p-5 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h2>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Reset
            </button>
          </div>

          <form onSubmit={handleSearchSubmit}>
            <label className="block text-xs font-medium text-secondary-700">Search</label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Keywords..."
                className="w-full rounded-lg border border-secondary-300 py-1.5 pl-8 pr-3 text-sm"
              />
            </div>
          </form>

          <div>
            <label className="block text-xs font-medium text-secondary-700">Category</label>
            <div className="mt-2 space-y-1.5">
              <button
                type="button"
                onClick={() => updateFilter('category', null)}
                className={`block w-full rounded-md px-2.5 py-1.5 text-left text-sm ${
                  !category ? 'bg-primary-50 font-semibold text-primary-700' : 'text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`block w-full rounded-md px-2.5 py-1.5 text-left text-sm ${
                    category === cat.slug
                      ? 'bg-primary-50 font-semibold text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-700">Price Range ($)</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value || null)}
                className="w-full rounded-lg border border-secondary-300 px-2.5 py-1.5 text-sm"
              />
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
                className="w-full rounded-lg border border-secondary-300 px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-secondary-700">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
              className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            In stock only
          </label>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl bg-secondary-200" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-secondary-300 bg-white p-12 text-center">
              <p className="text-base font-medium text-secondary-900">No products match your filters</p>
              <p className="mt-1 text-sm text-secondary-500">
                Try clearing some filters or searching for something else.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => updateFilter('page', String(page - 1))}
                    className="rounded-lg border border-secondary-300 bg-white px-3.5 py-1.5 text-sm font-medium text-secondary-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-3 text-sm text-secondary-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => updateFilter('page', String(page + 1))}
                    className="rounded-lg border border-secondary-300 bg-white px-3.5 py-1.5 text-sm font-medium text-secondary-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
