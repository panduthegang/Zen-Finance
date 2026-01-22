import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';
import { Loader2, ChevronDown, Check } from 'lucide-react';

// --- Card ---
export const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "bg-white dark:bg-black rounded-xl p-6 border border-stone-100 dark:border-stone-800 transition-colors",
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-black dark:hover:bg-stone-300 border border-transparent",
      secondary: "bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800 border border-transparent",
      outline: "bg-transparent border border-stone-200 text-stone-900 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900",
      ghost: "hover:bg-stone-50 text-stone-600 dark:text-stone-400 dark:hover:bg-stone-900/50",
      danger: "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-transparent",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-11 px-5 py-2 text-sm",
      lg: "h-14 px-8 text-lg",
      icon: "h-10 w-10 p-2 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && <label className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-500">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-lg border border-stone-200 bg-transparent px-4 py-3 text-base placeholder:text-stone-400 transition-colors focus:outline-none focus:border-stone-900 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:text-stone-200 dark:focus:border-stone-100",
            error && "border-red-500 focus:border-red-500 dark:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

// --- Custom Select ---
interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const Select = ({ label, options, value, onChange, className, placeholder = "Select..." }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0, width: 0, maxHeight: 300 });

  // Update position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          // Calculate space below the button
          const spaceBelow = viewportHeight - rect.bottom - 16; // 16px buffer
          
          // Determine max height: use standard max of 300px, or whatever fits below.
          // Ensure at least 100px is available, otherwise user experience is bad.
          const calculatedMaxHeight = Math.max(100, Math.min(300, spaceBelow));

          setDropdownStyle({
            top: rect.bottom + 6,
            left: rect.left,
            width: rect.width,
            maxHeight: calculatedMaxHeight,
          });
        }
      };

      updatePosition();

      const handleScroll = (event: Event) => {
        // If the scroll event came from inside the dropdown (the dropdown itself scrolling), ignore it
        if (
            dropdownRef.current && 
            event.target instanceof Node && 
            dropdownRef.current.contains(event.target)
        ) {
            return;
        }
        // Otherwise, it's an outside scroll (window/parent), so close the dropdown to prevent detachment
        setIsOpen(false);
      };

      // Close on scroll (outside) or resize to prevent misalignment
      window.addEventListener('resize', () => setIsOpen(false));
      window.addEventListener('scroll', handleScroll, true); // capture phase to catch all scrolls

      return () => {
        window.removeEventListener('resize', () => setIsOpen(false));
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && <label className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-500">{label}</label>}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-12 w-full items-center justify-between rounded-lg border border-stone-200 bg-transparent px-4 py-3 text-base transition-colors hover:border-stone-400 focus:outline-none focus:border-stone-900 dark:border-stone-800 dark:text-stone-200 dark:hover:border-stone-600 dark:focus:border-stone-100"
        >
          <span className={cn("block truncate", !selectedOption && "text-stone-400")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={cn("h-4 w-4 text-stone-500 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        {createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop to handle clicks outside */}
                <div 
                    className="fixed inset-0 z-[9998] cursor-default bg-transparent" 
                    onClick={() => setIsOpen(false)} 
                />
                
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  style={{
                    top: dropdownStyle.top,
                    left: dropdownStyle.left,
                    width: dropdownStyle.width,
                    maxHeight: dropdownStyle.maxHeight,
                  }}
                  className="fixed z-[9999] overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-2xl dark:border-stone-800 dark:bg-stone-950 focus:outline-none"
                >
                  {options.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center py-3 pl-4 pr-9 text-base outline-none transition-colors",
                        option.value === value 
                          ? "bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-white font-medium" 
                          : "text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-900"
                      )}
                    >
                      <span className="block truncate">{option.label}</span>
                      {option.value === value && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-900 dark:text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  ))}
                  {options.length === 0 && (
                    <div className="py-2 px-3 text-sm text-stone-500">No options</div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  );
};

// --- Badge ---
export const Badge = ({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'outline' }) => {
  const variants = {
    default: "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300",
    outline: "border border-stone-200 text-stone-600 dark:border-stone-800 dark:text-stone-400 bg-transparent",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium", variants[variant], className)}>
      {children}
    </span>
  );
};

// --- Progress Bar ---
export const ProgressBar = ({ value, max }: { value: number; max: number }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-stone-900 dark:bg-stone-100"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
};