import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, AfterViewInit, ElementRef, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationService } from '../../services/validation.service';
import { ApiClientService } from '../../services/api-client.service';
import { CurrencyService } from '../../services/currency.service';
import { AuthService } from '../../services/auth.service';
import { StarBackgroundComponent } from '../star-background/star-background.component';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-apply-fd',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule, StarBackgroundComponent],
  templateUrl: './apply-fd.component.html',
  styleUrls: ['./apply-fd.component.scss']
})
export class ApplyFdComponent implements AfterViewInit {
  @Input() officerMode = false;
  @Input() officerCustomerId = '';
  @Input() officerCustomerName = '';
  @Output() applicationSubmitted = new EventEmitter<void>();
  private elementRef = inject(ElementRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiClient = inject(ApiClientService);
  readonly currencyService = inject(CurrencyService);
  private validationService = inject(ValidationService);

  readonly isLoggedIn = this.authService.isLoggedIn;

  exitApplication(): void {
    this.router.navigate([this.officerMode ? '/officer' : '/dashboard']);
  }

  formData = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    panNumber: '',
    age: '',
    gender: '',
    occupation: '',
    annualIncome: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    nationality: 'Indian',
    maritalStatus: '',
    principalAmount: 10000,
    tenureMonths: 12,
    interestType: 'COMPOUND',
    productCode: '',
    customerCategory: 'GENERAL',
    accountHolderRoles: ['OWNER'] as string[],
    coOwnerName: '',
    nominees: [] as Array<{ name: string; relation: string }>,
    accountNumber: '',
    ifscCode: '',
    currency: 'INR'
  };

  // Store principal amount in INR internally
  principalAmountINR = 10000;
  previousCurrency = 'INR';

  // Currency-based limits (in INR)
  private readonly MIN_AMOUNT_INR = 10000;
  private readonly MAX_AMOUNT_INR = 10000000;

  // Dynamic limits based on selected currency
  minAmount = signal(10000);
  maxAmount = signal(10000000);

  products = signal<any[]>([]);
  selectedProduct = signal<any>(null);
  supportedCurrencies = this.currencyService.getSupportedCurrencies();
  isLoadingProducts = signal(false);
  productsError = signal('');

  // Masking states
  showAccountNumber = false;
  showIfscCode = false;
  showPanNumber = false;

  // Billing calculation
  calculatedMaturity = signal(0);
  calculatedInterest = signal(0);
  processingFee = signal(0);
  serviceFee = signal(0);
  documentationFee = signal(0);
  gstAmount = signal(0);
  taxAmount = signal(0);
  totalFees = signal(0);
  netMaturity = signal(0);

  isSubmitting = false;
  submitSuccess = false;
  errorMessage = '';

  currentStep = 1;
  totalSteps = 4;
  
  // T&C acceptance
  termsAccepted = false;
  termsError = '';
  
  // Bundle mode
  isBundleMode = signal(false);
  bundleData = signal<any>(null);
  bundleName = signal('');
  bundleDescription = signal('');
  bundleTotalAmount = signal(0);
  bundleEstimatedReturn = signal(0);
  bundleTotalDeductions = signal(0);
  bundleBreakdown = signal<any[]>([]);
  bundleCalculationError = signal('');
  private bundleEstimateRequestId = 0;
  bundleFDItems = signal<any[]>([]);
  
  // Validation errors
  firstNameError = '';
  lastNameError = '';
  emailError = '';
  phoneError = '';
  panNumberError = '';
  ageError = '';
  genderError = '';
  annualIncomeError = '';
  addressError = '';
  cityError = '';
  stateError = '';
  pincodeError = '';
  principalAmountError = '';
  tenureMonthsError = '';
  accountNumberError = '';
  ifscCodeError = '';
  productCodeError = '';
  coOwnerNameError = '';

  ngAfterViewInit(): void {
    const formSections = this.elementRef.nativeElement.querySelectorAll('.form-section');
    // Simple CSS animation fallback
    formSections.forEach((section: Element, index: number) => {
      setTimeout(() => {
        (section as HTMLElement).style.opacity = '1';
        (section as HTMLElement).style.transform = 'translateY(0)';
      }, index * 200);
    });
    // Load default details if available
    if (!this.officerMode) this.loadDefaultDetails();
    // Load products from backend
    this.loadProducts();
    // Check for quick purchase package
    if (!this.officerMode) this.loadQuickPurchasePackage();
    // Calculate initial billing
    this.calculateBilling();
  }

  private async loadProducts(): Promise<void> {
    this.isLoadingProducts.set(true);
    this.productsError.set('');
    try {
      const [activeProducts, clock] = await Promise.all([
        this.apiClient.getActiveProducts('FD').toPromise(),
        this.apiClient.getClockStatus().toPromise()
      ]);
      const businessDate = clock?.businessDate;
      if (!businessDate) throw new Error('Business date is unavailable');
      // Match account-service validity checks, including the simulated business date.
      const productData = (activeProducts || []).filter(product =>
        (!product.effectiveDate || product.effectiveDate <= businessDate) &&
        (!product.endDate || product.endDate >= businessDate)
      );
      console.log('Products loaded:', productData);
      this.products.set(productData || []);
      this.reconcileBundleFDItems(productData || []);
      this.refreshBundleEstimate(productData || []);
      if (!productData.some(product => product.productCode === this.formData.productCode)) {
        this.formData.productCode = '';
        this.selectedProduct.set(null);
      }
      if (productData.length === 0) {
        this.productsError.set(`No FD products are available on business date ${businessDate}.`);
      }
      // Auto-select first product if available
      if (productData && productData.length > 0 && !this.formData.productCode) {
        this.onProductSelected(productData[0].productCode);
        // Trigger validation to apply product-specific constraints
        this.validatePrincipalAmount();
        this.validateTenureMonths();
      }
    } catch (error) {
      console.error('Error loading products:', error);
      this.productsError.set('Failed to load products. Please try again.');
      this.products.set([]);
    } finally {
      this.isLoadingProducts.set(false);
    }
  }

  validateFirstName(): void {
    const result = this.validationService.validateAndCleanName(this.formData.firstName);
    if (!result.valid) {
      this.firstNameError = result.error || '';
    } else {
      this.formData.firstName = result.cleaned;
      this.firstNameError = '';
    }
  }

  validateLastName(): void {
    const result = this.validationService.validateAndCleanName(this.formData.lastName);
    if (!result.valid) {
      this.lastNameError = result.error || '';
    } else {
      this.formData.lastName = result.cleaned;
      this.lastNameError = '';
    }
  }

  validateAge(): void {
    const age = parseInt(this.formData.age);
    if (!this.formData.age || isNaN(age) || age < 18 || age > 120) {
      this.ageError = 'Age must be between 18 and 120';
    } else if (age < 60 && this.requiresSeniorEligibility()) {
      this.ageError = 'The Senior Citizen FD is available only to applicants aged 60 or above';
    } else {
      this.ageError = '';
    }
    if (this.isBundleMode()) this.refreshBundleEstimate(this.products());
  }

  requiresSeniorEligibility(): boolean {
    return this.isBundleMode()
      ? this.bundleFDItems().some((item: any) => item.productCode === 'FD_SENIOR')
      : this.formData.productCode === 'FD_SENIOR';
  }

  validateGender(): void {
    if (!this.formData.gender) {
      this.genderError = 'Please select gender';
    } else {
      this.genderError = '';
    }
  }

  validateAnnualIncome(): void {
    const income = parseFloat(this.formData.annualIncome);
    if (!this.formData.annualIncome || isNaN(income) || income < 0) {
      this.annualIncomeError = 'Please enter a valid annual income';
    } else {
      this.annualIncomeError = '';
    }
  }

  validateAddress(): void {
    if (!this.formData.address || this.formData.address.trim().length < 10) {
      this.addressError = 'Address must be at least 10 characters';
    } else {
      this.addressError = '';
    }
  }

  validateCity(): void {
    if (!this.formData.city || this.formData.city.trim().length < 2) {
      this.cityError = 'Please enter a valid city';
    } else {
      this.cityError = '';
    }
  }

  validateState(): void {
    if (!this.formData.state || this.formData.state.trim().length < 2) {
      this.stateError = 'Please enter a valid state';
    } else {
      this.stateError = '';
    }
  }

  validatePincode(): void {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!this.formData.pincode || !pincodeRegex.test(this.formData.pincode)) {
      this.pincodeError = 'Please enter a valid 6-digit pincode';
    } else {
      this.pincodeError = '';
    }
  }

  validateEmail(): void {
    const result = this.validationService.validateAndCleanEmail(this.formData.email);
    if (!result.valid) {
      this.emailError = result.error || '';
    } else {
      this.formData.email = result.cleaned;
      this.emailError = '';
    }
  }

  validatePhone(): void {
    const result = this.validationService.validateAndCleanPhone(this.formData.phone);
    if (!result.valid) {
      this.phoneError = result.error || '';
    } else {
      this.formData.phone = result.cleaned;
      this.phoneError = '';
    }
  }

  validatePanNumber(): void {
    const result = this.validationService.validateAndCleanPan(this.formData.panNumber);
    if (!result.valid) {
      this.panNumberError = result.error || '';
    } else {
      this.formData.panNumber = result.cleaned;
      this.panNumberError = '';
    }
  }

  validatePrincipalAmount(): void {
    if (!this.validationService.isValidPositiveNumber(this.formData.principalAmount)) {
      this.principalAmountError = 'Principal amount must be a positive number';
    } else {
      const product = this.selectedProduct();
      let minAmount = this.minAmount();
      let maxAmount = this.maxAmount();

      // Use product-specific limits if available
      if (product && product.minDeposit && product.maxDeposit) {
        const productMin = this.currencyService.convertFromINR(product.minDeposit, this.formData.currency);
        const productMax = this.currencyService.convertFromINR(product.maxDeposit, this.formData.currency);
        minAmount = Math.round(productMin);
        maxAmount = Math.round(productMax);
      }

      if (this.formData.principalAmount < minAmount) {
        const symbol = this.currencyService.getCurrencySymbol(this.formData.currency);
        this.principalAmountError = `Minimum investment is ${symbol}${minAmount.toLocaleString()}`;
      } else if (this.formData.principalAmount > maxAmount) {
        const symbol = this.currencyService.getCurrencySymbol(this.formData.currency);
        this.principalAmountError = `Maximum investment is ${symbol}${maxAmount.toLocaleString()}`;
      } else {
        this.principalAmountError = '';
      }

      // Update principalAmountINR whenever the amount changes
      this.principalAmountINR = Math.round(this.currencyService.convertToINR(this.formData.principalAmount, this.formData.currency));
    }
    // Recalculate billing on change
    this.calculateBilling();
  }

  validateTenureMonths(): void {
    if (!this.validationService.isValidPositiveNumber(this.formData.tenureMonths)) {
      this.tenureMonthsError = 'Tenure must be a positive number';
    } else {
      const product = this.selectedProduct();
      let minTenure = 6;
      let maxTenure = 120;

      // Use product-specific limits if available
      if (product && product.termLimit && product.termLimit.min && product.termLimit.max) {
        minTenure = product.termLimit.min;
        maxTenure = product.termLimit.max;
      }

      if (this.formData.tenureMonths < minTenure) {
        this.tenureMonthsError = `Minimum tenure is ${minTenure} months`;
      } else if (this.formData.tenureMonths > maxTenure) {
        this.tenureMonthsError = `Maximum tenure is ${maxTenure} months`;
      } else {
        this.tenureMonthsError = '';
      }
    }
    // Recalculate billing on change
    this.calculateBilling();
  }

  addNominee(): void {
    this.formData.nominees.push({ name: '', relation: '' });
  }

  removeNominee(index: number): void {
    this.formData.nominees.splice(index, 1);
  }

  validateAccountNumber(): void {
    const result = this.validationService.validateAndCleanAccountNumber(this.formData.accountNumber);
    if (!result.valid) {
      this.accountNumberError = result.error || '';
    } else {
      this.formData.accountNumber = result.cleaned;
      this.accountNumberError = '';
    }
  }

  validateIfscCode(): void {
    const result = this.validationService.validateAndCleanIfsc(this.formData.ifscCode);
    if (!result.valid) {
      this.ifscCodeError = result.error || '';
    } else {
      this.formData.ifscCode = result.cleaned;
      this.ifscCodeError = '';
    }
  }

  validateProductCode(): void {
    if (!this.formData.productCode || this.formData.productCode.trim() === '') {
      this.productCodeError = 'Please select a product';
    } else {
      this.productCodeError = '';
      // When product is selected, revalidate amount and tenure with product-specific constraints
      this.validatePrincipalAmount();
      this.validateTenureMonths();
    }
  }

  nextStep(): void {
    // A bundle's FD details are fixed by the selected package. Do not run the
    // single-FD validators (or leave the user on this step because of stale
    // hidden single-FD fields such as productCode).
    if (this.isBundleMode() && this.currentStep === 2) {
      this.errorMessage = '';
      this.currentStep = 3;
      return;
    }

    // Validate current step before proceeding
    if (this.currentStep === 1) {
      this.validateFirstName();
      this.validateLastName();
      this.validateEmail();
      this.validatePhone();
      this.validatePanNumber();
      this.validateAge();
      this.validateGender();
      this.validateAnnualIncome();
      this.validateAddress();
      this.validateCity();
      this.validateState();
      this.validatePincode();
      if (this.firstNameError || this.lastNameError || this.emailError || this.phoneError ||
          this.panNumberError || this.ageError || this.genderError || this.annualIncomeError ||
          this.addressError || this.cityError || this.stateError || this.pincodeError) {
        return;
      }
    }
    
    // Bundle FD details are read-only and validated against each product when
    // the package is built. The single-FD fields below are hidden in this mode.
    if (this.currentStep === 2 && !this.isBundleMode()) {
      this.validateAge();
      this.validatePrincipalAmount();
      this.validateTenureMonths();
      this.validateProductCode();
      this.validateCoOwnerName();
      if (this.ageError || this.principalAmountError || this.tenureMonthsError || this.productCodeError || this.coOwnerNameError) {
        return;
      }
    }
    
    if (this.currentStep === 3) {
      this.validateAccountNumber();
      this.validateIfscCode();
      if (this.accountNumberError || this.ifscCodeError) {
        return;
      }
    }
    
    if (this.currentStep === 4) {
      if (!this.termsAccepted) {
        this.termsError = 'You must accept the Terms & Conditions to proceed';
        return;
      }
    }
    
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submitApplication(): void {
    // Check if user is logged in
    if (!this.officerMode && !this.authService.isLoggedIn()) {
      this.errorMessage = 'You must be logged in to submit an FD application. Redirecting to login...';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
      return;
    }

    // Validate terms acceptance
    if (!this.termsAccepted) {
      this.termsError = 'You must accept the Terms & Conditions to proceed';
      this.errorMessage = this.termsError;
      return;
    }

    // If in bundle mode, submit as bundle
    if (this.isBundleMode()) {
      this.submitBundleApplication();
      return;
    }

    // Validate all fields before submission
    this.validateFirstName();
    this.validateLastName();
    this.validateEmail();
    this.validatePhone();
    this.validatePanNumber();
    this.validateAge();
    this.validateGender();
    this.validateAnnualIncome();
    this.validateAddress();
    this.validateCity();
    this.validateState();
    this.validatePincode();
    this.validatePrincipalAmount();
    this.validateTenureMonths();
    this.validateAccountNumber();
    this.validateIfscCode();
    this.validateProductCode();
    this.validateCoOwnerName();

    if (this.firstNameError || this.lastNameError || this.emailError || this.phoneError ||
        this.panNumberError || this.ageError || this.genderError || this.annualIncomeError ||
        this.addressError || this.cityError || this.stateError || this.pincodeError ||
        this.principalAmountError || this.tenureMonthsError ||
        this.accountNumberError || this.ifscCodeError || this.productCodeError || this.coOwnerNameError) {
      this.errorMessage = 'Please fix the errors above';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Prepare API request with all details - send amount in INR
    const fullName = [this.formData.firstName, this.formData.middleName, this.formData.lastName]
      .filter(name => name.trim())
      .join(' ');

    const requestPayload = {
      productCode: this.formData.productCode,
      principalAmount: this.principalAmountINR, // Always send INR to backend
      termMonths: this.formData.tenureMonths,
      applicantFullName: fullName,
      applicantFirstName: this.formData.firstName,
      applicantMiddleName: this.formData.middleName,
      applicantLastName: this.formData.lastName,
      applicantEmail: this.formData.email,
      applicantPhone: this.formData.phone,
      applicantPan: this.formData.panNumber,
      applicantAge: parseInt(this.formData.age) || null,
      applicantGender: this.formData.gender,
      applicantOccupation: this.formData.occupation,
      applicantAnnualIncome: parseFloat(this.formData.annualIncome) || null,
      applicantAddress: this.formData.address,
      applicantCity: this.formData.city,
      applicantState: this.formData.state,
      applicantPincode: this.formData.pincode,
      applicantNationality: this.formData.nationality,
      applicantMaritalStatus: this.formData.maritalStatus,
      applicantAccountNumber: this.formData.accountNumber,
      applicantIfsc: this.formData.ifscCode,
      nominees: this.formData.nominees.length > 0 ? this.formData.nominees : null,
      customerCategory: this.formData.customerCategory,
      accountHolderRoles: this.formData.accountHolderRoles,
      coOwnerName: this.formData.coOwnerName
    };

    if (!this.officerMode) {
      console.log('Submitting FD application');
      console.log('Token present:', !!localStorage.getItem('access_token'));
    }

    // Call API
    const applicationRequest = this.officerMode
      ? this.apiClient.applyForCustomerFD(this.officerCustomerId, requestPayload)
      : this.apiClient.applyForFD(requestPayload);
    applicationRequest.pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (response) => {
        if (!this.officerMode) console.log('FD application submitted successfully:', response);
        this.isSubmitting = false;
        this.submitSuccess = true;
        // Save default details for future applications
        if (this.officerMode) {
          this.resetForm();
          this.submitSuccess = true;
          this.applicationSubmitted.emit();
        } else {
          this.saveDefaultDetails();
          // Redirect to dashboard after short delay
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Error submitting FD application:', error);
        if (!this.officerMode) {
          console.error('Error status:', error.status);
          console.error('Error details:', error.error);
        }
        this.isSubmitting = false;

        if (error.status === 401) {
          this.errorMessage = this.officerMode
            ? 'Your officer session has expired. Please sign in again.'
            : 'You are not logged in. Please login to submit an application.';
          if (!this.officerMode) {
            setTimeout(() => this.router.navigate(['/login']), 1500);
          }
        } else if (error.status === 403) {
          this.errorMessage = 'You do not have permission to submit an application.';
        } else {
          this.errorMessage = error.error?.message || error.message || 'Failed to submit application. Please try again.';
          if (error.status === 400 && /Product (has expired|is not effective yet|is not active)/.test(error.error?.message || '')) {
            this.errorMessage += ' Please select an available product and submit again.';
            void this.loadProducts();
          }
        }
      }
    });
  }

  submitBundleApplication(): void {
    // Validate all fields before submission
    this.validateFirstName();
    this.validateLastName();
    this.validateEmail();
    this.validatePhone();
    this.validatePanNumber();
    this.validateAge();
    this.validateGender();
    this.validateAnnualIncome();
    this.validateAddress();
    this.validateCity();
    this.validateState();
    this.validatePincode();
    this.validateAccountNumber();
    this.validateIfscCode();

    if (this.firstNameError || this.lastNameError || this.emailError || this.phoneError ||
        this.panNumberError || this.ageError || this.genderError || this.annualIncomeError ||
        this.addressError || this.cityError || this.stateError || this.pincodeError ||
        this.accountNumberError || this.ifscCodeError) {
      this.errorMessage = 'Please fix the errors above';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Prepare bundle request payload
    const fdItems = this.bundleFDItems().map((item: any) => ({
      productCode: item.productCode,
      principalAmount: item.principalAmount,
      tenureMonths: item.tenureMonths,
      interestType: item.interestType || 'COMPOUND',
      applicantFirstName: this.formData.firstName,
      applicantMiddleName: this.formData.middleName,
      applicantLastName: this.formData.lastName,
      applicantAge: parseInt(this.formData.age) || null,
      applicantGender: this.formData.gender,
      applicantOccupation: this.formData.occupation,
      applicantAnnualIncome: parseFloat(this.formData.annualIncome) || null,
      applicantAddress: this.formData.address,
      applicantCity: this.formData.city,
      applicantState: this.formData.state,
      applicantPincode: this.formData.pincode,
      applicantNationality: this.formData.nationality,
      applicantMaritalStatus: this.formData.maritalStatus,
      applicantEmail: this.formData.email,
      applicantPhone: this.formData.phone,
      applicantPan: this.formData.panNumber,
      applicantAccountNumber: this.formData.accountNumber,
      applicantIfsc: this.formData.ifscCode,
      nominees: this.formData.nominees.length > 0
        ? this.formData.nominees.map(nominee => ({ name: String(nominee.name || '').trim(), relation: String(nominee.relation || '').trim() }))
        : undefined
    }));

    const bundlePayload = {
      bundleName: this.bundleName(),
      bundleDescription: this.bundleDescription(),
      totalAmount: this.bundleTotalAmount(),
      estimatedReturn: this.bundleEstimatedReturn(),
      customerCategory: this.formData.customerCategory,
      accountHolderRoles: this.formData.accountHolderRoles,
      coOwnerName: this.formData.coOwnerName,
      fdItems: fdItems
    };

    console.log('Submitting bundle application', { itemCount: fdItems.length, totalAmount: bundlePayload.totalAmount });

    // Call bundle API
    this.apiClient.applyForBundle(bundlePayload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (response) => {
        console.log('Bundle application submitted successfully:', response);
        this.isSubmitting = false;
        this.submitSuccess = true;
        // Save default details for future applications
        this.saveDefaultDetails();
        // Redirect to dashboard after short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error submitting bundle application:', error);
        console.error('Error status:', error.status);
        console.error('Error details:', error.error);
        this.isSubmitting = false;

        if (error.status === 401) {
          this.errorMessage = 'You are not logged in. Please login to submit an application.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else if (error.status === 403) {
          this.errorMessage = 'You do not have permission to submit an application.';
        } else {
          this.errorMessage = error.error?.message || error.message || 'Failed to submit bundle application. Please try again.';
        }
      }
    });
  }

  private saveDefaultDetails(): void {
    const defaultDetails = {
      firstName: this.formData.firstName,
      middleName: this.formData.middleName,
      lastName: this.formData.lastName,
      email: this.formData.email,
      phone: this.formData.phone,
      panNumber: this.formData.panNumber,
      age: this.formData.age,
      gender: this.formData.gender,
      occupation: this.formData.occupation,
      annualIncome: this.formData.annualIncome,
      address: this.formData.address,
      city: this.formData.city,
      state: this.formData.state,
      pincode: this.formData.pincode,
      nationality: this.formData.nationality,
      maritalStatus: this.formData.maritalStatus,
      accountNumber: this.formData.accountNumber,
      ifscCode: this.formData.ifscCode,
      nominees: this.formData.nominees,
      currency: this.formData.currency,
      defaultCurrency: this.currencyService.preferredCurrency(),
      customerCategory: this.formData.customerCategory,
      accountHolderRoles: this.formData.accountHolderRoles,
      coOwnerName: this.formData.coOwnerName
    };
    localStorage.setItem(this.apiClient.getUserStorageKey('default_fd_details'), JSON.stringify(defaultDetails));
  }

  private loadDefaultDetails(): void {
    // Discard the old shared record; it cannot safely be attributed to a user.
    localStorage.removeItem('default_fd_details');
    const saved = localStorage.getItem(this.apiClient.getUserStorageKey('default_fd_details'));
    if (saved) {
      try {
        const details = JSON.parse(saved);
        if (!this.officerMode && details.defaultCurrency) {
          this.currencyService.setPreferredCurrency(details.defaultCurrency);
        }
        const savedCurrency = details.defaultCurrency || this.currencyService.preferredCurrency() || details.currency || 'INR';
        this.formData.currency = savedCurrency;
        if (savedCurrency !== this.previousCurrency) this.onCurrencyChange(savedCurrency);
        this.formData.firstName = details.firstName || '';
        this.formData.middleName = details.middleName || '';
        this.formData.lastName = details.lastName || '';
        this.formData.email = details.email || '';
        this.formData.phone = details.phone || '';
        this.formData.panNumber = details.panNumber || '';
        this.formData.age = details.age || '';
        this.formData.gender = details.gender || '';
        this.formData.occupation = details.occupation || '';
        this.formData.annualIncome = details.annualIncome || '';
        this.formData.address = details.address || '';
        this.formData.city = details.city || '';
        this.formData.state = details.state || '';
        this.formData.pincode = details.pincode || '';
        this.formData.nationality = details.nationality || 'Indian';
        this.formData.maritalStatus = details.maritalStatus || '';
        this.formData.accountNumber = details.accountNumber || '';
        this.formData.ifscCode = details.ifscCode || '';
        this.formData.nominees = details.nominees || [];
        this.formData.customerCategory = details.customerCategory || 'GENERAL';
        this.formData.accountHolderRoles = details.accountHolderRoles || ['OWNER'];
        this.formData.coOwnerName = details.coOwnerName || '';
      } catch (e) {
        console.error('Error loading default details:', e);
      }
    }
  }

  onProductSelected(productCode: string): void {
    const product = this.products().find(item => item.productCode === productCode) || null;
    this.formData.productCode = productCode;
    this.selectedProduct.set(product);
    if (product?.termLimit) {
      const minTerm = Number(product.termLimit.min ?? 6);
      const maxTerm = Number(product.termLimit.max ?? 120);
      this.formData.tenureMonths = Math.min(maxTerm, Math.max(minTerm, Number(this.formData.tenureMonths) || minTerm));
    }
    const allowedRoles = product?.allowedRoles?.map((role: string) => role.toUpperCase()) || ['OWNER'];
    this.formData.accountHolderRoles = ['OWNER', ...(this.formData.accountHolderRoles.includes('CO-OWNER') && allowedRoles.includes('CO-OWNER') ? ['CO-OWNER'] : [])];
    const categories = (product?.rateVariations || []).map((variation: any) => String(variation.customerCategory).toUpperCase().replace(/\s+/g, '_'));
    if (this.formData.customerCategory !== 'GENERAL' && !categories.includes(this.formData.customerCategory)) {
      this.formData.customerCategory = 'GENERAL';
    }
    if (!allowedRoles.includes('NOMINEE')) this.formData.nominees = [];
    this.calculateBilling();
    this.validateProductCode();
    this.validateAge();
    this.validatePrincipalAmount();
    this.validateTenureMonths();
  }

  isProductRoleAllowed(role: string): boolean {
    // The account service supports optional co-owners for every FD. Older
    // product records may not yet include this role in their catalog payload.
    if (role === 'OWNER' || role === 'CO-OWNER') return true;
    const roles = this.selectedProduct()?.allowedRoles?.map((value: string) => value.toUpperCase()) || ['OWNER'];
    return roles.includes(role);
  }

  hasApplicationRole(role: string): boolean {
    return this.formData.accountHolderRoles.includes(role);
  }

  toggleApplicationRole(role: string, checked: boolean): void {
    if (role === 'OWNER' || !this.isProductRoleAllowed(role)) return;
    this.formData.accountHolderRoles = ['OWNER', ...(checked ? ['CO-OWNER'] : [])];
    if (!checked) this.formData.coOwnerName = '';
    this.validateCoOwnerName();
  }

  validateCoOwnerName(): void {
    this.coOwnerNameError = this.formData.accountHolderRoles.includes('CO-OWNER') && !this.formData.coOwnerName.trim()
      ? 'Enter the co-owner full name'
      : '';
  }

  private loadQuickPurchasePackage(): void {
    const packageKey = this.apiClient.getUserStorageKey('quick_purchase_package');
    const saved = localStorage.getItem(packageKey);
    if (saved) {
      try {
        const pkg = JSON.parse(saved);
        // Set bundle mode
        this.isBundleMode.set(true);
        this.bundleData.set(pkg);
        this.bundleName.set(pkg.name);
        this.bundleDescription.set(pkg.description);
        this.bundleTotalAmount.set(pkg.totalAmount);
        this.bundleEstimatedReturn.set(pkg.estimatedReturn);

        // Convert package products to bundle FD items
        const fdItems = pkg.products.map((p: any, index: number) => ({
          productCode: p.productCode,
          principalAmount: p.amount,
          tenureMonths: p.tenure,
          interestType: 'COMPOUND',
          sequenceOrder: index + 1
        }));
        this.bundleFDItems.set(fdItems);
        this.reconcileBundleFDItems(this.products());

        // Pre-fill applicant details from first product (for display)
        if (pkg.products && pkg.products.length > 0) {
          const firstProduct = pkg.products[0];
          this.formData.productCode = firstProduct.productCode;
          this.formData.principalAmount = firstProduct.amount;
          this.formData.tenureMonths = firstProduct.tenure;
          // Clear the quick purchase data after loading
          localStorage.removeItem(packageKey);
          // Select the product after products are loaded
          setTimeout(() => {
            const product = this.products().find(p => p.productCode === firstProduct.productCode);
            if (product) {
              this.selectedProduct.set(product);
              this.calculateBilling();
            }
          }, 500);
        }
      } catch (e) {
        console.error('Error loading quick purchase package:', e);
        this.isBundleMode.set(false);
      }
    }
  }

  private reconcileBundleFDItems(products: any[]): void {
    if (!products?.length || !this.isBundleMode()) return;
    const compatible = (product: any, item: any): boolean => {
      const minTerm = Number(product.termLimit?.min ?? 6);
      const maxTerm = Number(product.termLimit?.max ?? 120);
      const minAmount = Number(product.minDeposit ?? 0);
      const maxAmount = Number(product.maxDeposit ?? Number.POSITIVE_INFINITY);
      return item.tenureMonths >= minTerm && item.tenureMonths <= maxTerm &&
        item.principalAmount >= minAmount && item.principalAmount <= maxAmount;
    };
    const updatedItems = this.bundleFDItems().map(item => {
      const currentProduct = products.find(product => product.productCode === item.productCode);
      if (currentProduct && compatible(currentProduct, item)) return item;
      const replacement = products.find(product => compatible(product, item));
      return replacement ? { ...item, productCode: replacement.productCode } : item;
    });
    this.bundleFDItems.set(updatedItems);
  }

  private refreshBundleEstimate(products: any[]): void {
    if (!this.isBundleMode() || !products.length) return;
    const requestId = ++this.bundleEstimateRequestId;
    const items = this.bundleFDItems();
    if (!items.length) {
      this.bundleBreakdown.set([]);
      this.bundleTotalDeductions.set(0);
      return;
    }
    this.bundleCalculationError.set('');
    const category = Number(this.formData.age) >= 60 && this.formData.customerCategory === 'GENERAL'
      ? 'SENIOR_CITIZEN' : this.formData.customerCategory;
    const requests = items.map(item => this.apiClient.calculateAdvancedMaturity({
      principal: Number(item.principalAmount),
      term: { value: Number(item.tenureMonths), unit: 'MONTHS' },
      productCode: item.productCode,
      categories: category === 'GENERAL' ? [] : [category],
      interestType: item.interestType || 'COMPOUND',
      currency: 'INR',
      age: Number(this.formData.age) || undefined,
      includePrematureWithdrawal: false
    }));
    forkJoin(requests).subscribe({
      next: results => {
        // Ignore stale responses if the bundle or applicant category changed.
        if (requestId !== this.bundleEstimateRequestId || items !== this.bundleFDItems()) return;
        let totalPrincipal = 0;
        let maturityTotal = 0;
        let totalDeductions = 0;
        const breakdown = items.map((item, index) => {
          const product = products.find(candidate => candidate.productCode === item.productCode);
          const result = results[index] || {};
          const principal = Number(item.principalAmount) || 0;
          const grossInterest = Number(result.grossInterest) || 0;
          const charges = Array.isArray(result.charges) ? [...result.charges] : [];
          const hasTaxDeduction = charges.some((charge: any) =>
            String(charge.chargeType || '').trim().toUpperCase() === 'TDS'
          );
          const explicitTaxRate = Number(product?.taxRate);
          const taxCharge = (Array.isArray(product?.chargeDetails) ? product.chargeDetails : []).find((charge: any) =>
            String(charge.chargeType || '').trim().toUpperCase() === 'TAX'
          );
          const taxRate = explicitTaxRate > 0 ? explicitTaxRate : Number(taxCharge?.chargeValue) || 0;
          const taxDeduction = !hasTaxDeduction && taxRate > 0
            ? Math.round(grossInterest * taxRate) / 100
            : 0;
          if (taxDeduction > 0) {
            charges.push({
              chargeType: 'TDS',
              chargeCategory: 'TAX',
              description: 'Tax Deducted at Source',
              chargeAmount: taxDeduction,
              chargeUnit: 'PERCENTAGE',
              chargeRate: taxRate,
              isDeductible: true
            });
          }
          const deductions = (Number(result.totalDeductions) || 0) + taxDeduction;
          const apiMaturity = Number(result.maturityAmount);
          const maturity = apiMaturity > 0
            ? apiMaturity - taxDeduction
            : principal + grossInterest - deductions;
          totalPrincipal += principal;
          maturityTotal += maturity;
          totalDeductions += deductions;
          return {
            ...item,
            productName: product?.productName || item.productCode,
            effectiveRate: Number(result.effectiveRate) || 0,
            grossInterest,
            totalDeductions: deductions,
            maturityAmount: maturity,
            charges
          };
        });
        this.bundleBreakdown.set(breakdown);
        this.bundleTotalDeductions.set(Math.round(totalDeductions * 100) / 100);
        this.bundleTotalAmount.set(Math.round(totalPrincipal * 100) / 100);
        this.bundleEstimatedReturn.set(Math.round(maturityTotal * 100) / 100);
      },
      error: error => {
        if (requestId !== this.bundleEstimateRequestId) return;
        this.bundleCalculationError.set('Could not calculate one or more FD fee summaries. Please retry after the product calculator is available.');
        console.warn('Could not refresh detailed bundle estimate:', error.status || error.message);
      }
    });
  }

  calculateBilling(): void {
    if (this.isBundleMode()) {
      this.refreshBundleEstimate(this.products());
      return;
    }
    const principal = Number(this.formData.principalAmount);
    const tenure = Number(this.formData.tenureMonths);
    const principalINR = Number(this.currencyService.convertToINR(principal, this.formData.currency));

    // Guard against invalid values
    if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(principalINR) || principalINR <= 0 || !Number.isFinite(tenure) || tenure <= 0) {
      this.calculatedInterest.set(0);
      this.calculatedMaturity.set(0);
      this.processingFee.set(0);
      this.serviceFee.set(0);
      this.documentationFee.set(0);
      this.gstAmount.set(0);
      this.taxAmount.set(0);
      this.totalFees.set(0);
      this.netMaturity.set(0);
      return;
    }

    const product = this.selectedProduct();
    const minRate = Number(product?.rateLimit?.min);
    const maxRate = Number(product?.rateLimit?.max);
    if (!Number.isFinite(minRate) || !Number.isFinite(maxRate) || maxRate < minRate) {
      this.calculatedInterest.set(0); this.calculatedMaturity.set(0);
      this.processingFee.set(0); this.serviceFee.set(0); this.documentationFee.set(0);
      this.gstAmount.set(0); this.taxAmount.set(0); this.totalFees.set(0); this.netMaturity.set(0);
      return;
    }
    const category = Number(this.formData.age) >= 60 && this.formData.customerCategory === 'GENERAL'
      ? 'SENIOR_CITIZEN' : this.formData.customerCategory;
    const variation = (product.rateVariations || []).find((item: any) =>
      String(item.customerCategory).trim().toUpperCase().replaceAll(' ', '_') === category
    );
    const interestRate = Math.min(maxRate, Math.max(minRate, minRate + Number(variation?.rateModifier || 0)));

    // Calculate interest based on interest type
    let interest: number;
    if (this.formData.interestType === 'COMPOUND') {
      // Use the product's configured compounding frequency.
      const r = interestRate / 100;
      const n = this.compoundsPerYear(product.compoundingFrequency);
      if (!n) {
        this.calculatedInterest.set(0); this.calculatedMaturity.set(0);
        this.processingFee.set(0); this.serviceFee.set(0); this.documentationFee.set(0);
        this.gstAmount.set(0); this.taxAmount.set(0); this.totalFees.set(0); this.netMaturity.set(0);
        return;
      }
      const t = tenure / 12;
      interest = principalINR * Math.pow(1 + r/n, n*t) - principalINR;
    } else {
      // Simple interest: I = P * r * t
      interest = (principalINR * interestRate * tenure) / (12 * 100);
    }

    const maturityINR = principalINR + interest;

    // Only apply charges configured on this product. Withdrawal penalties are
    // not application fees, and a missing configured fee is zero.
    let processingFeeINR = 0;
    let serviceFeeINR = 0;
    let documentationFeeINR = 0;

    const chargeRows = Array.isArray(product.chargeDetails) ? product.chargeDetails : [];
    const getCharge = (...types: string[]): any => chargeRows.find((charge: any) => types.includes(String(charge.chargeType || '').trim().toUpperCase().replaceAll(' ', '_')));
    const chargeAmount = (charge: any): number => {
      if (!charge) return 0;
      const value = Number(charge.chargeValue) || 0;
      return String(charge.chargeUnit).toLowerCase() === 'percentage' ? principalINR * value / 100 : value;
    };
    processingFeeINR = chargeAmount(getCharge('PROCESSING_FEE', 'TRANSACTION_FEE', 'DEPOSIT_FEE', 'ACCOUNT_OPENING_FEE', 'APPLICATION_FEE'));
    const serviceCharge = getCharge('SERVICE_FEE');
    const documentationCharge = getCharge('DOCUMENTATION_FEE');
    serviceFeeINR = serviceCharge ? chargeAmount(serviceCharge)
      : Number(product.serviceFeeRate) > 0 ? principalINR * Number(product.serviceFeeRate) / 100
      : Number(product.serviceFeeFlat) || 0;
    documentationFeeINR = documentationCharge ? chargeAmount(documentationCharge) : Number(product.documentationFee) || 0;
    const gstRate = Number(product.gstRate) || 0;
    const totalFeesINR = processingFeeINR + serviceFeeINR + documentationFeeINR;
    const gstINR = totalFeesINR * (gstRate / 100);
    const taxCharge = getCharge('TAX');
    // Product responses can store tax either in taxRate or as a TAX charge.
    // Prefer a positive explicit rate, then fall back to the charge value.
    const configuredTaxRate = Number(product.taxRate);
    const taxRate = configuredTaxRate > 0 ? configuredTaxRate : Number(taxCharge?.chargeValue) || 0;
    const taxINR = interest * taxRate / 100;

    // Convert to selected currency
    const interestInSelectedCurrency = this.currencyService.convertFromINR(interest, this.formData.currency);
    const maturity = this.currencyService.convertFromINR(maturityINR, this.formData.currency);
    const processingFee = this.currencyService.convertFromINR(processingFeeINR, this.formData.currency);
    const serviceFee = this.currencyService.convertFromINR(serviceFeeINR, this.formData.currency);
    const documentationFee = this.currencyService.convertFromINR(documentationFeeINR, this.formData.currency);
    const gst = this.currencyService.convertFromINR(gstINR, this.formData.currency);
    const tax = this.currencyService.convertFromINR(taxINR, this.formData.currency);
    const totalFees = this.currencyService.convertFromINR(totalFeesINR + gstINR + taxINR, this.formData.currency);

    this.calculatedInterest.set(Math.round(interestInSelectedCurrency * 100) / 100);
    this.calculatedMaturity.set(Math.round(maturity * 100) / 100);
    this.processingFee.set(Math.round(processingFee * 100) / 100);
    this.serviceFee.set(Math.round(serviceFee * 100) / 100);
    this.documentationFee.set(Math.round(documentationFee * 100) / 100);
    this.gstAmount.set(Math.round(gst * 100) / 100);
    this.taxAmount.set(Math.round(tax * 100) / 100);
    this.totalFees.set(Math.round(totalFees * 100) / 100);
    this.netMaturity.set(Math.round((maturity - totalFees) * 100) / 100);
  }

  private compoundsPerYear(frequency: any): number {
    const normalized = String(frequency || '').trim().toUpperCase();
    const named: Record<string, number> = { ANNUAL: 1, ANNUALLY: 1, YEARLY: 1, ON_MATURITY: 1, SEMI_ANNUAL: 2, 'SEMI-ANNUAL': 2, HALF_YEARLY: 2, QUARTERLY: 4, MONTHLY: 12, DAILY: 365 };
    const value = named[normalized] ?? Number(normalized);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  // Helper method for number formatting
  formatNumber(value: any): string {
    const number = Number(value);
    return (Number.isFinite(number) ? number : 0).toLocaleString('en-IN');
  }

  formatBundleCurrency(amountInINR: number): string {
    const amount = this.currencyService.convertFromINR(Number(amountInINR) || 0, this.formData.currency);
    return this.currencyService.formatCurrency(amount, this.formData.currency);
  }

  onCurrencyChange(newCurrency: string): void {
    // Convert current principal amount from previous currency to new currency
    const currentAmount = Number(this.formData.principalAmount);
    const amountInINR = this.currencyService.convertToINR(currentAmount, this.previousCurrency);
    const newAmount = this.currencyService.convertFromINR(amountInINR, newCurrency);

    // Update dynamic limits based on new currency
    this.minAmount.set(Math.round(this.currencyService.convertFromINR(this.MIN_AMOUNT_INR, newCurrency)));
    this.maxAmount.set(Math.round(this.currencyService.convertFromINR(this.MAX_AMOUNT_INR, newCurrency)));

    this.formData.principalAmount = Math.round(newAmount);
    this.principalAmountINR = Math.round(amountInINR);
    this.previousCurrency = newCurrency;

    this.calculateBilling();
  }

  resetForm(): void {
    this.formData = {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      panNumber: '',
      age: '',
      gender: '',
      occupation: '',
      annualIncome: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      nationality: 'Indian',
      maritalStatus: '',
      principalAmount: 10000,
      tenureMonths: 12,
      interestType: 'COMPOUND',
      productCode: '',
      customerCategory: 'GENERAL',
      accountHolderRoles: ['OWNER'],
      coOwnerName: '',
      nominees: [],
      accountNumber: '',
      ifscCode: '',
      currency: 'INR'
    };
    this.currentStep = 1;
    this.submitSuccess = false;
    this.errorMessage = '';
    this.termsAccepted = false;
    this.termsError = '';
    this.selectedProduct.set(null);
  }
}
