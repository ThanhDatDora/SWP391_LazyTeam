import React, { useState, useEffect } from 'react';

/**
 * Modern Progress Bar Component with animations
 */
export const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  size = 'medium',
  variant = 'default',
  showLabel = true,
  animated = true,
  color = 'teal',
  className = ''
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(value);
    }
  }, [value, animated]);

  const percentage = Math.min((animatedValue / max) * 100, 100);

  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3',
    xl: 'h-4'
  };

  const colorClasses = {
    teal: 'bg-teal-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    red: 'bg-red-600'
  };

  const baseClass = `w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`;
  
  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={baseClass}>
        <div 
          className={`${colorClasses[color]} h-full transition-all duration-500 ease-out ${
            animated ? 'transform-gpu' : ''
          } ${variant === 'striped' ? 'bg-stripes' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          {variant === 'animated' && (
            <div className="h-full w-full bg-white opacity-30 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Circular Progress Component
 */
export const CircularProgress = ({ 
  value = 0, 
  max = 100, 
  size = 64,
  strokeWidth = 4,
  color = 'teal',
  showLabel = true,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    teal: 'text-teal-600',
    blue: 'text-blue-600', 
    green: 'text-green-600',
    purple: 'text-purple-600'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClasses[color]} transition-all duration-500 ease-out`}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Multi-step Progress Component
 */
export const StepProgress = ({ 
  steps = [], 
  currentStep = 0, 
  variant = 'default',
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted 
              ? 'bg-teal-600 text-white' 
              : isActive 
                ? 'bg-teal-100 text-teal-700 ring-4 ring-teal-200' 
                : 'bg-gray-200 text-gray-500'
            }
                `}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Label */}
                <span className={`
                  mt-2 text-xs font-medium text-center max-w-20
                  ${isActive ? 'text-teal-700' : 'text-gray-500'}
                `}>
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-2 transition-all duration-300
                  ${isCompleted 
                  ? 'bg-teal-600' 
                  : 'bg-gray-200'
                }
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Loading Skeleton Component
 */
export const SkeletonLoader = ({ 
  variant = 'text',
  width = '100%',
  height = '1rem',
  lines = 1,
  className = ''
}) => {
  if (variant === 'card') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-300 h-48 w-full rounded-lg mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
          <div className="h-3 bg-gray-300 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`animate-pulse flex items-center space-x-3 ${className}`}>
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-gray-300 rounded w-1/2" />
          <div className="h-2 bg-gray-300 rounded w-1/3" />
        </div>
      </div>
    );
  }

  // Text variant
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className="h-4 bg-gray-300 rounded"
          style={{ 
            width: i === lines - 1 ? '75%' : width,
            height 
          }}
        />
      ))}
    </div>
  );
};

export default {
  ProgressBar,
  CircularProgress,
  StepProgress,
  SkeletonLoader
};