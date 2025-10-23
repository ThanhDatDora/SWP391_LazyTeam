// Cart utility functions for managing localStorage cart data

export const CartUtils = {
  // Get cart items from localStorage
  getCart: () => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  },

  // Save cart items to localStorage
  saveCart: (cartItems) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      // Trigger storage event for other components to update
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(cartItems)
      }));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  // Add item to cart
  addToCart: (course) => {
    const cart = CartUtils.getCart();
    const existingItem = cart.find(item => item.id === course.id);
    
    if (!existingItem) {
      const newCart = [...cart, course];
      CartUtils.saveCart(newCart);
      return newCart;
    }
    return cart;
  },

  // Remove item from cart
  removeFromCart: (courseId) => {
    const cart = CartUtils.getCart();
    const newCart = cart.filter(item => item.id !== courseId);
    CartUtils.saveCart(newCart);
    return newCart;
  },

  // Get cart count
  getCartCount: () => {
    return CartUtils.getCart().length;
  },

  // Clear entire cart
  clearCart: () => {
    CartUtils.saveCart([]);
    return [];
  },

  // Calculate total price
  getCartTotal: () => {
    const cart = CartUtils.getCart();
    return cart.reduce((total, item) => total + (item.price || 0), 0);
  }
};