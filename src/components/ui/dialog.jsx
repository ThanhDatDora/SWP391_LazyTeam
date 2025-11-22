import React from 'react';
import { X } from 'lucide-react';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog Content */}
      <div className="relative z-50 w-full">
        {children}
      </div>
    </div>
  );
};

export const DialogTrigger = ({ asChild, children, onClick, ...props }) => {
  if (asChild) {
    // Clone the child element and merge onClick handlers
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        // Call the original onClick if exists
        if (children.props.onClick) {
          children.props.onClick(e);
        }
        // Call the DialogTrigger onClick (which opens the dialog)
        if (onClick) {
          onClick(e);
        }
      }
    });
  }
  
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export const DialogContent = ({ children, className = '' }) => {
  return (
    <div className={`relative mx-auto max-w-lg bg-white rounded-lg shadow-xl p-6 ${className}`}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
};

export const DialogDescription = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </p>
  );
};

export const DialogFooter = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center justify-end gap-2 mt-6 ${className}`}>
      {children}
    </div>
  );
};
