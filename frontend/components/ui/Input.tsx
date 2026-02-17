'use client';

import React, { forwardRef, useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, X, AlertCircle, Check } from 'lucide-react';

// Input Types
export type InputVariant = 'outline' | 'filled' | 'flushed' | 'unstyled';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputStatus = 'default' | 'success' | 'warning' | 'error';

// Input Props
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  variant?: InputVariant;
  size?: InputSize;
  status?: InputStatus;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  isFullWidth?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  showPasswordToggle?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  labelClassName?: string;
}

// Variant Styles
const variantStyles: Record<InputVariant, string> = {
  outline: `
    border border-neutral-300 dark:border-neutral-600
    bg-white dark:bg-neutral-900
    focus:border-primary-500 dark:focus:border-primary-400
    focus:ring-primary-500/20
  `,
  filled: `
    border border-transparent
    bg-neutral-100 dark:bg-neutral-800
    focus:bg-white dark:focus:bg-neutral-900
    focus:border-primary-500 dark:focus:border-primary-400
    focus:ring-primary-500/20
  `,
  flushed: `
    border-b-2 border-neutral-300 dark:border-neutral-600
    bg-transparent rounded-none
    focus:border-primary-500 dark:focus:border-primary-400
    px-0
  `,
  unstyled: `
    bg-transparent border-none
    focus:ring-0
  `,
};

// Size Styles
const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-base rounded-lg',
  lg: 'h-12 px-5 text-lg rounded-xl',
};

// Status Styles
const statusStyles: Record<InputStatus, { border: string; focus: string; text: string }> = {
  default: {
    border: '',
    focus: '',
    text: '',
  },
  success: {
    border: 'border-success-500 dark:border-success-400',
    focus: 'focus:border-success-500 focus:ring-success-500/20',
    text: 'text-success-600 dark:text-success-400',
  },
  warning: {
    border: 'border-warning-500 dark:border-warning-400',
    focus: 'focus:border-warning-500 focus:ring-warning-500/20',
    text: 'text-warning-600 dark:text-warning-400',
  },
  error: {
    border: 'border-error-500 dark:border-error-400',
    focus: 'focus:border-error-500 focus:ring-error-500/20',
    text: 'text-error-600 dark:text-error-400',
  },
};

// Input Component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      warning,
      helperText,
      variant = 'outline',
      size = 'md',
      status = 'default',
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      isFullWidth = true,
      isDisabled = false,
      isReadOnly = false,
      isRequired = false,
      showPasswordToggle = false,
      clearable = false,
      onClear,
      containerClassName,
      labelClassName,
      className,
      id,
      type,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Determine status from props
    const computedStatus: InputStatus = error ? 'error' : success ? 'success' : warning ? 'warning' : status;
    const currentStatus = statusStyles[computedStatus];

    // Get feedback message
    const feedbackMessage = error || success || warning;
    const feedbackType = error ? 'error' : success ? 'success' : warning ? 'warning' : null;

    // Check if password type
    const isPasswordType = type === 'password';
    const inputType = isPasswordType && showPassword ? 'text' : type;

    // Handle clear button
    const showClearButton = clearable && value && !isDisabled && !isReadOnly;

    return (
      <div
        className={cn(
          'relative',
          isFullWidth ? 'w-full' : 'inline-block',
          containerClassName
        )}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5 transition-colors',
              'text-neutral-700 dark:text-neutral-300',
              isDisabled && 'text-neutral-400 dark:text-neutral-500 cursor-not-allowed',
              isFocused && 'text-primary-600 dark:text-primary-400',
              labelClassName
            )}
          >
            {label}
            {isRequired && (
              <span className="text-error-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Group */}
        <div className="relative flex">
          {/* Left Addon */}
          {leftAddon && (
            <div
              className={cn(
                'flex items-center px-3 text-sm',
                'bg-neutral-100 dark:bg-neutral-800',
                'border border-r-0 border-neutral-300 dark:border-neutral-600',
                'rounded-l-lg',
                sizeStyles[size].includes('h-8') && 'h-8',
                sizeStyles[size].includes('h-10') && 'h-10',
                sizeStyles[size].includes('h-12') && 'h-12'
              )}
            >
              {leftAddon}
            </div>
          )}

          {/* Input Container */}
          <div className="relative flex-1">
            {/* Left Icon */}
            {leftIcon && (
              <div
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 pl-3 pointer-events-none',
                  'text-neutral-400 dark:text-neutral-500',
                  isFocused && 'text-primary-500 dark:text-primary-400',
                  currentStatus.text
                )}
              >
                {leftIcon}
              </div>
            )}

            {/* Input Element */}
            <input
              ref={ref}
              id={inputId}
              type={inputType}
              value={value}
              disabled={isDisabled}
              readOnly={isReadOnly}
              required={isRequired}
              className={cn(
                // Base styles
                'w-full text-neutral-900 dark:text-neutral-100',
                'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                'focus:outline-none focus:ring-2',
                'transition-all duration-150',
                
                // Variant styles
                variantStyles[variant],
                
                // Size styles
                sizeStyles[size],
                
                // Status styles
                computedStatus !== 'default' && currentStatus.border,
                computedStatus !== 'default' && currentStatus.focus,
                
                // Disabled styles
                isDisabled && 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-800',
                
                // Read only styles
                isReadOnly && 'cursor-default bg-neutral-50 dark:bg-neutral-800',
                
                // Icon padding
                leftIcon && 'pl-10',
                (rightIcon || showPasswordToggle || showClearButton) && 'pr-10',
                
                // Addon border radius
                leftAddon && 'rounded-l-none',
                rightAddon && 'rounded-r-none',
                
                // Flushed variant overrides
                variant === 'flushed' && 'px-0 rounded-none',
                
                className
              )}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              aria-invalid={computedStatus === 'error'}
              aria-describedby={
                feedbackMessage ? `${inputId}-feedback` : helperText ? `${inputId}-helper` : undefined
              }
              {...props}
            />

            {/* Right Icons Container */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-3 flex items-center gap-1">
              {/* Clear Button */}
              {showClearButton && (
                <button
                  type="button"
                  onClick={onClear}
                  className={cn(
                    'p-0.5 rounded-full',
                    'text-neutral-400 hover:text-neutral-600',
                    'dark:text-neutral-500 dark:hover:text-neutral-300',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    'transition-colors'
                  )}
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Password Toggle */}
              {isPasswordType && showPasswordToggle && !isDisabled && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'p-0.5 rounded',
                    'text-neutral-400 hover:text-neutral-600',
                    'dark:text-neutral-500 dark:hover:text-neutral-300',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    'transition-colors'
                  )}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Status Icon */}
              {computedStatus !== 'default' && !showPasswordToggle && !showClearButton && (
                <div className={cn('pointer-events-none', currentStatus.text)}>
                  {computedStatus === 'error' && <AlertCircle className="w-4 h-4" />}
                  {computedStatus === 'success' && <Check className="w-4 h-4" />}
                </div>
              )}

              {/* Custom Right Icon */}
              {rightIcon && !showPasswordToggle && !showClearButton && (
                <div
                  className={cn(
                    'pointer-events-none',
                    'text-neutral-400 dark:text-neutral-500',
                    isFocused && 'text-primary-500 dark:text-primary-400'
                  )}
                >
                  {rightIcon}
                </div>
              )}
            </div>
          </div>

          {/* Right Addon */}
          {rightAddon && (
            <div
              className={cn(
                'flex items-center px-3 text-sm',
                'bg-neutral-100 dark:bg-neutral-800',
                'border border-l-0 border-neutral-300 dark:border-neutral-600',
                'rounded-r-lg',
                sizeStyles[size].includes('h-8') && 'h-8',
                sizeStyles[size].includes('h-10') && 'h-10',
                sizeStyles[size].includes('h-12') && 'h-12'
              )}
            >
              {rightAddon}
            </div>
          )}
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <p
            id={`${inputId}-feedback`}
            className={cn(
              'mt-1.5 text-sm flex items-center gap-1',
              feedbackType === 'error' && 'text-error-600 dark:text-error-400',
              feedbackType === 'success' && 'text-success-600 dark:text-success-400',
              feedbackType === 'warning' && 'text-warning-600 dark:text-warning-400'
            )}
            role={feedbackType === 'error' ? 'alert' : undefined}
          >
            {feedbackType === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
            {feedbackType === 'success' && <Check className="w-3.5 h-3.5" />}
            {feedbackMessage}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !feedbackMessage && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  variant?: InputVariant;
  status?: InputStatus;
  isFullWidth?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  containerClassName?: string;
  labelClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      success,
      warning,
      helperText,
      variant = 'outline',
      status = 'default',
      isFullWidth = true,
      isDisabled = false,
      isReadOnly = false,
      isRequired = false,
      resize = 'vertical',
      containerClassName,
      labelClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [isFocused, setIsFocused] = useState(false);

    const computedStatus: InputStatus = error ? 'error' : success ? 'success' : warning ? 'warning' : status;
    const currentStatus = statusStyles[computedStatus];
    const feedbackMessage = error || success || warning;
    const feedbackType = error ? 'error' : success ? 'success' : warning ? 'warning' : null;

    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div
        className={cn(
          'relative',
          isFullWidth ? 'w-full' : 'inline-block',
          containerClassName
        )}
      >
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5 transition-colors',
              'text-neutral-700 dark:text-neutral-300',
              isDisabled && 'text-neutral-400 dark:text-neutral-500 cursor-not-allowed',
              isFocused && 'text-primary-600 dark:text-primary-400',
              labelClassName
            )}
          >
            {label}
            {isRequired && (
              <span className="text-error-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          className={cn(
            'w-full px-4 py-2.5 text-base rounded-lg',
            'text-neutral-900 dark:text-neutral-100',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'focus:outline-none focus:ring-2',
            'transition-all duration-150',
            variantStyles[variant],
            computedStatus !== 'default' && currentStatus.border,
            computedStatus !== 'default' && currentStatus.focus,
            isDisabled && 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-800',
            isReadOnly && 'cursor-default bg-neutral-50 dark:bg-neutral-800',
            resizeStyles[resize],
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          aria-invalid={computedStatus === 'error'}
          aria-describedby={
            feedbackMessage ? `${inputId}-feedback` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />

        {feedbackMessage && (
          <p
            id={`${inputId}-feedback`}
            className={cn(
              'mt-1.5 text-sm flex items-center gap-1',
              feedbackType === 'error' && 'text-error-600 dark:text-error-400',
              feedbackType === 'success' && 'text-success-600 dark:text-success-400',
              feedbackType === 'warning' && 'text-warning-600 dark:text-warning-400'
            )}
            role={feedbackType === 'error' ? 'alert' : undefined}
          >
            {feedbackMessage}
          </p>
        )}

        {helperText && !feedbackMessage && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Input Group Component
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  children,
  label,
  error,
  helperText,
  isRequired,
  className,
  id,
}) => {
  const generatedId = useId();
  const groupId = id || generatedId;

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          htmlFor={groupId}
          className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300"
        >
          {label}
          {isRequired && (
            <span className="text-error-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="flex">{children}</div>
      {error && (
        <p className="mt-1.5 text-sm text-error-600 dark:text-error-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}
    </div>
  );
};

InputGroup.displayName = 'InputGroup';

export default Input;
