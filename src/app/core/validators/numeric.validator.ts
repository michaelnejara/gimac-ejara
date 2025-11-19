import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator that requires the control value to contain only numeric characters
 * Allows input type="text" while enforcing numeric-only content
 *
 * @returns A validator function that returns an error if the value contains non-numeric characters
 *
 * @example
 * // In component
 * smartContractId: ['', [Validators.required, numericOnly()]]
 *
 * @example
 * // In template
 * <input type="text" formControlName="smartContractId">
 * @if (hasSpecificError('smartContractId', 'numericOnly')) {
 *   <span>Only numbers are allowed</span>
 * }
 */
export function numericOnly(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      // Allow empty values - use Validators.required for required validation
      return null;
    }

    const value = control.value.toString();

    // Check if value contains only digits (0-9)
    const isNumeric = /^\d+$/.test(value);

    return isNumeric ? null : { numericOnly: { value: control.value } };
  };
}

/**
 * Validator that requires the control value to be a valid positive integer
 * More strict than numericOnly - also validates the number is positive
 *
 * @returns A validator function that returns an error if the value is not a positive integer
 *
 * @example
 * bondId: ['', [Validators.required, positiveInteger()]]
 */
export function positiveInteger(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value && control.value !== 0) {
      return null;
    }

    const value = control.value.toString();
    const isNumeric = /^\d+$/.test(value);

    if (!isNumeric) {
      return { positiveInteger: { value: control.value, message: 'Must be a number' } };
    }

    const numValue = parseInt(value, 10);

    if (numValue <= 0) {
      return { positiveInteger: { value: control.value, message: 'Must be greater than 0' } };
    }

    return null;
  };
}

/**
 * Validator that allows only alphanumeric characters (letters and numbers)
 * Useful for IDs, codes, etc.
 *
 * @returns A validator function that returns an error if the value contains special characters
 *
 * @example
 * contractCode: ['', [Validators.required, alphanumericOnly()]]
 */
export function alphanumericOnly(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value.toString();
    const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(value);

    return isAlphanumeric ? null : { alphanumericOnly: { value: control.value } };
  };
}
