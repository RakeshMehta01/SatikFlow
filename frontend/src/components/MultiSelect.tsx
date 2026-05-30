import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, X, Check, Search } from 'lucide-react';

export interface ServiceOption {
  value: string;
  label: string;
}

export interface ServiceCategory {
  category: string;
  options: ServiceOption[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    category: 'Website Development',
    options: [
      { value: 'Wordpress Informative Website', label: 'WordPress Informative Website' },
      { value: 'Wordpress E-Commerce Website', label: 'WordPress E-Commerce Website' },
      { value: 'Custom Informative Website', label: 'Custom Informative Website' },
      { value: 'Custom E-Commerce Website', label: 'Custom E-Commerce Website' },
    ]
  },
  {
    category: 'Software Development',
    options: [
      { value: 'CRM Development', label: 'CRM Development' },
      { value: 'ERP Development', label: 'ERP Development' },
      { value: 'LMS Development', label: 'LMS Development' },
    ]
  },
  {
    category: 'SEO Services',
    options: [
      { value: 'Website SEO', label: 'Website SEO' },
      { value: 'GMB SEO', label: 'GMB SEO' },
    ]
  },
  {
    category: 'Marketing Services',
    options: [
      { value: 'Social Media Marketing', label: 'Social Media Marketing' },
      { value: 'Ad Management', label: 'Ad Management' },
      { value: 'Social Media Account Management', label: 'Social Media Account Management' },
      { value: 'Meta Ads', label: 'Meta Ads' },
      { value: 'Google Ads', label: 'Google Ads' },
    ]
  },
  {
    category: 'Other',
    options: [
      { value: 'Other', label: 'Other (Specify)' }
    ]
  }
];

// Flattens all options for easier lookup
const ALL_OPTIONS = SERVICE_CATEGORIES.flatMap(c => c.options);

export const getServiceLabel = (value: string): string => {
  if (value.startsWith('Other: ')) {
    return value.substring(7); // Show "Custom App" instead of "Other: Custom App"
  }
  const match = ALL_OPTIONS.find(o => o.value === value);
  return match ? match.label : value;
};

interface MultiSelectProps {
  selectedValues: string[];
  onChange: (values: string[]) => void;
  customValue: string;
  onCustomChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  selectedValues,
  onChange,
  customValue,
  onCustomChange,
  label = "Interested Services",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== value));
  };

  // Filter options based on search query
  const filteredCategories = SERVICE_CATEGORIES.map(cat => {
    const filteredOptions = cat.options.filter(opt =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
    return {
      ...cat,
      options: filteredOptions
    };
  }).filter(cat => cat.options.length > 0);

  const isOtherSelected = selectedValues.includes('Other');

  return (
    <div className="space-y-2 text-left w-full font-sans" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Selector Container */}
      <div className="relative">
        <div
          onClick={handleToggle}
          className="min-h-[44px] w-full rounded-[8px] border border-slate-300 bg-white py-1.5 pl-3 pr-10 focus-within:ring-2 focus-within:ring-brand-purple/20 focus-within:border-brand-purple cursor-pointer flex flex-wrap gap-1.5 items-center transition-all duration-150 shadow-sm"
        >
          {selectedValues.length === 0 ? (
            <span className="text-xs text-slate-400 select-none">Select services of interest...</span>
          ) : (
            selectedValues.map(val => {
              const displayLabel = val === 'Other' && customValue.trim() ? `Other: ${customValue}` : getServiceLabel(val);
              return (
                <span
                  key={val}
                  className="inline-flex items-center bg-brand-purple/10 text-brand-purple border border-brand-purple/20 text-[11px] font-semibold px-2 py-0.5 rounded-[6px] transition-colors"
                >
                  <span>{displayLabel}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(val, e)}
                    className="ml-1 text-brand-purple hover:text-brand-purple-hover hover:bg-brand-purple/20 rounded p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })
          )}
        </div>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-[12px] shadow-xl py-1.5 max-h-64 overflow-y-auto flex flex-col">
            {/* Search Input */}
            <div className="px-3 pb-2 pt-1 border-b border-slate-100 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-6 top-3" />
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-7.5 pr-3 py-1.5 rounded-[6px] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple text-xs bg-slate-50/50"
              />
            </div>

            {/* Scrollable List */}
            <div className="overflow-y-auto flex-1 py-1">
              {filteredCategories.length === 0 ? (
                <div className="px-4 py-3 text-center text-xs text-slate-400">No matching services found</div>
              ) : (
                filteredCategories.map(cat => (
                  <div key={cat.category} className="space-y-0.5">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider select-none bg-slate-50/30">
                      {cat.category}
                    </div>
                    {cat.options.map(opt => {
                      const isSelected = selectedValues.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(opt.value)}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors hover:bg-slate-50 ${
                            isSelected ? 'bg-slate-50 font-semibold' : ''
                          }`}
                        >
                          <span className="text-slate-700">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-brand-purple" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Specify Other Field */}
      {isOtherSelected && (
        <div className="bg-slate-50/70 p-3 rounded-[8px] border border-slate-200 animate-slideDown space-y-1.5 mt-1.5">
          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Please specify service: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Type other service description..."
            className="w-full rounded-[6px] border border-slate-300 bg-white py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs text-slate-800"
            required
          />
        </div>
      )}
    </div>
  );
};
