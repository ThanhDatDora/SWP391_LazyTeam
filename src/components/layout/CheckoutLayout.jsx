import React from 'react';
import LearnerNavbar from './LearnerNavbar';
import Footer from './Footer';

const CheckoutLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Full LearnerNavbar - Logo | Danh mục | Blog | 🛒 */}
      <LearnerNavbar />
      
      {/* Main Content - NO Sidebar Menu */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Full Footer */}
      <Footer />
    </div>
  );
};

export default CheckoutLayout;
