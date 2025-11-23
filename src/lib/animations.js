/**
 * Modern Animation System for Mini Coursera
 * Implements smooth transitions, micro-interactions, and accessibility-friendly animations
 */

// Animation variants for different use cases
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: 'easeOut' }
};

export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { opacity: 1, scale: 1 },
  transition: { 
    duration: 0.5,
    ease: 'easeOut',
    scale: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
};

// Stagger animations for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
};

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
};

export const hoverLift = {
  whileHover: { y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
  transition: { duration: 0.2 }
};

// Loading animations
export const pulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const spinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// CSS-only animations for performance
export const cssAnimations = `
  /* Smooth transitions */
  .transition-smooth {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .transition-fast {
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .transition-slow {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Hover effects */
  .hover-lift {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .hover-scale {
    transition: transform 0.2s ease;
  }

  .hover-scale:hover {
    transform: scale(1.02);
  }

  /* Focus states */
  .focus-ring {
    transition: box-shadow 0.15s ease;
  }

  .focus-ring:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }

  /* Skeleton loading */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* Fade in animations */
  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Slide animations */
  .slide-in-left {
    animation: slideInLeft 0.3s ease-out;
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* Bounce animation for success states */
  .bounce-in {
    animation: bounceIn 0.5s ease-out;
  }

  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.1); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }

  /* Stagger animations */
  .stagger-item {
    opacity: 0;
    animation: fadeInUp 0.3s ease-out forwards;
  }

  .stagger-item:nth-child(1) { animation-delay: 0.1s; }
  .stagger-item:nth-child(2) { animation-delay: 0.2s; }
  .stagger-item:nth-child(3) { animation-delay: 0.3s; }
  .stagger-item:nth-child(4) { animation-delay: 0.4s; }
  .stagger-item:nth-child(5) { animation-delay: 0.5s; }
  .stagger-item:nth-child(6) { animation-delay: 0.6s; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }

    .skeleton {
      animation: none;
      background: #f0f0f0;
    }
  }

  /* Loading states */
  .loading-dots {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .loading-dots::after {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    animation: loadingDots 1.4s infinite ease-in-out both;
  }

  .loading-dots::before {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    margin-right: 4px;
    animation: loadingDots 1.4s -0.32s infinite ease-in-out both;
  }

  @keyframes loadingDots {
    0%, 80%, 100% { opacity: 0; }
    40% { opacity: 1; }
  }

  /* Micro-interactions */
  .button-press {
    transition: transform 0.1s ease;
  }

  .button-press:active {
    transform: scale(0.98);
  }

  /* Toast notifications */
  .toast-enter {
    animation: toastEnter 0.3s ease-out;
  }

  @keyframes toastEnter {
    from { 
      opacity: 0; 
      transform: translateX(100%) scale(0.8);
    }
    to { 
      opacity: 1; 
      transform: translateX(0) scale(1);
    }
  }

  .toast-exit {
    animation: toastExit 0.2s ease-in;
  }

  @keyframes toastExit {
    from { 
      opacity: 1; 
      transform: translateX(0) scale(1);
    }
    to { 
      opacity: 0; 
      transform: translateX(100%) scale(0.8);
    }
  }
`;

// Utility functions for animation
export const createVariant = (initial, animate, transition = {}) => ({
  initial,
  animate,
  transition: { duration: 0.3, ease: 'easeOut', ...transition }
});

export const createStagger = (children, delayBetween = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: delayBetween
    }
  }
});

// Animation presets for common UI elements
export const animations = {
  // Cards and containers
  card: fadeInUp,
  modal: scaleIn,
  sidebar: slideInLeft,
  dropdown: fadeIn,
  
  // Lists and grids
  listItem: staggerItem,
  listContainer: staggerContainer,
  
  // Buttons and interactions
  button: hoverScale,
  iconButton: { ...hoverScale, whileHover: { ...hoverScale.whileHover, rotate: 5 } },
  
  // Page transitions
  page: pageTransition,
  
  // Loading states
  skeleton: pulse,
  spinner: spinner
};

export default animations;