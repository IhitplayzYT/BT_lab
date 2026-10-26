import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly messages = signal<Record<string, Record<string, string>>>({});
  private loading?: Promise<void>;

  initialize(): Promise<void> {
    return this.loading ??= import('../i18n/messages').then(({ MESSAGES }) => {
      this.messages.set(MESSAGES);
    });
  }

  private currentLang = signal<string>('en');
  private translations = signal<any>({});
  private langChangeSubject = new Subject<string>();
  
  readonly currentLangSignal = this.currentLang.asReadonly();
  readonly translationsSignal = this.translations.asReadonly();
  readonly langChange$ = this.langChangeSubject.asObservable();

  // Embedded translations to avoid HTTP loading issues
  private translationsData: any = {
    en: {
      navbar: {
        home: "Home",
        features: "Features",
        calculator: "FD Calculator",
        compare: "Compare",
        apply: "Apply for FD",
        dashboard: "Dashboard",
        about: "About Us",
        contact: "Contact",
        login: "Login",
        signup: "Sign Up",
        logout: "Logout",
        language: "Language"
      },
      hero: {
        title: "Secure Your Future with Fixed Deposits",
        subtitle: "High interest rates, flexible tenure, and guaranteed returns",
        cta: "Get Started",
        learnMore: "Learn More",
        avgInterestRate: "Avg Interest Rate",
        maxDeposit: "Max Deposit",
        monthsTenure: "Months Tenure"
      },
      auth: {
        loginTitle: "Login to Your Account",
        signupTitle: "Create Your Account",
        username: "Username",
        password: "Password",
        email: "Email",
        confirmPassword: "Confirm Password",
        loginButton: "Login",
        signupButton: "Sign Up",
        forgotPassword: "Forgot Password?",
        noAccount: "Don't have an account?",
        hasAccount: "Already have an account?",
        signupHere: "Sign up here",
        loginHere: "Login here"
      },
      calculator: {
        title: "FD Calculator",
        principal: "Principal Amount",
        tenure: "Tenure (Months)",
        interestRate: "Interest Rate (%)",
        calculate: "Calculate",
        maturityAmount: "Maturity Amount",
        interestEarned: "Interest Earned",
        totalAmount: "Total Amount"
      },
      apply: {
        title: "Apply for Fixed Deposit",
        personalDetails: "Personal Details",
        fullName: "Full Name",
        panNumber: "PAN Number",
        nomineeName: "Nominee Name",
        nomineeRelation: "Nominee Relation",
        bankDetails: "Bank Details",
        accountNumber: "Account Number",
        ifscCode: "IFSC Code",
        fdDetails: "FD Details",
        principalAmount: "Principal Amount",
        tenureMonths: "Tenure (Months)",
        interestType: "Interest Type",
        compound: "Compound",
        simple: "Simple",
        submit: "Submit Application",
        cancel: "Cancel"
      },
      dashboard: {
        welcome: "Welcome",
        myApplications: "My Applications",
        myBundles: "My Bundles",
        quickPurchase: "Quick Purchase",
        settings: "Settings",
        recentActivity: "Recent Activity",
        noApplications: "No applications found"
      },
      common: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        submit: "Submit",
        back: "Back",
        next: "Next",
        previous: "Previous",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        required: "Required",
        optional: "Optional"
      }
    },
    hi: {
      navbar: {
        home: "होम",
        features: "विशेषताएं",
        calculator: "एफडी कैलकुलेटर",
        compare: "तुलना करें",
        apply: "एफडी के लिए आवेदन करें",
        dashboard: "डैशबोर्ड",
        about: "हमारे बारे में",
        contact: "संपर्क",
        login: "लॉगिन",
        signup: "साइन अप",
        logout: "लॉगआउट",
        language: "भाषा"
      },
      hero: {
        title: "फिक्स्ड डिपॉजिट के साथ अपना भविष्य सुरक्षित करें",
        subtitle: "उच्च ब्याज दर, लचीली अवधि और गारंटीड रिटर्न",
        cta: "शुरू करें",
        learnMore: "और जानें",
        avgInterestRate: "औसत ब्याज दर",
        maxDeposit: "अधिकतम जमा",
        monthsTenure: "महीने की अवधि"
      },
      auth: {
        loginTitle: "अपने खाते में लॉगिन करें",
        signupTitle: "अपना खाता बनाएं",
        username: "उपयोगकर्ता नाम",
        password: "पासवर्ड",
        email: "ईमेल",
        confirmPassword: "पासवर्ड की पुष्टि करें",
        loginButton: "लॉगिन",
        signupButton: "साइन अप",
        forgotPassword: "पासवर्ड भूल गए?",
        noAccount: "खाता नहीं है?",
        hasAccount: "पहले से खाता है?",
        signupHere: "यहां साइन अप करें",
        loginHere: "यहां लॉगिन करें"
      },
      calculator: {
        title: "एफडी कैलकुलेटर",
        principal: "मूल राशि",
        tenure: "अवधि (महीने)",
        interestRate: "ब्याज दर (%)",
        calculate: "गणना करें",
        maturityAmount: "परिपक्वता राशि",
        interestEarned: "अर्जित ब्याज",
        totalAmount: "कुल राशि"
      },
      apply: {
        title: "फिक्स्ड डिपॉजिट के लिए आवेदन करें",
        personalDetails: "व्यक्तिगत विवरण",
        fullName: "पूरा नाम",
        panNumber: "पैन नंबर",
        nomineeName: "नॉमिनी का नाम",
        nomineeRelation: "नॉमिनी का संबंध",
        bankDetails: "बैंक विवरण",
        accountNumber: "खाता नंबर",
        ifscCode: "आईएफएससी कोड",
        fdDetails: "एफडी विवरण",
        principalAmount: "मूल राशि",
        tenureMonths: "अवधि (महीने)",
        interestType: "ब्याज प्रकार",
        compound: "चक्रवृद्धि",
        simple: "साधारण",
        submit: "आवेदन जमा करें",
        cancel: "रद्द करें"
      },
      dashboard: {
        welcome: "स्वागत है",
        myApplications: "मेरे आवेदन",
        myBundles: "मेरे बंडल",
        quickPurchase: "त्वरित खरीद",
        settings: "सेटिंग्स",
        recentActivity: "हाल की गतिविधि",
        noApplications: "कोई आवेदन नहीं मिला"
      },
      common: {
        save: "सहेजें",
        cancel: "रद्द करें",
        delete: "हटाएं",
        edit: "संपादित करें",
        view: "देखें",
        submit: "जमा करें",
        back: "वापस",
        next: "अगला",
        previous: "पिछला",
        loading: "लोड हो रहा है...",
        error: "त्रुटि",
        success: "सफलता",
        required: "आवश्यक",
        optional: "वैकल्पिक"
      }
    },
    kn: {
      navbar: {
        home: "ಹೋಮ್",
        features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
        calculator: "ಎಫ್‌ಡಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        compare: "ಹೋಲಿಸಿ",
        apply: "ಎಫ್‌ಡಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
        dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        about: "ನಮ್ಮ ಬಗ್ಗೆ",
        contact: "ಸಂಪರ್ಕ",
        login: "ಲಾಗಿನ್",
        signup: "ಸೈನ್ ಅಪ್",
        logout: "ಲಾಗ್‌ಔಟ್",
        language: "ಭಾಷೆ"
      },
      hero: {
        title: "ಫಿಕ್ಸ್ಡ್ ಡೆಪಾಸಿಟ್‌ನೊಂದigೆ ನಿಮ್ಮ ಭವಿಷ್ಯವನ್ನು ಸುರಕ್ಷಿತಗೊಳಿಸಿ",
        subtitle: "ಹೆಚ್ಚಿನ ಬಡ್ಡಿ ದರ, ನಮ್ಯವಾದ ಅವಧಿ ಮತ್ತು ಖಾತರಿಯಾದ ರಿಟರ್ನ್",
        cta: "ಪ್ರಾರಂಭಿಸಿ",
        learnMore: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
        avgInterestRate: "ಸರಾಸರಿ ಬಡ್ಡಿ ದರ",
        maxDeposit: "ಗರಿಷ್ಠ ಠೇವಣಿ",
        monthsTenure: "ತಿಂಗಳುಗಳ ಅವಧಿ"
      },
      auth: {
        loginTitle: "ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
        signupTitle: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
        username: "ಬಳಕೆದಾರ ಹೆಸರು",
        password: "ಪಾಸ್‌ವರ್ಡ್",
        email: "ಇಮೇಲ್",
        confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
        loginButton: "ಲಾಗಿನ್",
        signupButton: "ಸೈನ್ ಅಪ್",
        forgotPassword: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
        noAccount: "ಖಾತೆ ಇಲ್ಲವೇ?",
        hasAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
        signupHere: "ಇಲ್ಲಿ ಸೈನ್ ಅಪ್ ಮಾಡಿ",
        loginHere: "ಇಲ್ಲಿ ಲಾಗಿನ್ ಮಾಡಿ"
      },
      calculator: {
        title: "ಎಫ್‌ಡಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        principal: "ಮೂಲ ಮೊತ್ತ",
        tenure: "ಅವಧಿ (ತಿಂಗಳುಗಳು)",
        interestRate: "ಬಡ್ಡಿ ದರ (%)",
        calculate: "ಲೆಕ್ಕ ಹಾಕಿ",
        maturityAmount: "ಪರಿಪಕ್ವತೆ ಮೊತ್ತ",
        interestEarned: "ಗಳಿಸಿದ ಬಡ್ಡಿ",
        totalAmount: "ಒಟ್ಟು ಮೊತ್ತ"
      },
      apply: {
        title: "ಫಿಕ್ಸ್ಡ್ ಡೆಪಾಸಿಟ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
        personalDetails: "ವೈಯಕ್ತಿಕ ವಿವರಗಳು",
        fullName: "ಪೂರ್ಣ ಹೆಸರು",
        panNumber: "ಪ್ಯಾನ್ ಸಂಖ್ಯೆ",
        nomineeName: "ನಾಮನಿರ್ದೇಶಿತರ ಹೆಸರು",
        nomineeRelation: "ನಾಮನಿರ್ದೇಶಿತರ ಸಂಬಂಧ",
        bankDetails: "ಬ್ಯಾಂಕ್ ವಿವರಗಳು",
        accountNumber: "ಖಾತೆ ಸಂಖ್ಯೆ",
        ifscCode: "ಐಎಫ್‌ಎಸ್‌ಸಿ ಕೋಡ್",
        fdDetails: "ಎಫ್‌ಡಿ ವಿವರಗಳು",
        principalAmount: "ಮೂಲ ಮೊತ್ತ",
        tenureMonths: "ಅವಧಿ (ತಿಂಗಳುಗಳು)",
        interestType: "ಬಡ್ಡಿ ಪ್ರಕಾರ",
        compound: "ಚಕ್ರೀಯ",
        simple: "ಸರಳ",
        submit: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
        cancel: "ರದ್ದುಮಾಡಿ"
      },
      dashboard: {
        welcome: "ಸ್ವಾಗತ",
        myApplications: "ನನ್ನ ಅರ್ಜಿಗಳು",
        myBundles: "ನನ್ನ ಬಂಡಲ್‌ಗಳು",
        quickPurchase: "ತ್ವರಿತ ಖರೀದಿ",
        settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        recentActivity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
        noApplications: "ಯಾವುದೇ ಅರ್ಜಿಗಳು ಸಿಗಲಿಲ್ಲ"
      },
      common: {
        save: "ಉಳಿಸಿ",
        cancel: "ರದ್ದುಮಾಡಿ",
        delete: "ಅಳಿಸಿ",
        edit: "ಸಂಪಾದಿಸಿ",
        view: "ವೀಕ್ಷಿಸಿ",
        submit: "ಸಲ್ಲಿಸಿ",
        back: "ಹಿಂದೆ",
        next: "ಮುಂದೆ",
        previous: "ಹಿಂದಿನ",
        loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        error: "ದೋಷ",
        success: "ಯಶಸ್ವಿ",
        required: "ಅಗತ್ಯ",
        optional: "ಐಚ್ಛಿಕ"
      }
    }
  };

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageKey = 'uno.language';

  constructor() {
    const window = this.document.defaultView;
    let saved: string | null = null;
    try { saved = window?.localStorage.getItem(this.storageKey) ?? null; } catch { /* Storage may be disabled. */ }
    this.loadTranslations(this.isLanguage(saved) ? saved : 'en');
    if (window) {
      const sync = (event: StorageEvent) => {
        if (event.key === this.storageKey || event.key === null) {
          this.loadTranslations(this.isLanguage(event.newValue) ? event.newValue : 'en');
        }
      };
      window.addEventListener('storage', sync);
      this.destroyRef.onDestroy(() => window.removeEventListener('storage', sync));
    }
  }

  private isLanguage(lang: string | null): lang is string {
    return lang === 'en' || lang === 'hi' || lang === 'kn';
  }

  private loadTranslations(lang: string): void {
    this.translations.set(this.translationsData[lang]);
    this.currentLang.set(lang);
    this.document.documentElement.lang = lang;
    this.langChangeSubject.next(lang);
  }

  switchLanguage(lang: string): void {
    if (!this.isLanguage(lang)) return;
    this.loadTranslations(lang);
    try { this.document.defaultView?.localStorage.setItem(this.storageKey, lang); } catch { /* Keep in-memory selection working. */ }
  }

  getCurrentLang(): string { return this.currentLang(); }

  translate(key: unknown, params: readonly unknown[] = []): string {
    if (key === null || key === undefined) return '';
    const source = String(key);
    const normalized = source.replace(/\s+/g, ' ').trim();
    const lang = this.currentLang();
    let value: unknown = this.translations();
    for (const part of normalized.split('.')) value = (value as Record<string, unknown>)?.[part];
    let message = typeof value === 'string' ? value : this.messages()[lang]?.[normalized];
    // Component-generated messages (dialogs/errors) may contain runtime values.
    // Match only bundled templates, preserving the interpolated values verbatim.
    if (!message && lang !== 'en' && !params.length) {
      for (const pattern of this.patterns()) {
        const match = pattern.regex.exec(normalized);
        if (match) {
          const translated = this.messages()[lang]?.[pattern.key];
          if (translated) return translated.replace(/\{(\d+)\}/g, (_, index) => match[Number(index) + 1] ?? '');
        }
      }
    }
    if (!message && !params.length && source.includes('\n')) return source.split('\n').map(line => this.translate(line)).join('\n');
    message ??= source;
    return String(message).replace(/\{(\d+)\}/g, (placeholder, index) =>
      Number(index) < params.length ? String(params[Number(index)] ?? '') : placeholder);
  }

  private readonly patterns = computed(() => Object.keys(this.messages()['hi'] ?? {})
    .filter(key => /\{\d+\}/.test(key))
    .map(key => ({ key, regex: new RegExp('^' + key.split(/\{\d+\}/)
      .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(.*?)') + '$') })));

  instant(key: string): string { return this.translate(key); }
  getTranslation(key: string) { return computed(() => this.translate(key)); }
}
