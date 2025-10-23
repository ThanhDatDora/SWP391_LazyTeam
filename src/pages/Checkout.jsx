import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, CreditCard, MapPin, User, Mail, Phone, Lock, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { COURSES } from '../data/mockData';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useNavigation } from '../hooks/useNavigation';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';

const Checkout = () => {
  const navigate = useNavigation();
  const { state } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // 1: Cart, 2: Billing, 3: Payment, 4: Confirmation
  const [cartItems, setCartItems] = useState([
    { 
      courseId: 1, 
      quantity: 1, 
      course: COURSES[0]
    },
    { 
      courseId: 2, 
      quantity: 1, 
      course: COURSES[1]
    }
  ]);

  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'card'
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.course.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const updateQuantity = (courseId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(courseId);
    } else {
      setCartItems(items =>
        items.map(item =>
          item.courseId === courseId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (courseId) => {
    setCartItems(items => items.filter(item => item.courseId !== courseId));
  };

  const handleBillingSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const steps = [
    { id: 1, name: 'Cart', icon: ShoppingCart },
    { id: 2, name: 'Billing', icon: User },
    { id: 3, name: 'Payment', icon: CreditCard },
    { id: 4, name: 'Confirmation', icon: Check }
  ];

  return (
    <AppLayout user={state.user}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-teal-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 ml-4 ${
                      currentStep > step.id ? 'bg-teal-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Cart */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                  Shopping Cart ({cartItems.length} items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Your cart is empty</p>
                        <Button onClick={() => navigate('/catalog')}>
                      Browse Courses
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.courseId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                            <img 
                              src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=150&auto=format&fit=crop"
                              alt={item.course.title}
                              className="w-20 h-14 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{item.course.title}</h3>
                              <p className="text-sm text-gray-600">{item.course.duration} • {item.course.level}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{item.course.categoryId === 1 ? 'Programming' : 'Design'}</Badge>
                                <span className="text-sm text-gray-500">⭐ {item.course.rating}</span>
                              </div>
                            </div>
                        
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.courseId, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.courseId, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(item.course.price * item.quantity)}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.courseId)}
                                className="text-red-500 hover:text-red-700 mt-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    
                        <div className="flex justify-between pt-4">
                          <Button variant="outline" onClick={() => navigate('/catalog')}>
                        Continue Shopping
                          </Button>
                          <Button 
                            onClick={() => setCurrentStep(2)}
                            className="bg-teal-500 hover:bg-teal-600"
                          >
                        Proceed to Billing
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Billing Information */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                  Billing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBillingSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                          </label>
                          <Input
                            required
                            value={billingInfo.firstName}
                            onChange={(e) => setBillingInfo(prev => ({...prev, firstName: e.target.value}))}
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                          </label>
                          <Input
                            required
                            value={billingInfo.lastName}
                            onChange={(e) => setBillingInfo(prev => ({...prev, lastName: e.target.value}))}
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            required
                            type="email"
                            className="pl-10"
                            value={billingInfo.email}
                            onChange={(e) => setBillingInfo(prev => ({...prev, email: e.target.value}))}
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="tel"
                            className="pl-10"
                            value={billingInfo.phone}
                            onChange={(e) => setBillingInfo(prev => ({...prev, phone: e.target.value}))}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            required
                            className="pl-10"
                            value={billingInfo.address}
                            onChange={(e) => setBillingInfo(prev => ({...prev, address: e.target.value}))}
                            placeholder="123 Main Street"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                          </label>
                          <Input
                            required
                            value={billingInfo.city}
                            onChange={(e) => setBillingInfo(prev => ({...prev, city: e.target.value}))}
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={billingInfo.country}
                            onChange={(e) => setBillingInfo(prev => ({...prev, country: e.target.value}))}
                          >
                            <option value="">Select Country</option>
                            <option value="US">United States</option>
                            <option value="VN">Vietnam</option>
                            <option value="GB">United Kingdom</option>
                            <option value="CA">Canada</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                          </label>
                          <Input
                            required
                            value={billingInfo.zipCode}
                            onChange={(e) => setBillingInfo(prev => ({...prev, zipCode: e.target.value}))}
                            placeholder="10001"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => setCurrentStep(1)}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Cart
                        </Button>
                        <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                      Continue to Payment
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                  Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      {/* Payment Method Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                        </label>
                        <div className="grid md:grid-cols-3 gap-4">
                          {[
                            { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                            { id: 'paypal', name: 'PayPal', icon: '🅿️' },
                            { id: 'crypto', name: 'Cryptocurrency', icon: '₿' }
                          ].map(method => (
                            <div
                              key={method.id}
                              className={`p-4 border-2 rounded-lg cursor-pointer text-center ${
                                paymentInfo.paymentMethod === method.id
                                  ? 'border-teal-500 bg-teal-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setPaymentInfo(prev => ({...prev, paymentMethod: method.id}))}
                            >
                              <div className="text-2xl mb-2">{method.icon}</div>
                              <div className="font-medium">{method.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Payment Form */}
                      {paymentInfo.paymentMethod === 'card' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number *
                            </label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                required
                                className="pl-10"
                                value={paymentInfo.cardNumber}
                                onChange={(e) => setPaymentInfo(prev => ({...prev, cardNumber: e.target.value}))}
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date *
                              </label>
                              <Input
                                required
                                value={paymentInfo.expiryDate}
                                onChange={(e) => setPaymentInfo(prev => ({...prev, expiryDate: e.target.value}))}
                                placeholder="MM/YY"
                                maxLength="5"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV *
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                  required
                                  className="pl-10"
                                  value={paymentInfo.cvv}
                                  onChange={(e) => setPaymentInfo(prev => ({...prev, cvv: e.target.value}))}
                                  placeholder="123"
                                  maxLength="4"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name *
                            </label>
                            <Input
                              required
                              value={paymentInfo.cardholderName}
                              onChange={(e) => setPaymentInfo(prev => ({...prev, cardholderName: e.target.value}))}
                              placeholder="John Doe"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-4">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => setCurrentStep(2)}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Billing
                        </Button>
                        <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                      Complete Order - {formatCurrency(total)}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <Card>
                  <CardContent className="text-center p-8">
                    <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-600 mb-6">
                  Thank you for your purchase. Your courses are now available in your account.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="text-sm text-gray-600 mb-2">Order ID</div>
                      <div className="font-mono text-lg">#ORD-2023-001234</div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={() => navigate('/course-player/1')}>
                    Start Learning
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/catalog')}>
                    Continue Shopping
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.courseId} className="flex items-center gap-3">
                        <img 
                          src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=60&auto=format&fit=crop"
                          alt={item.course.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.course.title}
                          </h4>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(item.course.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="w-4 h-4" />
                      <span>Secure 256-bit SSL encryption</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Checkout;