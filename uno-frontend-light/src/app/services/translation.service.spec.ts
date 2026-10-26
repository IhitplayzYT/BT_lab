import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageSelectorComponent } from '../components/language-selector/language-selector.component';

@Component({
  imports: [TranslatePipe, LanguageSelectorComponent],
  template: `<app-language-selector />
    <h1>{{ 'About Us' | translate }}</h1>
    <input [attr.placeholder]="'Username' | translate" />`
})
class TranslationHost {}

describe('Frontend language switching', () => {
  beforeEach(async () => {
    localStorage.removeItem('uno.language');
    TestBed.configureTestingModule({ imports: [TranslationHost] });
    await TestBed.inject(TranslationService).initialize();
  });

  afterEach(() => {
    localStorage.removeItem('uno.language');
    document.documentElement.lang = 'en';
  });

  it('updates visible text and attributes through the selector in all languages', async () => {
    const fixture = TestBed.createComponent(TranslationHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    const service = TestBed.inject(TranslationService);
    for (const [lang, heading] of [['hi', 'हमारे बारे में'], ['kn', 'ನಮ್ಮ ಬಗ್ಗೆ'], ['en', 'About Us']]) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('h1').textContent).toBe(heading);
      expect(fixture.nativeElement.querySelector('input').placeholder).toBe(service.translate('Username'));
      expect(localStorage.getItem('uno.language')).toBe(lang);
      expect(document.documentElement.lang).toBe(lang);
    }
  });

  it('restores the saved language on a new application instance', async () => {
    TestBed.inject(TranslationService).switchLanguage('kn');
    TestBed.resetTestingModule();
    const service = TestBed.inject(TranslationService);
    await service.initialize();
    expect(service.getCurrentLang()).toBe('kn');
    expect(service.translate('About Us')).toBe('ನಮ್ಮ ಬಗ್ಗೆ');
  });
});
