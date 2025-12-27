import { Injectable } from '@angular/core';

/**
 * Storage Service
 * Provides type-safe access to localStorage and sessionStorage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   */
  setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
    }
  }

  /**
   * Get item from sessionStorage
   * @param {string} key - Storage key
   * @returns {T | null} Parsed value or null
   */
  getLocal<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key) || localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  removeLocal(key: string): void {
    try {
       localStorage.removeItem(key);
       sessionStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
    }
  }

  /**
   * Set item in sessionStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   */
  setSession<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set sessionStorage item:', error);
    }
  }

  /**
   * Get item from sessionStorage
   * @param {string} key - Storage key
   * @returns {T | null} Parsed value or null
   */
  getSession<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get sessionStorage item:', error);
      return null;
    }
  }

  /**
   * Remove item from sessionStorage
   * @param {string} key - Storage key
   */
  removeSession(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove sessionStorage item:', error);
    }
  }

  /**
   * Clear all localStorage items
   */
  clearLocal(): void {
    try {
      localStorage.clear();
      sessionStorage.clear()
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * Clear all sessionStorage items
   */
  clearSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }
}