import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * OPTION 4: Template-Safe Pipe Approach
 *
 * Benefits:
 * - Encapsulates null-safety in reusable pipes
 * - Clean template syntax
 * - Prevents undefined errors at pipe level
 * - Reusable across all forms in the app
 * - No component logic needed for validation display
 */

/**
 * Pipe to safely get a form control
 * Usage: form | formControl:'fieldName'
 */
@Pipe({
  name: 'formControl',
  standalone: true,
  pure: false
})
export class FormControlPipe implements PipeTransform {
  transform(formGroup: FormGroup | null | undefined, fieldName: string): AbstractControl | null {
    if (!formGroup || !fieldName) return null;
    return formGroup.get(fieldName) ?? null;
  }
}

/**
 * Pipe to check if field is invalid and touched
 * Usage: form | hasError:'fieldName'
 */
@Pipe({
  name: 'hasError',
  standalone: true,
  pure: false
})
export class HasErrorPipe implements PipeTransform {
  transform(formGroup: FormGroup | null | undefined, fieldName: string): boolean {
    if (!formGroup || !fieldName) return false;

    const control = formGroup.get(fieldName);
    if (!control) return false;

    return !!(control.invalid && (control.dirty || control.touched));
  }
}

/**
 * Pipe to get error message for a field
 * Usage: form | errorMessage:'fieldName'
 */
@Pipe({
  name: 'errorMessage',
  standalone: true,
  pure: false
})
export class ErrorMessagePipe implements PipeTransform {
  transform(formGroup: FormGroup | null | undefined, fieldName: string): string {
    if (!formGroup || !fieldName) return '';

    const control = formGroup.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Invalid format';
    if (errors['email']) return 'Invalid email address';

    return 'Invalid value';
  }
}

/**
 * Pipe to check if control is valid and touched (for success states)
 * Usage: form | isValid:'fieldName'
 */
@Pipe({
  name: 'isValid',
  standalone: true,
  pure: false
})
export class IsValidPipe implements PipeTransform {
  transform(formGroup: FormGroup | null | undefined, fieldName: string): boolean {
    if (!formGroup || !fieldName) return false;

    const control = formGroup.get(fieldName);
    if (!control) return false;

    return !!(control.valid && control.touched);
  }
}
