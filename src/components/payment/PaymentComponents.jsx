/**
 * Stripe Payment Integration
 * Comprehensive payment processing for course purchases and subscriptions
 */

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  CreditCard, Shield, CheckCircle, AlertCircle, 
  Loader2, Lock, DollarSign, Star, Users 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#9e2146'
    }
  }
};

export function PaymentForm({ course, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const [processing, setProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [finalPrice, setFinalPrice] = useState(course.price);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [course.id]);

  const createPaymentIntent = async () => {
    try {
      const response = await api.post('/payments/create-intent', {
        courseId: course.id,
        amount: course.price * 100, // Convert to cents
        currency: 'usd',
        couponCode: appliedCoupon?.code
      });

      if (response.success) {
        setPaymentIntent(response.data);
        setFinalPrice(response.data.amount / 100);
      }
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      setError('Failed to initialize payment. Please try again.');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {return;}

    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        courseId: course.id
      });

      if (response.success) {
        setAppliedCoupon(response.data);
        const discount = response.data.type === 'percentage' 
          ? course.price * (response.data.value / 100)
          : response.data.value;
        setFinalPrice(Math.max(0, course.price - discount));
        
        toast({
          title: 'Coupon Applied!',
          description: `You saved $${discount.toFixed(2)}`,
          variant: 'success'
        });

        // Recreate payment intent with new amount
        createPaymentIntent();
      } else {
        setError(response.error || 'Invalid coupon code');
      }
    } catch (error) {
      setError('Failed to apply coupon');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setFinalPrice(course.price);
    createPaymentIntent();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    const card = elements.getElement(CardElement);

    // Confirm payment
    const { error: stripeError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
      paymentIntent.client_secret,
      {
        payment_method: {
          card: card,
          billing_details: {
            name: authState.user?.full_name,
            email: authState.user?.email
          }
        }
      }
    );

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
    } else {
      // Payment succeeded
      try {
        // Confirm enrollment on backend
        const enrollResponse = await api.post('/enrollments/confirm', {
          courseId: course.id,
          paymentIntentId: confirmedPayment.id,
          amount: finalPrice,
          couponCode: appliedCoupon?.code
        });

        if (enrollResponse.success) {
          onSuccess({
            paymentIntent: confirmedPayment,
            enrollment: enrollResponse.data
          });
        } else {
          throw new Error(enrollResponse.error || 'Failed to confirm enrollment');
        }
      } catch (error) {
        console.error('Enrollment confirmation failed:', error);
        onError('Payment processed but enrollment failed. Please contact support.');
      }
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <img 
            src={course.image || '/api/placeholder/64/64'} 
            alt={course.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{course.title}</h3>
            <p className="text-sm text-gray-600">by {course.instructor}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium ml-1">{course.rating}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {course.learners} students
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Code */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Coupon Code (Optional)
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={appliedCoupon}
          />
          {appliedCoupon ? (
            <Button type="button" variant="outline" onClick={removeCoupon}>
              Remove
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          )}
        </div>
        {appliedCoupon && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              Coupon "{appliedCoupon.code}" applied - 
              {appliedCoupon.type === 'percentage' 
                ? ` ${appliedCoupon.value}% off` 
                : ` $${appliedCoupon.value} off`}
            </span>
          </div>
        )}
      </div>

      {/* Payment Details */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md p-3 bg-white">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Shield className="h-4 w-4 mr-2" />
          <span>Your payment information is encrypted and secure</span>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Course Price:</span>
          <span className="font-medium">${course.price.toFixed(2)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-green-600">
            <span>Discount:</span>
            <span>-${(course.price - finalPrice).toFixed(2)}</span>
          </div>
        )}
        <hr className="border-gray-200" />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>${finalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3"
      >
        {processing ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Complete Purchase - ${finalPrice.toFixed(2)}</span>
          </div>
        )}
      </Button>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>SSL Secured</span>
        </div>
        <span>•</span>
        <div className="flex items-center space-x-1">
          <CreditCard className="h-3 w-3" />
          <span>Stripe Protected</span>
        </div>
        <span>•</span>
        <span>30-day Money Back</span>
      </div>
    </form>
  );
}

export function PaymentModal({ course, isOpen, onClose, onSuccess }) {
  const [paymentStatus, setPaymentStatus] = useState('form'); // form, success, error

  const handleSuccess = (result) => {
    setPaymentStatus('success');
    onSuccess?.(result);
  };

  const handleError = (error) => {
    setPaymentStatus('error');
    console.error('Payment error:', error);
  };

  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Complete Purchase</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {paymentStatus === 'form' && (
            <Elements stripe={stripePromise}>
              <PaymentForm 
                course={course}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900">Payment Successful!</h3>
              <p className="text-gray-600">
                Welcome to "{course.title}"! You can now access all course materials.
              </p>
              <Button onClick={onClose} className="w-full">
                Start Learning
              </Button>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900">Payment Failed</h3>
              <p className="text-gray-600">
                There was an issue processing your payment. Please try again.
              </p>
              <Button onClick={() => setPaymentStatus('form')} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SubscriptionPlans() {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      interval: 'month',
      features: [
        'Access to 50+ courses',
        'Mobile app access',
        'Basic support',
        '1 device'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      interval: 'month',
      features: [
        'Access to 500+ courses',
        'Mobile app access',
        'Priority support',
        '3 devices',
        'Downloadable content',
        'Certificates'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 39.99,
      interval: 'month',
      features: [
        'Access to all courses',
        'Mobile app access',
        '24/7 support',
        'Unlimited devices',
        'Downloadable content',
        'Certificates',
        '1-on-1 mentoring',
        'Job placement assistance'
      ],
      popular: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className={`p-6 relative ${plan.popular ? 'border-blue-500 border-2' : ''}`}>
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              Most Popular
            </Badge>
          )}
          
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <div className="space-y-1">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-gray-600">/{plan.interval}</span>
            </div>
            
            <ul className="space-y-2 text-sm text-gray-600">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {plan.popular ? 'Get Started' : 'Choose Plan'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}