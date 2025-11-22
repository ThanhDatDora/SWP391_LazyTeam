import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { 
            onClick: () => setOpen(!open),
            open 
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { 
            open,
            onSelect: (newValue) => {
              onValueChange(newValue);
              setOpen(false);
            },
            value,
            onClose: () => setOpen(false)
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = ({ children, onClick, open, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${className}`}
    >
      {children}
      <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
};

export const SelectValue = ({ placeholder, children }) => {
  return (
    <span className="block truncate">
      {children || placeholder}
    </span>
  );
};

export const SelectContent = ({ children, open, onSelect, value, onClose }) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop to close dropdown */}
      <div 
        className="fixed inset-0 z-10" 
        onClick={onClose}
      />
      
      {/* Dropdown menu */}
      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
        {React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, { 
              onSelect,
              selected: child.props.value === value
            });
          }
          return child;
        })}
      </div>
    </>
  );
};

export const SelectItem = ({ value, children, onSelect, selected }) => {
  return (
    <div
      onClick={() => onSelect(value)}
      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
        selected ? 'bg-teal-50 text-teal-700' : 'text-gray-900'
      }`}
    >
      {children}
      {selected && <Check className="w-4 h-4 ml-2" />}
    </div>
  );
};
