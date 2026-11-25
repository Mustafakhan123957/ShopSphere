import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import api from '../lib/axios';
import { Order, ApiResponse, OrderStatus } from '../types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<Order[]>>('/orders')
      .then((res) => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-secondary-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-secondary-900">Order History</h1>
      <p className="mt-1 text-sm text-secondary-500">Track and review your past purchases</p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-secondary-300 bg-white p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-secondary-400" />
          <p className="mt-3 text-base font-medium text-secondary-900">No orders yet</p>
          <p className="mt-1 text-sm text-secondary-500">
            When you place an order, it will appear here.
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex flex-col justify-between gap-4 rounded-xl border border-secondary-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-sm sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-secondary-900">{order.orderNumber}</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      STATUS_STYLES[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-secondary-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} &bull;{' '}
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-lg font-bold text-secondary-900">
                  ${order.totalAmount.toFixed(2)}
                </span>
                <ChevronRight className="h-5 w-5 text-secondary-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
