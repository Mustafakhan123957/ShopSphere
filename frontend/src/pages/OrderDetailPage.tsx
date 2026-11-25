import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../lib/axios';
import { Order, ApiResponse, OrderStatus } from '../types';

const STEPS: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isConfirmed = searchParams.get('confirmed') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get<ApiResponse<Order>>(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-xl bg-secondary-200" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-secondary-900">Order not found.</p>
        <Link to="/orders" className="mt-4 inline-block text-sm text-primary-600">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {isConfirmed && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">Thank you! Your order is confirmed.</p>
            <p className="text-xs">
              Order {order.orderNumber} has been received and payment is marked as {order.paymentStatus}.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-secondary-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-secondary-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{order.orderNumber}</h1>
            <p className="text-xs text-secondary-500">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-secondary-500">Total</span>
            <p className="text-xl font-bold text-secondary-900">${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Status Tracker */}
        {order.status !== 'CANCELLED' ? (
          <div className="my-6">
            <div className="grid grid-cols-4 gap-2">
              {STEPS.map((step, idx) => {
                const active = idx <= currentStepIndex;
                return (
                  <div key={step} className="text-center">
                    <div
                      className={`h-2 rounded-full ${
                        active ? 'bg-primary-600' : 'bg-secondary-200'
                      }`}
                    />
                    <span
                      className={`mt-2 block text-xs font-semibold ${
                        active ? 'text-primary-700' : 'text-secondary-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="my-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
            This order was cancelled.
          </div>
        )}

        {/* Items */}
        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-secondary-500">
          Items
        </h2>
        <div className="mt-3 divide-y divide-secondary-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-secondary-900">{item.product.name}</p>
                  <p className="text-xs text-secondary-500">
                    Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-secondary-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Shipping Address */}
        <div className="mt-6 rounded-lg bg-secondary-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary-500">
            Shipping Address
          </h3>
          <p className="mt-1 text-sm text-secondary-800">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>
      </div>
    </div>
  );
};
