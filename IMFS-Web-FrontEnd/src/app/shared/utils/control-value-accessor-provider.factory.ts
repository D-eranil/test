import { forwardRef, Provider, Type } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export function ControlValueAccessorProviderFactory(type: Type<any>): Provider {
    return {
        provide: NG_VALUE_ACCESSOR,
        // tslint:disable-next-line:no-forward-ref
        useExisting: forwardRef(() => type),
        multi: true
    };
}
