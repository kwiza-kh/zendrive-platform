import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cartApi } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); setTotal(0); return; }
    setLoading(true);
    try {
      const { data } = await cartApi.list();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      setItems([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (carId) => {
    await cartApi.add(carId);
    await fetchCart();
  };

  const removeFromCart = async (itemId) => {
    await cartApi.remove(itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartApi.clear();
    await fetchCart();
  };

  const inCart = (carId) => items.some((i) => i.car_id === carId);

  return (
    <CartContext.Provider value={{ items, total, loading, addToCart, removeFromCart, clearCart, inCart, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
