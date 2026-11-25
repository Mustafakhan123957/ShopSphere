import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { Cart, ApiResponse } from '../types';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<Cart>>('/cart');
      setCart(res.data.data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to your cart.');
      return;
    }
    const res = await api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });
    setCart(res.data.data);
    toast.success('Added to cart');
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const res = await api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    setCart(res.data.data);
  };

  const removeItem = async (itemId: string) => {
    const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    setCart(res.data.data);
    toast.success('Item removed from cart');
  };

  const clearCart = async () => {
    const res = await api.delete<ApiResponse<Cart>>('/cart');
    setCart(res.data.data);
  };

  return (
    <CartContext.Provider
      value={{ cart, isLoading, refreshCart, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};
