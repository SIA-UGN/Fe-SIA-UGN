'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CustomUGNSelectOption {
  label: string;
  value: string;
}

interface CustomUGNSelectProps {
  label?: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  options: CustomUGNSelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export default function CustomUGNSelect({
  label = 'Semua kategori',
  required = true,
  value,
  placeholder = 'Pilih Tujuan',
  options,
  onChange,
  className = '',
}: CustomUGNSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`} style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {label && (
        <label className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-[#015023]">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-left flex items-center justify-between outline-none transition focus:ring-2 focus:ring-[#16874B]/10 focus:border-[#16874B]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'text-gray-700 text-sm' : 'text-gray-400 text-sm'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border-2 border-[#015023] bg-white shadow-lg overflow-hidden">
          <ul role="listbox" className="py-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm text-[#015023] transition ${
                      isSelected ? 'bg-[#E6F4EA] font-medium' : 'hover:bg-[#E6F4EA]'
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
