import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import api from '../lib/axios';
import {
  AdminStats,
  AdminCustomer,
  Category,
  Order,
  OrderStatus,
  Product,
  ApiResponse,
} from '../types';

type Tab = 'overview' | 'products' | 'categories' | 'orders' | 'customers';

export const AdminDashboardPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  // Product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodCatId, setProdCatId] = useState('');
  const [prodFeatured, setProdFeatured] = useState(false);

  // Category form state
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, catRes, ordRes, custRes] = await Promise.all([
        api.get<ApiResponse<AdminStats>>('/admin/stats'),
        api.get<ApiResponse<Product[]>>('/products?limit=50'),
        api.get<ApiResponse<Category[]>>('/categories'),
        api.get<ApiResponse<Order[]>>('/admin/orders?limit=50'),
        api.get<ApiResponse<AdminCustomer[]>>('/admin/customers?limit=50'),
      ]);
      setStats(statsRes.data.data);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
      setOrders(ordRes.data.data);
      setCustomers(custRes.data.data);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdStock('10');
    setProdImage(
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    );
    setProdCatId(categories[0]?.id || '');
    setProdFeatured(false);
    setShowProductForm(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDesc(p.description);
    setProdPrice(String(p.price));
    setProdStock(String(p.stock));
    setProdImage(p.imageUrl);
    setProdCatId(p.categoryId);
    setProdFeatured(p.isFeatured);
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      stock: Number(prodStock),
      imageUrl: prodImage,
      categoryId: prodCatId,
      isFeatured: prodFeatured,
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setShowProductForm(false);
      loadAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not save product';
      toast.error(msg);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not delete product';
      toast.error(msg);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name: catName, description: catDesc });
      setCatName('');
      setCatDesc('');
      toast.success('Category added');
      loadAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not create category';
      toast.error(msg);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      loadAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not delete category';
      toast.error(msg);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      loadAll();
    } catch {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-secondary-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Store Administration</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Manage products, categories, customer orders, and sales metrics.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewProductModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-secondary-200 pb-3">
        {(['overview', 'products', 'categories', 'orders', 'customers'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-primary-600 text-white'
                : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-secondary-200" />
      ) : (
        <div className="mt-8">
          {/* OVERVIEW */}
          {tab === 'overview' && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-secondary-200 bg-white p-5">
                  <div className="flex items-center justify-between text-secondary-500">
                    <span className="text-xs font-semibold uppercase">Total Revenue</span>
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-secondary-900">
                    ${stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl border border-secondary-200 bg-white p-5">
                  <div className="flex items-center justify-between text-secondary-500">
                    <span className="text-xs font-semibold uppercase">Total Orders</span>
                    <ShoppingBag className="h-5 w-5 text-primary-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-secondary-900">{stats.totalOrders}</p>
                </div>
                <div className="rounded-xl border border-secondary-200 bg-white p-5">
                  <div className="flex items-center justify-between text-secondary-500">
                    <span className="text-xs font-semibold uppercase">Products</span>
                    <Package className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-secondary-900">{stats.totalProducts}</p>
                  <p className="mt-1 text-xs text-secondary-500">
                    {stats.lowStockProducts} low stock (&le;10)
                  </p>
                </div>
                <div className="rounded-xl border border-secondary-200 bg-white p-5">
                  <div className="flex items-center justify-between text-secondary-500">
                    <span className="text-xs font-semibold uppercase">Customers</span>
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-secondary-900">
                    {stats.totalCustomers}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-secondary-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-secondary-900">Recent Orders</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-secondary-200 text-xs uppercase text-secondary-500">
                        <th className="py-2">Order #</th>
                        <th className="py-2">Customer</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100">
                      {stats.recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="py-2.5 font-medium text-secondary-900">{o.orderNumber}</td>
                          <td className="py-2.5 text-secondary-600">
                            {o.user ? `${o.user.firstName} ${o.user.lastName}` : o.userId}
                          </td>
                          <td className="py-2.5">{o.status}</td>
                          <td className="py-2.5 text-right font-semibold">
                            ${o.totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {tab === 'products' && (
            <div className="overflow-x-auto rounded-xl border border-secondary-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-secondary-200 bg-secondary-50 text-xs uppercase text-secondary-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <span className="font-medium text-secondary-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-secondary-600">{p.category?.name}</td>
                      <td className="px-4 py-3 font-medium">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProductModal(p)}
                            className="rounded p-1.5 text-secondary-500 hover:bg-secondary-100 hover:text-primary-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="rounded p-1.5 text-secondary-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CATEGORIES */}
          {tab === 'categories' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <form
                onSubmit={handleAddCategory}
                className="h-fit rounded-xl border border-secondary-200 bg-white p-5"
              >
                <h2 className="text-base font-semibold text-secondary-900">New Category</h2>
                <div className="mt-4 space-y-3">
                  <input
                    required
                    placeholder="Category name"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    Create Category
                  </button>
                </div>
              </form>

              <div className="space-y-3 md:col-span-2">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-secondary-200 bg-white p-4"
                  >
                    <div>
                      <p className="font-semibold text-secondary-900">{c.name}</p>
                      <p className="text-xs text-secondary-500">
                        {c.productCount ?? 0} product(s) &bull; /{c.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c.id)}
                      className="rounded p-1.5 text-secondary-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="overflow-x-auto rounded-xl border border-secondary-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-secondary-200 bg-secondary-50 text-xs uppercase text-secondary-500">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-medium text-secondary-900">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-secondary-600">
                        {o.user ? `${o.user.firstName} ${o.user.lastName}` : o.userId}
                      </td>
                      <td className="px-4 py-3 text-secondary-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold">${o.totalAmount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleOrderStatusChange(o.id, e.target.value as OrderStatus)
                          }
                          className="rounded-lg border border-secondary-300 px-2.5 py-1 text-xs font-medium"
                        >
                          {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(
                            (st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ),
                          )}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CUSTOMERS */}
          {tab === 'customers' && (
            <div className="overflow-x-auto rounded-xl border border-secondary-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-secondary-200 bg-secondary-50 text-xs uppercase text-secondary-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Orders</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-medium text-secondary-900">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="px-4 py-3 text-secondary-600">{c.email}</td>
                      <td className="px-4 py-3">{c.orderCount}</td>
                      <td className="px-4 py-3 text-secondary-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-secondary-900">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3">
              <input
                required
                placeholder="Product name"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
              <textarea
                required
                placeholder="Description"
                rows={3}
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Price"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  className="rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  className="rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
              <select
                required
                value={prodCatId}
                onChange={(e) => setProdCatId(e.target.value)}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                required
                type="url"
                placeholder="Image URL"
                value={prodImage}
                onChange={(e) => setProdImage(e.target.value)}
                className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-secondary-700">
                <input
                  type="checkbox"
                  checked={prodFeatured}
                  onChange={(e) => setProdFeatured(e.target.checked)}
                />
                Feature on homepage
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="rounded-lg border border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
