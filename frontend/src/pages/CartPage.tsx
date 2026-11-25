import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage: React.FC = () => {
  const { user } = useAuth();
  const { cart, isLoading, updateQuantity, removeItem } = useCart();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-secondary-400" />
        <h1 className="mt-4 text-2xl font-bold text-secondary-900">Sign in to view your cart</h1>
        <p className="mt-2 text-sm text-secondary-500">
          Your cart is synced with your ShopSphere account across devices.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-48 animate-pulse rounded-xl bg-secondary-200" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-secondary-400" />
        <h1 className="mt-4 text-2xl font-bold text-secondary-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-secondary-500">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Start Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const shippingFee = cart.totalPrice >= 100 ? 0 : 9.99;
  const orderTotal = cart.totalPrice + shippingFee;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-secondary-900">Shopping Cart</h1>
      <p className="mt-1 text-sm text-secondary-500">{cart.totalItems} item(s) in your bag</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-xl border border-secondary-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="h-24 w-24 shrink-0 rounded-lg object-cover"
              />
              <div className="flex-1">
                <Link
                  to={`/products/${item.product.slug}`}
                  className="font-semibold text-secondary-900 hover:text-primary-600"
                >
                  {item.product.name}
                </Link>
                <p className="mt-1 text-sm text-secondary-500">
                  ${item.product.price.toFixed(2)} each
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center rounded-lg border border-secondary-300">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-sm font-medium hover:bg-secondary-50"
                  >
                    -
                  </button>
                  <span className="min-w-[28px] text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-sm font-medium hover:bg-secondary-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <span className="w-20 text-right font-semibold text-secondary-900">
                  ${item.subtotal.toFixed(2)}
                </span>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg p-1.5 text-secondary-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-secondary-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-secondary-900">Order Summary</h2>
          <div className="mt-4 space-y-2 border-b border-secondary-200 pb-4 text-sm">
            <div className="flex justify-between text-secondary-600">
              <span>Subtotal</span>
              <span>${cart.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-secondary-600">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            {shippingFee > 0 && (
              <p className="text-xs text-primary-600">
                Add ${(100 - cart.totalPrice).toFixed(2)} more for free shipping!
              </p>
            )}
          </div>
          <div className="mt-4 flex justify-between text-base font-bold text-secondary-900">
            <span>Total</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>

          <Link
            to="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
