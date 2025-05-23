'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface UserTypeSelectorProps {
  userType: string;
  setUserType: (type: string) => void;
}

export default function UserTypeSelector({ userType, setUserType }: UserTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const userTypes = [
    { value: '', label: 'None' },
    { value: 'Small Business', label: 'Small Business' },
    { value: 'E-commerce Store', label: 'E-commerce Store' },
    { value: 'Influencer', label: 'Influencer' },
    { value: 'UGC Creator', label: 'UGC Creator' },
    { value: 'Personal Brand', label: 'Personal Brand' },
    { value: 'SaaS Company', label: 'SaaS Company' },
    { value: 'Local Service', label: 'Local Service' },
    { value: 'Non-profit', label: 'Non-profit' },
    { value: 'Restaurant', label: 'Restaurant' },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectUserType = (type: string) => {
    setUserType(type);
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (!userType) return 'Select User Type (Optional)';
    return userTypes.find(type => type.value === userType)?.label || userType;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        User Type
      </label>
      <div className="relative">
        <button
          type="button"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-left flex justify-between items-center"
          onClick={toggleDropdown}
        >
          <span>{getDisplayLabel()}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {userTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors duration-150 ${
                  userType === type.value ? 'bg-blue-50 text-blue-600' : ''
                }`}
                onClick={() => selectUserType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {userType && (
        <p className="mt-1 text-xs text-gray-500">
          Your prompts will be optimized for {userType.toLowerCase()} content.
        </p>
      )}
    </div>
  );
} 