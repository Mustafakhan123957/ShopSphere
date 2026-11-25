import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  const itemCount = cart?.totalItems || 0;

  return (
    <header className="sticky top-0 z-40 border-b border-secondary-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-secondary-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            S
          </span>
          <span>ShopSphere</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-secondary-700 hover:text-primary-600">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium text-secondary-700 hover:text-primary-600">
            Shop
          </Link>
          {user && (
            <Link to="/orders" className="text-sm font-medium text-secondary-700 hover:text-primary-600">
              Orders
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2.5 py-1 text-sm font-medium text-primary-700 hover:bg-primary-100"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-secondary-200 bg-secondary-50 py-1.5 pl-9 pr-3 text-sm text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center rounded-lg p-2 text-secondary-700 hover:bg-secondary-100"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 px-1 text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-secondary-700 hover:bg-secondary-100"
              >
                <UserIcon className="h-4 w-4" />
                <span>{user.firstName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-secondary-600 hover:bg-secondary-100 hover:text-red-600"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-secondary-700 hover:bg-secondary-100"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
              >
                Create account
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-secondary-700 hover:bg-secondary-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-secondary-200 bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-secondary-200 bg-secondary-50 py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </form>
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-secondary-800 hover:bg-secondary-100"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-secondary-800 hover:bg-secondary-100"
            >
              Shop All Products
            </Link>
            {user ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary-800 hover:bg-secondary-100"
                >
                  <Package className="h-4 w-4" /> My Orders
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary-800 hover:bg-secondary-100"
                >
                  <UserIcon className="h-4 w-4" /> Profile ({user.firstName})
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700"
                  >
                    <ShieldCheck className="h-4 w-4" /> Admin Console
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-secondary-300 py-2 text-center text-sm font-medium text-secondary-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-primary-600 py-2 text-center text-sm font-medium text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
