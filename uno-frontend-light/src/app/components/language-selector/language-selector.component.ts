import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent {
  private translationService = inject(TranslationService);
  
  languages = [
    { code: 'en', name: 'EN' },
    { code: 'hi', name: 'HI' },
    { code: 'kn', name: 'KN' }
  ];
  
  readonly selectedLang = this.translationService.currentLangSignal;
  selectLanguage(lang: string): void {
    this.translationService.switchLanguage(lang);
  }
}
