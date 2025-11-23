import React, { useState } from 'react';
import { Check, X, Star, Users, BookOpen, Award, Zap, Shield, Headphones } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useNavigation } from '../hooks/useNavigation';

const Pricing = () => {
  const navigate = useNavigation();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: billingCycle === 'monthly' ? 0 : 0,
      originalPrice: null,
      popular: false,
      color: 'border-gray-200',
      buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
      features: [
        { name: 'Access to free courses', included: true },
        { name: 'Basic video quality', included: true },
        { name: 'Community forum access', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Certificate of completion', included: false },
        { name: 'HD video quality', included: false },
        { name: 'Priority support', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom learning paths', included: false },
        { name: 'Offline downloads', included: false }
      ]
    },
    {
      name: 'Premium',
      description: 'Best for individual learners',
      price: billingCycle === 'monthly' ? 29 : 290,
      originalPrice: billingCycle === 'monthly' ? 39 : 390,
      popular: true,
      color: 'border-teal-500 ring-2 ring-teal-500',
      buttonClass: 'bg-teal-500 hover:bg-teal-600 text-white',
      features: [
        { name: 'Access to all courses', included: true },
        { name: 'HD video quality', included: true },
        { name: 'Certificate of completion', included: true },
        { name: 'Mobile app access', included: true },
        { name: 'Community forum access', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Offline downloads', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'Custom learning paths', included: false },
        { name: 'Team management tools', included: false }
      ]
    },
    {
      name: 'Business',
      description: 'Perfect for teams and organizations',
      price: billingCycle === 'monthly' ? 99 : 990,
      originalPrice: billingCycle === 'monthly' ? 129 : 1290,
      popular: false,
      color: 'border-blue-500',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      features: [
        { name: 'Everything in Premium', included: true },
        { name: 'Team management tools', included: true },
        { name: 'Custom learning paths', included: true },
        { name: 'Advanced analytics & reporting', included: true },
        { name: 'Priority phone support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Bulk user management', included: true },
        { name: 'SSO integration', included: true },
        { name: 'Custom branding', included: true }
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer at Google',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop',
      content: 'The courses are incredibly well-structured and practical. I was able to land my dream job after completing the Full Stack Development track.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager at Microsoft',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
      content: 'As a busy professional, the flexibility to learn at my own pace was crucial. The mobile app made it easy to study during my commute.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer at Adobe',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
      content: 'The design courses completely transformed my career. The instructors are industry experts who provide real-world insights.',
      rating: 5
    }
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes, we offer a 14-day free trial for our Premium and Business plans. No credit card required.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.'
    },
    {
      question: 'Do you offer refunds?',
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Absolutely. You can cancel your subscription at any time from your account settings. Your access will continue until the end of your billing period.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
          Choose Your Learning Path
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock your potential with our flexible pricing plans. From individual learners to enterprise teams, we have the perfect solution for you.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-teal-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          <Badge className="bg-teal-100 text-teal-700">Save 25%</Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.color} ${plan.popular ? 'scale-105' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-teal-500 text-white px-6 py-1">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
              <p className="text-gray-600">{plan.description}</p>
              
              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
                {plan.originalPrice && (
                  <p className="text-sm text-gray-500 line-through">
                    ${plan.originalPrice}/{billingCycle === 'monthly' ? 'month' : 'year'}
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Button 
                className={`w-full ${plan.buttonClass}`} 
                size="lg"
                onClick={() => window.location.href = plan.name === 'Free' ? '/auth' : '/checkout'}
              >
                {plan.name === 'Free' ? 'Get Started Free' : 'Start Free Trial'}
              </Button>              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare All Features</h2>
          <p className="text-xl text-gray-600">See exactly what's included in each plan</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Premium</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Business</th>
              </tr>
            </thead>
            <tbody>
              {plans[0].features.map((feature, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 px-6 text-gray-900">{feature.name}</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-6">
                      {plan.features[index]?.included ? (
                        <Check className="w-5 h-5 text-teal-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
          <p className="text-xl text-gray-600">Join thousands of successful learners</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-8 lg:p-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Professionals Worldwide</h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-teal-600 mb-2">50K+</div>
            <p className="text-gray-600">Active Students</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-teal-600 mb-2">500+</div>
            <p className="text-gray-600">Expert Instructors</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-teal-600 mb-2">1000+</div>
            <p className="text-gray-600">Courses Available</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-teal-600 mb-2">95%</div>
            <p className="text-gray-600">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Got questions? We've got answers</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 lg:p-12 text-white">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Ready to Start Your Learning Journey?
        </h2>
        <p className="text-xl mb-8 text-white/90">
          Join thousands of students who are already advancing their careers with our platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-white text-teal-600 hover:bg-white/90"
            onClick={() => navigate('/checkout')}
          >
            Start Free Trial
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white/10"
            onClick={() => navigate('/catalog')}
          >
            View All Courses
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Pricing;