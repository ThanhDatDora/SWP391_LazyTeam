import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Initialize from localStorage
    try {
      const savedCart = localStorage.getItem('cart');
      console.log('🔄 Initializing CartContext from localStorage:', savedCart);
      
      // Parse and validate cart items
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Filter out invalid items (missing id field)
        const validItems = parsed.filter(item => item && item.id);
        console.log('✅ Valid cart items:', validItems);
        return validItems;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('💾 Saving cart to localStorage:', cartItems);
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (course) => {
    console.log('🛒 === CartContext.addToCart CALLED ===');
    console.log('📦 Received course:', course);
    console.log('📦 Current cartItems:', cartItems);
    
    setCartItems(prevItems => {
      console.log('📦 prevItems:', prevItems);
      const existingItem = prevItems.find(item => {
        console.log(`🔍 Comparing item.id (${item.id}, ${typeof item.id}) === course.id (${course.id}, ${typeof course.id})`);
        return item.id === course.id;
      });
      
      console.log('🔍 existingItem:', existingItem);
      
      if (existingItem) {
        console.log('⚠️ Item already in cart');
        return prevItems;
      }
      
      const newItem = {
        id: course.id,
        title: course.title,
        price: course.price,
        instructor: course.instructorName,
        thumbnail: course.thumbnail,
        level: course.level,
        duration: course.duration
      };
      
      console.log('✅ Adding new item:', newItem);
      const newCart = [...prevItems, newItem];
      console.log('✅ New cart:', newCart);
      return newCart;
    });
  };

  const removeFromCart = (courseId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== courseId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
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
