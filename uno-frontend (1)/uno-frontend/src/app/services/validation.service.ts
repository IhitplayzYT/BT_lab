import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  // Sanitize input to prevent XSS
  sanitize(input: string): string {
    if (!input) return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Remove HTML tags
  stripHtml(input: string): string {
    if (!input) return '';
    return input.replace(/<[^>]*>/g, '');
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Validate phone number (10 digits for India)
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  // Validate PAN number (Indian format)
  isValidPan(pan: string): boolean {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  }

  // Validate IFSC code
  isValidIfsc(ifsc: string): boolean {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc.toUpperCase());
  }

  // Validate bank account number (9-18 digits)
  isValidAccountNumber(account: string): boolean {
    const accountRegex = /^\d{9,18}$/;
    return accountRegex.test(account);
  }

  // Validate name (letters, spaces, dots only)
  isValidName(name: string): boolean {
    const nameRegex = /^[a-zA-Z\s.]{2,50}$/;
    return nameRegex.test(name);
  }

  // Validate username (alphanumeric, underscore, hyphen)
  isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  }

  // Validate password strength
  getPasswordStrength(password: string): { score: number; requirements: any } {
    const requirements = {
      length: password.length >= 8,
      alphabet: /[a-zA-Z]/.test(password),
      numeric: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    return { score: metRequirements, requirements };
  }

  // Validate numeric input
  isValidNumber(input: any): boolean {
    return !isNaN(input) && input !== null && input !== '';
  }

  // Validate positive number
  isValidPositiveNumber(input: any): boolean {
    return this.isValidNumber(input) && Number(input) > 0;
  }

  // Validate number range
  isValidNumberRange(input: any, min: number, max: number): boolean {
    const num = Number(input);
    return this.isValidNumber(input) && num >= min && num <= max;
  }

  // Validate text length
  isValidLength(input: string, min: number, max: number): boolean {
    return input.length >= min && input.length <= max;
  }

  // Trim and sanitize input
  cleanInput(input: string): string {
    if (!input) return '';
    return this.sanitize(input.trim());
  }

  // Validate and clean name
  validateAndCleanName(input: string): { valid: boolean; cleaned: string; error?: string } {
    const cleaned = this.cleanInput(input);
    if (!cleaned) {
      return { valid: false, cleaned: '', error: 'Name is required' };
    }
    if (!this.isValidName(cleaned)) {
      return { valid: false, cleaned, error: 'Name must contain only letters and spaces (2-50 characters)' };
    }
    return { valid: true, cleaned };
  }

  // Validate and clean email
  validateAndCleanEmail(input: string): { valid: boolean; cleaned: string; error?: string } {
    const cleaned = this.cleanInput(input.toLowerCase());
    if (!cleaned) {
      return { valid: false, cleaned: '', error: 'Email is required' };
    }
    if (!this.isValidEmail(cleaned)) {
      return { valid: false, cleaned, error: 'Please enter a valid email address' };
    }
    return { valid: true, cleaned };
  }

  // Validate and clean phone
  validateAndCleanPhone(input: string): { valid: boolean; cleaned: string; error?: string } {
    const cleaned = this.cleanInput(input.replace(/\D/g, '')); // Remove non-digits
    if (!cleaned) {
      return { valid: false, cleaned: '', error: 'Phone number is required' };
    }
    if (!this.isValidPhone(cleaned)) {
      return { valid: false, cleaned, error: 'Please enter a valid 10-digit phone number' };
    }
    return { valid: true, cleaned };
  }

  // Validate and clean PAN
  validateAndCleanPan(input: string): { valid: boolean; cleaned: string; error?: string } {
    const cleaned = this.cleanInput(input.toUpperCase().replace(/\s/g, ''));
    if (!cleaned) {
      return { valid: false, cleaned: '', error: 'PAN number is required' };
    }
    if (!this.isValidPan(cleaned)) {
      return { valid: false, cleaned, error: 'Please enter a valid PAN number (e.g., ABCDE1234F)' };
    }
    return { valid: true, cleaned };
  }

  // Validate and clean IFSC
  validateAndCleanIfsc(input: string): { valid: boolean; cleaned: string; error?: string } {
    const cleaned = this.cleanInput(input.toUpperCase().replace(/\s/g, ''));
    if (!cleaned) {
      return { valid: false, cleaned: '', error: 'IFSC code is required' };
    }
    if (!this.isValidIfsc(cleaned)) {
      return { valid: false, cleaned, error: 'Please enter a valid IFSC code (e.g., SBIN0001234)' };
    }
    return { valid: true, cleaned };
  }

  // Validate and clean account number
  validateAndCleanAccountNumber(input: string): { valid: boolean; cleaned: string; error?: string } {
    const cleaned = this.cleanInput(input.replace(/\D/g, ''));
    if (!cleaned) {
      return { valid: false, cleaned: '', error: 'Account number is required' };
    }
    if (!this.isValidAccountNumber(cleaned)) {
      return { valid: false, cleaned, error: 'Account number must be 9-18 digits' };
    }
    return { valid: true, cleaned };
  }

  // Validate and clean username
  validateAndCleanUsername(input: string): { valid: boolean; cleaned: string; error?: string } {
    const cleaned = this.cleanInput(input);
    if (!cleaned) {
      return { valid: false, cleaned: '', error: 'Username is required' };
    }
    if (!this.isValidUsername(cleaned)) {
      return { valid: false, cleaned, error: 'Username must be 3-20 characters (letters, numbers, underscore, hyphen)' };
    }
    return { valid: true, cleaned };
  }
}
