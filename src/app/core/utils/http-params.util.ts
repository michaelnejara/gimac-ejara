import { HttpParams } from '@angular/common/http';

/**
 * HTTP Params Utility
 * 
 * Provides helper functions for building HttpParams from objects
 */

/**
 * Build HttpParams from an object
 * Automatically filters out null, undefined, and empty string values
 * Converts numbers to strings
 * 
 * @param obj - Object with key-value pairs to convert to HttpParams
 * @returns HttpParams object ready for HTTP requests
 * 
 * @example
 * ```typescript
 * const params = buildHttpParams({
 *   status: 'completed',
 *   pageNumber: 1,
 *   limit: 20,
 *   keyword: undefined // will be filtered out
 * });
 * // Results in: ?status=completed&pageNumber=1&limit=20
 * ```
 */
export function buildHttpParams(obj: Record<string, any>): HttpParams {
    return Object.entries(obj).reduce((params, [key, value]) => {
        // Skip null, undefined, and empty string values
        if (value === null || value === undefined || value === '') {
            return params;
        }

        // Convert value to string if it's a number or boolean
        const stringValue = typeof value === 'number' || typeof value === 'boolean'
            ? value.toString()
            : value;

        return params.set(key, stringValue);
    }, new HttpParams());
}

/**
 * Build HttpParams with custom transformation
 * Allows custom logic for specific keys
 * 
 * @param obj - Object with key-value pairs
 * @param transformers - Map of key to transformation function
 * @returns HttpParams object
 * 
 * @example
 * ```typescript
 * const params = buildHttpParamsWithTransform(
 *   { dateFrom: new Date(), amount: 100 },
 *   {
 *     dateFrom: (value) => value.toISOString(),
 *     amount: (value) => (value / 100).toString()
 *   }
 * );
 * ```
 */
export function buildHttpParamsWithTransform(
    obj: Record<string, any>,
    transformers?: Record<string, (value: any) => string>
): HttpParams {
    return Object.entries(obj).reduce((params, [key, value]) => {
        // Skip null, undefined, and empty string values
        if (value === null || value === undefined || value === '') {
            return params;
        }

        // Apply transformer if available
        if (transformers && transformers[key]) {
            const transformedValue = transformers[key](value);
            return params.set(key, transformedValue);
        }

        // Default: convert to string
        const stringValue = typeof value === 'number' || typeof value === 'boolean'
            ? value.toString()
            : value;

        return params.set(key, stringValue);
    }, new HttpParams());
}