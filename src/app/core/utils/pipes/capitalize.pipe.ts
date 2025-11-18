import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {
    transform(value: string | null | undefined): string | null {
        if (!value) {
            return value ?? ''; // Return null or undefined if the input is null or undefined
        }
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}