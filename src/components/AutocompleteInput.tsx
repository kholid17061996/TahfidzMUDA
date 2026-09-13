'use client'

import React, { useState, useEffect, useRef } from 'react'

interface AutocompleteInputProps {
  value: string
  onChange: (val: string) => void
  options: string[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder = '',
  className = '',
  disabled = false
}: AutocompleteInputProps) {
  const [suggestion, setSuggestion] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter options based on input
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase())
  )

  useEffect(() => {
    if (!value) {
      setSuggestion('')
      return
    }

    const lowerValue = value.toLowerCase()
    const match = options.find(opt => opt && typeof opt === 'string' && opt.toLowerCase().startsWith(lowerValue))
    
    if (match) {
      // Keep the user's typed case for the matched part, and use the option's original case for the rest
      const ghost = value + match.slice(value.length)
      setSuggestion(ghost)
    } else {
      setSuggestion('')
    }
  }, [value, options])

  useEffect(() => {
    // Click outside to close dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'Enter') && suggestion && suggestion !== value) {
      e.preventDefault()
      onChange(suggestion)
      setIsOpen(false)
    }
  }

  const handleBlur = () => {
    // Di HP, menekan 'Next' sering kali tidak mengirimkan e.key = 'Enter', 
    // melainkan langsung memindahkan fokus (blur). 
    // Jadi saat kehilangan fokus, jika ada suggestion, kita otomatis lengkapi.
    if (suggestion && suggestion !== value) {
      onChange(suggestion)
    }
  }

  const handleOptionClick = (opt: string) => {
    onChange(opt)
    setIsOpen(false)
  }

  // Combine standard classes with custom ones
  const baseWrapperClass = "relative flex flex-col w-full"
  
  return (
    <div className={baseWrapperClass}>
      <div className="relative flex items-center w-full">
        {/* Ghost Text Input (Bottom Layer) */}
        <input
          type="text"
          readOnly
          tabIndex={-1}
          value={suggestion}
          className={`absolute inset-0 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none font-bold text-left pointer-events-none ${className}`}
          style={{ color: suggestion ? '#9ca3af' : 'transparent', backgroundColor: '#f9fafb' }} // gray-400 for text, gray-50 for bg
        />
        
        {/* Real Input (Top Layer) */}
        <input
          ref={inputRef}
          type="text"
          required
          disabled={disabled}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`relative z-10 w-full px-5 py-3.5 bg-transparent border border-transparent focus:border-emas focus:ring-2 focus:ring-emas rounded-2xl outline-none transition-all placeholder:text-gray-400 font-bold text-left disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        />
        
        {/* Dropdown Toggle Arrow (Optional visual cue) */}
        <div 
          className="absolute right-4 z-20 cursor-pointer text-gray-400"
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen)
              inputRef.current?.focus()
            }
          }}
        >
          <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto py-2 outline-none ring-1 ring-black ring-opacity-5"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <div
                key={index}
                onClick={() => handleOptionClick(opt)}
                className={`px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${value === opt ? 'bg-amber-50 text-amber-900 font-bold' : 'text-gray-700 font-medium'}`}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-5 py-3 text-gray-400 text-sm italic">
              Tidak ada santri yang cocok
            </div>
          )}
        </div>
      )}
    </div>
  )
}
