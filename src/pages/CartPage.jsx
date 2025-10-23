import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import LearnerNavbar from '../components/layout/LearnerNavbar';
import Footer from '../components/layout/Footer';
import { useNavigation } from '../hooks/useNavigation';

const CartPage = () => {
  const navigate = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } else {
        // Default cart items for demo purposes
        const defaultCart = [
          {
            id: 1,
            title: 'AWS Certified Solutions Architect',
            instructor: 'John Doe',
            price: 89000,
            originalPrice: 149000,
            thumbnail: 'https://picsum.photos/200/120?random=1',
            rating: 4.8,
            duration: '12h 30m'
          },
          {
            id: 2,
            title: 'React Complete Guide 2024',
            instructor: 'Jane Smith',
            price: 69000,
            originalPrice: 99000,
            thumbnail: 'https://picsum.photos/200/120?random=2',
            rating: 4.9,
            duration: '18h 45m'
          }
        ];
        setCartItems(defaultCart);
        localStorage.setItem('cart', JSON.stringify(defaultCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateCartInStorage = (updatedCart) => {
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const getTotalOriginalPrice = () => {
    return cartItems.reduce((total, item) => total + item.originalPrice, 0);
  };

  const getSavings = () => {
    return getTotalOriginalPrice() - getTotalPrice();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerNavbar />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cartItems.length} course{cartItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Discover courses and add them to your cart to get started.</p>
            <Button onClick={() => navigate('/catalog')}>
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                            {item.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">By {item.instructor}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>{item.duration}</span>
                          <span>⭐ {item.rating}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(item.price)}
                          </span>
                          <span className="text-gray-500 line-through">
                            {formatCurrency(item.originalPrice)}
                          </span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {Math.round((1 - item.price / item.originalPrice) * 100)}% off
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Original Price:</span>
                    <span className="line-through text-gray-500">
                      {formatCurrency(getTotalOriginalPrice())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(getSavings())}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <Button className="w-full" size="lg">
                    Checkout
                  </Button>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      30-Day Money-Back Guarantee
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CartPage;