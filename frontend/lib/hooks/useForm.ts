'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// Types
export type ValidationRule<T = unknown> = {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: (value: T) => boolean | string;
  custom?: (value: T, formData: Record<string, unknown>) => boolean | string;
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;
export type FormRules<T> = Partial<Record<keyof T, ValidationRule<unknown>>>;

export interface UseFormOptions<T> {
  defaultValues: T;
  rules?: FormRules<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSubmit?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  isValidating: boolean;

  // Handlers
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>;

  // Actions
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: FormErrors<T>) => void;
  clearError: (field: keyof T) => void;
  clearErrors: (fields?: (keyof T)[]) => void;
  setTouched: (field: keyof T, isTouched?: boolean) => void;
  reset: (values?: Partial<T>) => void;
  resetField: (field: keyof T) => void;
  validate: () => Promise<boolean>;
  validateField: (field: keyof T) => Promise<string | null>;

  // Helpers
  getFieldProps: (field: keyof T) => {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    error?: string;
    touched: boolean;
  };
  getFieldValue: (field: keyof T) => T[keyof T];
  getError: (field: keyof T) => string | undefined;
  isTouched: (field: keyof T) => boolean;
}

// Validation Functions
const validateRequired = (value: unknown, message: string): string | null => {
  if (value === undefined || value === null || value === '') {
    return message;
  }
  if (Array.isArray(value) && value.length === 0) {
    return message;
  }
  return null;
};

const validateMinLength = (value: string, min: number, message: string): string | null => {
  if (typeof value === 'string' && value.length < min) {
    return message;
  }
  return null;
};

const validateMaxLength = (value: string, max: number, message: string): string | null => {
  if (typeof value === 'string' && value.length > max) {
    return message;
  }
  return null;
};

const validateMin = (value: number, min: number, message: string): string | null => {
  if (typeof value === 'number' && value < min) {
    return message;
  }
  return null;
};

const validateMax = (value: number, max: number, message: string): string | null => {
  if (typeof value === 'number' && value > max) {
    return message;
  }
  return null;
};

const validatePattern = (value: string, pattern: RegExp, message: string): string | null => {
  if (typeof value === 'string' && !pattern.test(value)) {
    return message;
  }
  return null;
};

// Main Hook
export function useForm<T extends Record<string, unknown>>({
  defaultValues,
  rules = {},
  validateOnChange = true,
  validateOnBlur = true,
  validateOnSubmit = true,
  resetOnSubmit = false,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(defaultValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouchedState] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const defaultValuesRef = useRef(defaultValues);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(defaultValuesRef.current);
  }, [values]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Validate a single field
  const validateFieldValue = useCallback(async (
    field: keyof T,
    value: unknown,
    formData: T
  ): Promise<string | null> => {
    const rule = rules[field] as ValidationRule | undefined;
    if (!rule) return null;

    // Required
    if (rule.required) {
      const message = typeof rule.required === 'string' ? rule.required : 'This field is required';
      const error = validateRequired(value, message);
      if (error) return error;
    }

    // Min Length
    if (rule.minLength !== undefined) {
      const minLen = typeof rule.minLength === 'number' ? rule.minLength : rule.minLength.value;
      const message = typeof rule.minLength === 'number' 
        ? `Minimum length is ${minLen}` 
        : rule.minLength.message;
      const error = validateMinLength(value as string, minLen, message);
      if (error) return error;
    }

    // Max Length
    if (rule.maxLength !== undefined) {
      const maxLen = typeof rule.maxLength === 'number' ? rule.maxLength : rule.maxLength.value;
      const message = typeof rule.maxLength === 'number' 
        ? `Maximum length is ${maxLen}` 
        : rule.maxLength.message;
      const error = validateMaxLength(value as string, maxLen, message);
      if (error) return error;
    }

    // Min
    if (rule.min !== undefined) {
      const minVal = typeof rule.min === 'number' ? rule.min : rule.min.value;
      const message = typeof rule.min === 'number' 
        ? `Minimum value is ${minVal}` 
        : rule.min.message;
      const error = validateMin(value as number, minVal, message);
      if (error) return error;
    }

    // Max
    if (rule.max !== undefined) {
      const maxVal = typeof rule.max === 'number' ? rule.max : rule.max.value;
      const message = typeof rule.max === 'number' 
        ? `Maximum value is ${maxVal}` 
        : rule.max.message;
      const error = validateMax(value as number, maxVal, message);
      if (error) return error;
    }

    // Pattern
    if (rule.pattern !== undefined) {
      const pattern = rule.pattern instanceof RegExp ? rule.pattern : rule.pattern.value;
      const message = rule.pattern instanceof RegExp 
        ? 'Invalid format' 
        : rule.pattern.message;
      const error = validatePattern(value as string, pattern, message);
      if (error) return error;
    }

    // Custom validate function
    if (rule.validate) {
      const result = rule.validate(value);
      if (typeof result === 'string') return result;
      if (result === false) return 'Invalid value';
    }

    // Custom validation with form data
    if (rule.custom) {
      const result = rule.custom(value, formData as Record<string, unknown>);
      if (typeof result === 'string') return result;
      if (result === false) return 'Invalid value';
    }

    return null;
  }, [rules]);

  // Validate all fields
  const validate = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    const newErrors: FormErrors<T> = {};

    for (const field of Object.keys(rules) as (keyof T)[]) {
      const error = await validateFieldValue(field, values[field], values);
      if (error) {
        newErrors[field] = error;
      }
    }

    setErrorsState(newErrors);
    setIsValidating(false);
    return Object.keys(newErrors).length === 0;
  }, [rules, values, validateFieldValue]);

  // Validate single field
  const validateField = useCallback(async (field: keyof T): Promise<string | null> => {
    const error = await validateFieldValue(field, values[field], values);
    if (error) {
      setErrorsState((prev) => ({ ...prev, [field]: error }));
    } else {
      setErrorsState((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    return error;
  }, [values, validateFieldValue]);

  // Handle change
  const handleChange = useCallback((field: keyof T) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value, type, checked } = e.target as HTMLInputElement;
      const newValue = type === 'checkbox' ? checked : value;

      setValuesState((prev) => ({ ...prev, [field]: newValue }));

      if (validateOnChange && touched[field]) {
        validateField(field);
      }
    }, [validateOnChange, touched, validateField]);

  // Handle blur
  const handleBlur = useCallback((field: keyof T) => () => {
    setTouchedState((prev) => ({ ...prev, [field]: true }));

    if (validateOnBlur) {
      validateField(field);
    }
  }, [validateOnBlur, validateField]);

  // Handle submit
  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<void> | void) => 
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Mark all fields as touched
      const allTouched = Object.keys(rules).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as FormTouched<T>);
      setTouchedState(allTouched);

      // Validate
      let isFormValid = true;
      if (validateOnSubmit) {
        isFormValid = await validate();
      }

      if (isFormValid) {
        try {
          await onSubmit(values);
          if (resetOnSubmit) {
            reset();
          }
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    }, [rules, validateOnSubmit, validate, values, resetOnSubmit]);

  // Set value
  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Set error
  const setError = useCallback((field: keyof T, error: string) => {
    setErrorsState((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrorsState(newErrors);
  }, []);

  // Clear error
  const clearError = useCallback((field: keyof T) => {
    setErrorsState((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Clear multiple errors
  const clearErrors = useCallback((fields?: (keyof T)[]) => {
    if (!fields) {
      setErrorsState({});
    } else {
      setErrorsState((prev) => {
        const newErrors = { ...prev };
        fields.forEach((field) => delete newErrors[field]);
        return newErrors;
      });
    }
  }, []);

  // Set touched
  const setTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouchedState((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  // Reset form
  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues 
      ? { ...defaultValuesRef.current, ...newValues } 
      : defaultValuesRef.current;
    setValuesState(resetValues);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);
  }, []);

  // Reset field
  const resetField = useCallback((field: keyof T) => {
    setValuesState((prev) => ({ ...prev, [field]: defaultValuesRef.current[field] }));
    setErrorsState((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setTouchedState((prev) => {
      const newTouched = { ...prev };
      delete newTouched[field];
      return newTouched;
    });
  }, []);

  // Get field props
  const getFieldProps = useCallback((field: keyof T) => ({
    name: String(field),
    value: String(values[field] ?? ''),
    onChange: handleChange(field),
    onBlur: handleBlur(field),
    error: errors[field],
    touched: !!touched[field],
  }), [values, errors, touched, handleChange, handleBlur]);

  // Get field value
  const getFieldValue = useCallback((field: keyof T) => values[field], [values]);

  // Get error
  const getError = useCallback((field: keyof T) => errors[field], [errors]);

  // Is touched
  const isTouched = useCallback((field: keyof T) => !!touched[field], [touched]);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    isValidating,

    handleChange,
    handleBlur,
    handleSubmit,

    setValue,
    setValues,
    setError,
    setErrors,
    clearError,
    clearErrors,
    setTouched,
    reset,
    resetField,
    validate,
    validateField,

    getFieldProps,
    getFieldValue,
    getError,
    isTouched,
  };
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  ip: /^(\d{1,3}\.){3}\d{1,3}$/,
  ipv6: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  mac: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// Common validation rules
export const commonRules = {
  email: {
    required: 'Email is required',
    pattern: { value: patterns.email, message: 'Invalid email address' },
  },
  password: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Password must be at least 8 characters' },
    pattern: {
      value: patterns.password,
      message: 'Password must contain uppercase, lowercase, and number',
    },
  },
  confirmPassword: (passwordField: string = 'password'): ValidationRule => ({
    required: 'Please confirm your password',
    custom: (value: unknown, formData: Record<string, unknown>) => 
      value === formData[passwordField] || 'Passwords do not match',
  }),
  required: (message: string = 'This field is required'): ValidationRule => ({
    required: message,
  }),
  phone: {
    required: 'Phone number is required',
    pattern: { value: patterns.phone, message: 'Invalid phone number' },
  },
  url: {
    pattern: { value: patterns.url, message: 'Invalid URL' },
  },
  ip: {
    pattern: { value: patterns.ip, message: 'Invalid IP address' },
  },
  mac: {
    pattern: { value: patterns.mac, message: 'Invalid MAC address' },
  },
  username: {
    required: 'Username is required',
    pattern: { value: patterns.username, message: 'Username must be 3-20 characters, letters, numbers, and underscores only' },
  },
};

// useFieldArray Hook
export interface UseFieldArrayOptions {
  name: string;
  defaultValue?: unknown;
}

export interface UseFieldArrayReturn<T> {
  fields: T[];
  append: (value: T) => void;
  prepend: (value: T) => void;
  insert: (index: number, value: T) => void;
  remove: (index: number) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  replace: (values: T[]) => void;
  update: (index: number, value: T) => void;
}

export function useFieldArray<T>({
  name,
  defaultValue = {},
}: UseFieldArrayOptions): UseFieldArrayReturn<T> {
  const [fields, setFields] = useState<T[]>([]);

  const append = useCallback((value: T) => {
    setFields((prev) => [...prev, value]);
  }, []);

  const prepend = useCallback((value: T) => {
    setFields((prev) => [value, ...prev]);
  }, []);

  const insert = useCallback((index: number, value: T) => {
    setFields((prev) => {
      const newFields = [...prev];
      newFields.splice(index, 0, value);
      return newFields;
    });
  }, []);

  const remove = useCallback((index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const swap = useCallback((indexA: number, indexB: number) => {
    setFields((prev) => {
      const newFields = [...prev];
      [newFields[indexA], newFields[indexB]] = [newFields[indexB], newFields[indexA]];
      return newFields;
    });
  }, []);

  const move = useCallback((from: number, to: number) => {
    setFields((prev) => {
      const newFields = [...prev];
      const [removed] = newFields.splice(from, 1);
      newFields.splice(to, 0, removed);
      return newFields;
    });
  }, []);

  const replace = useCallback((values: T[]) => {
    setFields(values);
  }, []);

  const update = useCallback((index: number, value: T) => {
    setFields((prev) => {
      const newFields = [...prev];
      newFields[index] = value;
      return newFields;
    });
  }, []);

  return {
    fields,
    append,
    prepend,
    insert,
    remove,
    swap,
    move,
    replace,
    update,
  };
}

export default useForm;