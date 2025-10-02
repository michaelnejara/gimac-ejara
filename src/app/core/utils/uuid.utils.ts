/**
 * ===============================================
 * AUTHENTICATION SYSTEM - COMPLETE SETUP
 * Progressive implementation with IP Geolocation
 * ===============================================
 */

/**
 * UUID v4 Generator Utility
 * Generates RFC4122 version 4 compliant UUIDs
 */
export class UuidUtils {
  /**
   * Generate a UUID v4
   * @returns {string} A unique UUID v4 string
   * @example
   * const deviceId = UuidUtils.v4();
   * // Returns: "d4ae99a8-ebe9-4502-82a6-5cff200f1e68"
   */
  static v4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Validate if a string is a valid UUID v4
   * @param {string} uuid - The UUID string to validate
   * @returns {boolean} True if valid UUID v4
   */
  static isValid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}