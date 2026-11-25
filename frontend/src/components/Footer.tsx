import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-secondary-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-secondary-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm text-white">
                S
              </span>
              ShopSphere
            </Link>
            <p className="mt-3 max-w-sm text-sm text-secondary-500">
              Thoughtfully curated everyday essentials—from precision audio and workspace gear to
              timeless home and apparel staples.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary-900">
              Shop
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-secondary-600">
              <li>
                <Link to="/products" className="hover:text-primary-600">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics" className="hover:text-primary-600">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-living" className="hover:text-primary-600">
                  Home &amp; Living
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion-apparel" className="hover:text-primary-600">
                  Fashion &amp; Apparel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary-900">
              Account
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-secondary-600">
              <li>
                <Link to="/cart" className="hover:text-primary-600">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary-600">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary-600">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-secondary-100 pt-6 text-center text-xs text-secondary-400">
          &copy; {new Date().getFullYear()} ShopSphere Commerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
