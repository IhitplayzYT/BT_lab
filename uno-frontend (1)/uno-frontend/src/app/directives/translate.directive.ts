import { Directive, ElementRef, inject, input, effect } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Directive({ selector: '[appTranslate]', standalone: true })
export class TranslateDirective {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly translationService = inject(TranslationService);
  readonly appTranslate = input('');

  constructor() {
    effect(() => {
      this.element.nativeElement.textContent = this.translationService.translate(this.appTranslate());
    });
  }
}
