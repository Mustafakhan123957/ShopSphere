import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreditCard, Lock } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order, ApiResponse } from '../types';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(
    user ? `${user.firstName} ${user.lastName}` : '',
  );
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('424');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (defaultAddr) {
      setStreet(defaultAddr.street);
      setCity(defaultAddr.city);
      setState(defaultAddr.state);
      setPostalCode(defaultAddr.postalCode);
      setCountry(defaultAddr.country);
    }
  }, [user]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-secondary-900">Your cart is empty.</p>
      </div>
    );
  }

  const shippingFee = cart.totalPrice >= 100 ? 0 : 9.99;
  const total = cart.totalPrice + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<Order>>('/orders', {
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          postalCode,
          country,
        },
        simulatePaymentSuccess: true,
      });
      await refreshCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.data.id}?confirmed=true`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Checkout failed. Please review your details.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-secondary-900">Checkout</h1>
      <p className="mt-1 text-sm text-secondary-500">
        Complete your shipping details and simulated payment below.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Shipping */}
          <div className="rounded-xl border border-secondary-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-secondary-900">Shipping Address</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-secondary-700">Full Name</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-secondary-700">Street Address</label>
                <input
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-700">City</label>
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-700">State / Province</label>
                <input
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-700">Postal Code</label>
                <input
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-700">Country</label>
                <input
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Simulated Payment */}
          <div className="rounded-xl border border-secondary-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-secondary-900">
                <CreditCard className="h-5 w-5 text-primary-600" /> Payment Details (Simulated)
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-secondary-500">
                <Lock className="h-3.5 w-3.5" /> Test Mode
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-secondary-700">Card Number</label>
                <input
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-secondary-700">Expiry (MM/YY)</label>
                <input
                  required
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-700">CVC</label>
                <input
                  required
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-secondary-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-secondary-900">Order Summary</h2>
          <div className="mt-4 space-y-3 border-b border-secondary-200 pb-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-secondary-600">
                  {item.product.name} &times; {item.quantity}
                </span>
                <span className="font-medium text-secondary-900">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-b border-secondary-200 pb-4 text-sm">
            <div className="flex justify-between text-secondary-600">
              <span>Subtotal</span>
              <span>${cart.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-secondary-600">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-base font-bold text-secondary-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Processing Order...' : `Pay $${total.toFixed(2)} & Place Order`}
          </button>
        </div>
      </form>
    </div>
  );
};
