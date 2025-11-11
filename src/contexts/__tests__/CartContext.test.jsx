/**
 * Unit Tests for CartContext
 * 
 * Test Coverage:
 * - addToCart(): New item, duplicate item, validation
 * - removeFromCart(): Existing item, non-existing item
 * - clearCart(): Empty cart, cart with items
 * - isInCart(): Item exists, item doesn't exist
 * - getTotalPrice(): Empty cart, single item, multiple items
 * - getItemCount(): Empty cart, multiple items
 * - localStorage integration: Save, load, persist
 * 
 * Total Test Cases: 18+
 * Target Coverage: 95%+
 */

import { render, screen, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import React from 'react';

// Mock useToast hook - CartContext uses: const { toast } = useToast()
jest.mock('../../components/ui/Toast', () => ({
  useToast: () => {
    const mockMethods = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };
    return {
      ...mockMethods,
      toast: mockMethods
    };
  }
}));

// Test component to access cart context
const TestComponent = ({ onRender }) => {
  const cart = useCart();
  React.useEffect(() => {
    if (onRender) {
      onRender(cart);
    }
  });
  return <div>Test Component</div>;
};

describe('CartContext', () => {
  let cart;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    cart = null;
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderWithCart = () => {
    return new Promise((resolve) => {
      render(
        <CartProvider>
          <TestComponent onRender={(cartContext) => {
            cart = cartContext;
            resolve(cartContext);
          }} />
        </CartProvider>
      );
    });
  };

  describe('Initialization', () => {
    test('should initialize with empty cart', async () => {
      await renderWithCart();
      expect(cart.cartItems).toEqual([]);
      expect(cart.getItemCount()).toBe(0);
      expect(cart.getTotalPrice()).toBe(0);
    });

    test('should load cart from localStorage on mount', async () => {
      const savedCart = [
        { id: 1, title: 'Course 1', price: 100000, instructor: 'Teacher 1' }
      ];
      localStorage.setItem('cart', JSON.stringify(savedCart));

      await renderWithCart();
      expect(cart.cartItems).toHaveLength(1);
      expect(cart.cartItems[0].title).toBe('Course 1');
    });

    test('should handle corrupted localStorage data', async () => {
      localStorage.setItem('cart', 'invalid-json{]');
      
      await renderWithCart();
      expect(cart.cartItems).toEqual([]);
    });
  });

  describe('addToCart()', () => {
    test('should add new course to empty cart', async () => {
      await renderWithCart();
      
      const course = {
        id: 1,
        title: 'React Advanced',
        price: 500000,
        instructorName: 'John Doe',
        thumbnail: 'image.jpg',
        level: 'Advanced',
        duration: '10h'
      };

      act(() => {
        cart.addToCart(course);
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(1);
        expect(cart.cartItems[0]).toEqual({
          id: 1,
          title: 'React Advanced',
          price: 500000,
          instructor: 'John Doe',
          thumbnail: 'image.jpg',
          level: 'Advanced',
          duration: '10h'
        });
      });
    });

    test('should add multiple different courses', async () => {
      await renderWithCart();
      
      const course1 = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };
      const course2 = { id: 2, title: 'Course 2', price: 200000, instructorName: 'T2' };

      act(() => {
        cart.addToCart(course1);
        cart.addToCart(course2);
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(2);
        expect(cart.getItemCount()).toBe(2);
      });
    });

    test('should prevent adding duplicate course', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
        cart.addToCart(course); // Try to add again
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(1);
      });
    });

    test('should save to localStorage after adding', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
      });

      await waitFor(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart'));
        expect(savedCart).toHaveLength(1);
        expect(savedCart[0].title).toBe('Course 1');
      });
    });
  });

  describe('removeFromCart()', () => {
    test('should remove existing course from cart', async () => {
      await renderWithCart();
      
      const course1 = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };
      const course2 = { id: 2, title: 'Course 2', price: 200000, instructorName: 'T2' };

      act(() => {
        cart.addToCart(course1);
        cart.addToCart(course2);
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(2);
      });

      act(() => {
        cart.removeFromCart(1);
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(1);
        expect(cart.cartItems[0].id).toBe(2);
      });
    });

    test('should handle removing non-existing course', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
      });

      act(() => {
        cart.removeFromCart(999); // Non-existing ID
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(1);
      });
    });

    test('should update localStorage after removal', async () => {
      await renderWithCart();
      
      const course1 = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };
      const course2 = { id: 2, title: 'Course 2', price: 200000, instructorName: 'T2' };

      act(() => {
        cart.addToCart(course1);
        cart.addToCart(course2);
        cart.removeFromCart(1);
      });

      await waitFor(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart'));
        expect(savedCart).toHaveLength(1);
        expect(savedCart[0].id).toBe(2);
      });
    });
  });

  describe('clearCart()', () => {
    test('should clear all items from cart', async () => {
      await renderWithCart();
      
      const course1 = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };
      const course2 = { id: 2, title: 'Course 2', price: 200000, instructorName: 'T2' };

      act(() => {
        cart.addToCart(course1);
        cart.addToCart(course2);
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(2);
      });

      act(() => {
        cart.clearCart();
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(0);
        expect(cart.getItemCount()).toBe(0);
      });
    });

    test('should remove cart from localStorage', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
        cart.clearCart();
      });

      await waitFor(() => {
        // After clearing, localStorage contains empty array "[]"
        expect(localStorage.getItem('cart')).toBe('[]');
      });
    });

    test('should handle clearing empty cart', async () => {
      await renderWithCart();
      
      act(() => {
        cart.clearCart();
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(0);
      });
    });
  });

  describe('isInCart()', () => {
    test('should return true for existing course', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
      });

      await waitFor(() => {
        expect(cart.isInCart(1)).toBe(true);
      });
    });

    test('should return false for non-existing course', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
      });

      await waitFor(() => {
        expect(cart.isInCart(999)).toBe(false);
      });
    });

    test('should return false for empty cart', async () => {
      await renderWithCart();
      
      expect(cart.isInCart(1)).toBe(false);
    });
  });

  describe('getTotalPrice()', () => {
    test('should return 0 for empty cart', async () => {
      await renderWithCart();
      
      expect(cart.getTotalPrice()).toBe(0);
    });

    test('should calculate total for single item', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
      });

      await waitFor(() => {
        expect(cart.getTotalPrice()).toBe(100000);
      });
    });

    test('should calculate total for multiple items', async () => {
      await renderWithCart();
      
      const course1 = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };
      const course2 = { id: 2, title: 'Course 2', price: 250000, instructorName: 'T2' };
      const course3 = { id: 3, title: 'Course 3', price: 150000, instructorName: 'T3' };

      act(() => {
        cart.addToCart(course1);
        cart.addToCart(course2);
        cart.addToCart(course3);
      });

      await waitFor(() => {
        expect(cart.getTotalPrice()).toBe(500000);
      });
    });

    test('should handle decimal prices', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Course 1', price: 99999.99, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
      });

      await waitFor(() => {
        expect(cart.getTotalPrice()).toBe(99999.99);
      });
    });

    test('should update total after removing item', async () => {
      await renderWithCart();
      
      const course1 = { id: 1, title: 'Course 1', price: 100000, instructorName: 'T1' };
      const course2 = { id: 2, title: 'Course 2', price: 200000, instructorName: 'T2' };

      act(() => {
        cart.addToCart(course1);
        cart.addToCart(course2);
      });

      await waitFor(() => {
        expect(cart.getTotalPrice()).toBe(300000);
      });

      act(() => {
        cart.removeFromCart(1);
      });

      await waitFor(() => {
        expect(cart.getTotalPrice()).toBe(200000);
      });
    });
  });

  describe('getItemCount()', () => {
    test('should return 0 for empty cart', async () => {
      await renderWithCart();
      
      expect(cart.getItemCount()).toBe(0);
    });

    test('should return correct count for multiple items', async () => {
      await renderWithCart();
      
      const courses = [
        { id: 1, title: 'C1', price: 100000, instructorName: 'T1' },
        { id: 2, title: 'C2', price: 200000, instructorName: 'T2' },
        { id: 3, title: 'C3', price: 300000, instructorName: 'T3' }
      ];

      act(() => {
        courses.forEach(course => cart.addToCart(course));
      });

      await waitFor(() => {
        expect(cart.getItemCount()).toBe(3);
      });
    });

    test('should update count after removal', async () => {
      await renderWithCart();
      
      const course1 = { id: 1, title: 'C1', price: 100000, instructorName: 'T1' };
      const course2 = { id: 2, title: 'C2', price: 200000, instructorName: 'T2' };

      act(() => {
        cart.addToCart(course1);
        cart.addToCart(course2);
      });

      await waitFor(() => {
        expect(cart.getItemCount()).toBe(2);
      });

      act(() => {
        cart.removeFromCart(1);
      });

      await waitFor(() => {
        expect(cart.getItemCount()).toBe(1);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle large number of items', async () => {
      await renderWithCart();
      
      const courses = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        title: `Course ${i + 1}`,
        price: 100000,
        instructorName: `Teacher ${i + 1}`
      }));

      act(() => {
        courses.forEach(course => cart.addToCart(course));
      });

      await waitFor(() => {
        expect(cart.getItemCount()).toBe(50);
        expect(cart.getTotalPrice()).toBe(5000000);
      });
    });

    test('should handle very large prices', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Course 1', price: 99999999, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
      });

      await waitFor(() => {
        expect(cart.getTotalPrice()).toBe(99999999);
      });
    });

    test('should handle zero price', async () => {
      await renderWithCart();
      
      const course = { id: 1, title: 'Free Course', price: 0, instructorName: 'T1' };

      act(() => {
        cart.addToCart(course);
      });

      await waitFor(() => {
        expect(cart.getTotalPrice()).toBe(0);
        expect(cart.getItemCount()).toBe(1);
      });
    });
  });

  describe('Error Handling', () => {
    test('should throw error when useCart used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent onRender={() => {}} />);
      }).toThrow('useCart must be used within CartProvider');

      consoleSpy.mockRestore();
    });
  });
});
