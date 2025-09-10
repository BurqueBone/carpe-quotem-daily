import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
}

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  blocked: boolean;
}

export const useSecurityValidation = () => {
  const { toast } = useToast();
  const [rateLimits, setRateLimits] = useState<Map<string, RateLimitState>>(new Map());

  const validateEmail = (email: string): SecurityValidationResult => {
    const errors: string[] = [];
    
    // Enhanced email validation beyond HTML5 basic
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    } else if (email.length > 254) {
      errors.push('Email address is too long');
    }
    
    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      errors.push('Email format is invalid');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validatePassword = (password: string): SecurityValidationResult => {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
      if (password.length > 128) {
        errors.push('Password is too long (maximum 128 characters)');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const checkRateLimit = (identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean => {
    const now = Date.now();
    const current = rateLimits.get(identifier);
    
    if (!current) {
      setRateLimits(prev => new Map(prev.set(identifier, {
        attempts: 1,
        lastAttempt: now,
        blocked: false
      })));
      return true;
    }
    
    // Reset if window has passed
    if (now - current.lastAttempt > windowMs) {
      setRateLimits(prev => new Map(prev.set(identifier, {
        attempts: 1,
        lastAttempt: now,
        blocked: false
      })));
      return true;
    }
    
    // Check if already blocked
    if (current.blocked && now - current.lastAttempt < windowMs) {
      toast({
        title: 'Too many attempts',
        description: `Please wait before trying again (${Math.ceil((windowMs - (now - current.lastAttempt)) / 60000)} minutes remaining)`,
        variant: 'destructive',
      });
      return false;
    }
    
    // Increment attempts
    const newAttempts = current.attempts + 1;
    const isBlocked = newAttempts >= maxAttempts;
    
    setRateLimits(prev => new Map(prev.set(identifier, {
      attempts: newAttempts,
      lastAttempt: now,
      blocked: isBlocked
    })));
    
    if (isBlocked) {
      toast({
        title: 'Too many attempts',
        description: 'You have exceeded the maximum number of attempts. Please wait 15 minutes before trying again.',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  const sanitizeInput = (input: string): string => {
    // Robust XSS prevention - strip tags and neutralize common vectors
    return input
      .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script>/gi, '') // remove script blocks
      .replace(/[<>]/g, '') // remove angle brackets
      .replace(/javascript:/gi, '') // remove javascript: protocol
      .replace(/on\w+\s*=\s*/gi, '') // remove inline event handlers
      .replace(/url\((.*?)\)/gi, 'url()') // neutralize css url()
      .replace(/['"`]/g, '') // strip quotes that can break attributes
      .trim();
  };

  return {
    validateEmail,
    validatePassword,
    checkRateLimit,
    sanitizeInput,
  };
};