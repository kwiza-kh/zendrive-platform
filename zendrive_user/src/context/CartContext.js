import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "zendrive_cart";
const CartContext = createContext(null);

const readStoredCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredCart = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const priceOf = (car) =>
  car.discount_price && car.discount_price < car.price ? car.discount_price : car.price;

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  const updateItems = useCallback((getNextItems) => {
    setItems((currentItems) => {
      const nextItems = getNextItems(currentItems);
      writeStoredCart(nextItems);
      return nextItems;
    });
  }, []);

  const addToCart = useCallback((car) => {
    if (!car) return;
    updateItems((currentItems) => {
      if (currentItems.some((item) => item.car_id === car.id)) return currentItems;
      return [
        ...currentItems,
        {
          id: car.id,
          car_id: car.id,
          car,
        },
      ];
    });
  }, [updateItems]);

  const removeFromCart = useCallback((itemId) => {
    updateItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  }, [updateItems]);

  const clearCart = useCallback(() => {
    updateItems(() => []);
  }, [updateItems]);

  const inCart = useCallback((carId) => items.some((item) => item.car_id === carId), [items]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + priceOf(item.car), 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, total, loading: false, addToCart, removeFromCart, clearCart, inCart, count: items.length }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
