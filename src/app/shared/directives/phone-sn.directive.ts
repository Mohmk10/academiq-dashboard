import { Directive, ElementRef, forwardRef, HostListener } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

/**
 * Masque de saisie pour numéro sénégalais.
 * Affichage : +221 XX XXX XX XX
 * Valeur stockée : +221XXXXXXXXX (sans espaces, pour le backend)
 * Préfixes valides : 70-78 (mobile), 33 (fixe Dakar), 30 (fixe régions)
 */
@Directive({
  selector: 'input[appPhoneSn]',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PhoneSnDirective), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => PhoneSnDirective), multi: true }
  ]
})
export class PhoneSnDirective implements ControlValueAccessor, Validator {
  private readonly DISPLAY_PREFIX = '+221 ';
  private readonly REGEX = /^\+221(7[0-8]|33|30)\d{7}$/;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  // --- ControlValueAccessor ---

  writeValue(value: string): void {
    if (value && value.trim()) {
      this.el.nativeElement.value = this.toDisplay(value);
    } else {
      this.el.nativeElement.value = '';
    }
  }

  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.el.nativeElement.disabled = disabled; }

  // --- Validator ---

  validate(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (!val || !val.trim()) return null;
    return this.REGEX.test(val) ? null : { phoneSn: true };
  }

  // --- Events ---

  @HostListener('input')
  onInput(): void {
    const raw = this.el.nativeElement.value;
    const local = this.extractLocal(raw);
    const display = this.formatDisplay(local);
    this.el.nativeElement.value = display;

    const stored = local.length > 0 ? '+221' + local : '';
    this.onChange(stored);

    const len = display.length;
    setTimeout(() => this.el.nativeElement.setSelectionRange(len, len));
  }

  @HostListener('focus')
  onFocus(): void {
    if (!this.el.nativeElement.value) {
      this.el.nativeElement.value = this.DISPLAY_PREFIX;
      const len = this.DISPLAY_PREFIX.length;
      setTimeout(() => this.el.nativeElement.setSelectionRange(len, len));
    }
  }

  @HostListener('blur')
  onBlur(): void {
    const local = this.extractLocal(this.el.nativeElement.value);
    if (local.length === 0) {
      this.el.nativeElement.value = '';
      this.onChange('');
    }
    this.onTouched();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const pos = this.el.nativeElement.selectionStart ?? 0;
    const selEnd = this.el.nativeElement.selectionEnd ?? 0;
    // Prevent deleting the +221 prefix (unless full selection)
    if (event.key === 'Backspace' && pos <= this.DISPLAY_PREFIX.length && selEnd <= this.DISPLAY_PREFIX.length) {
      event.preventDefault();
    }
    if (event.key === 'Delete' && pos < this.DISPLAY_PREFIX.length) {
      event.preventDefault();
    }
  }

  // --- Helpers ---

  /** Extract the 9 local digits (after 221) from any input */
  private extractLocal(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    const local = digits.startsWith('221') ? digits.substring(3) : digits;
    return local.substring(0, 9);
  }

  /** Format local digits as display: +221 XX XXX XX XX */
  private formatDisplay(local: string): string {
    let r = this.DISPLAY_PREFIX;
    if (local.length > 0) r += local.substring(0, 2);
    if (local.length > 2) r += ' ' + local.substring(2, 5);
    if (local.length > 5) r += ' ' + local.substring(5, 7);
    if (local.length > 7) r += ' ' + local.substring(7, 9);
    return r;
  }

  /** Convert stored value (+221XXXXXXXXX) to display format */
  private toDisplay(value: string): string {
    return this.formatDisplay(this.extractLocal(value));
  }
}
