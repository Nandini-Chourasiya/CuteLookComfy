import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await cartAPI.get();
      setCart(data.data);
    } catch {}
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, variantId, quantity = 1) => {
    try {
      const { data } = await cartAPI.addItem({ productId, variantId, quantity });
      setCart(data.data);
      setDrawerOpen(true);
      toast.success('Added to bag');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add item');
    }
  };

  const updateItem = async (productId, qty) => {
    try {
      const { data } = await cartAPI.updateItem(productId, qty);
      setCart(data.data);
    } catch {}
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await cartAPI.removeItem(productId);
      setCart(data.data);
    } catch {}
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart(null);
    } catch {}
  };

  const applyCoupon = async (code) => {
    const { data } = await cartAPI.applyCoupon(code);
    setCart(data.data);
  };

  const removeCoupon = async () => {
    const { data } = await cartAPI.removeCoupon();
    setCart(data.data);
  };

  const itemCount = cart?.items?.length || 0;

  return (
    <CartContext.Provider value={{
      cart, fetchCart, addItem, updateItem, removeItem, clearCart,
      applyCoupon, removeCoupon, itemCount,
      drawerOpen, setDrawerOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
