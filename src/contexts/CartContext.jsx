import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (course) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === course.id);
      
      if (existingItem) {
        toast.info('Khóa học đã có trong giỏ hàng');
        return prevItems;
      }
      
      toast.success('Đã thêm vào giỏ hàng');
      return [...prevItems, {
        id: course.id,
        title: course.title,
        price: course.price,
        instructor: course.instructorName,
        thumbnail: course.thumbnail,
        level: course.level,
        duration: course.duration
      }];
    });
  };

  const removeFromCart = (courseId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== courseId));
    toast.success('Đã xóa khỏi giỏ hàng');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    toast.success('Đã xóa toàn bộ giỏ hàng');
  };

  const isInCart = (courseId) => {
    return cartItems.some(item => item.id === courseId);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  const getItemCount = () => {
    return cartItems.length;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        getTotalPrice,
        getItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
