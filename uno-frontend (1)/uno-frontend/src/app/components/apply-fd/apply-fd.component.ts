import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, AfterViewInit, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidationService } from '../../services/validation.service';
import { ApiClientService } from '../../services/api-client.service';
import { CurrencyService } from '../../services/currency.service';
import { AuthService } from '../../services/auth.service';
import { StarBackgroundComponent } from '../star-background/star-background.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-apply-fd',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule, StarBackgroundComponent],
  templateUrl: './apply-fd.component.html',
  styleUrls: ['./apply-fd.component.scss']
})
export class ApplyFdComponent implements AfterViewInit {
  private elementRef = inject(ElementRef);
  private authService = inject(AuthService);
  private router = inject(Router);
  private apiClient = inject(ApiClientService);
  private currencyService = inject(CurrencyService);
  private validationService = inject(ValidationService);

  readonly isLoggedIn = this.authService.isLoggedIn;

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
    this.loadDefaultDetails();
    // Load products from backend
    this.loadProducts();
    // Check for quick purchase package
    this.loadQuickPurchasePackage();
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
      if (!productData.some(product => product.productCode === this.formData.productCode)) {
        this.formData.productCode = '';
        this.selectedProduct.set(null);
      }
      if (productData.length === 0) {
        this.productsError.set(`No FD products are available on business date ${businessDate}.`);
      }
      // Auto-select first product if available
      if (productData && productData.length > 0 && !this.formData.productCode) {
        this.formData.productCode = productData[0].productCode;
        this.selectedProduct.set(productData[0]);
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
    } else {
      this.ageError = '';
    }
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
    
    if (this.currentStep === 2) {
      this.validatePrincipalAmount();
      this.validateTenureMonths();
      this.validateProductCode();
      if (this.principalAmountError || this.tenureMonthsError || this.productCodeError) {
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
    if (!this.authService.isLoggedIn()) {
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

    if (this.firstNameError || this.lastNameError || this.emailError || this.phoneError ||
        this.panNumberError || this.ageError || this.genderError || this.annualIncomeError ||
        this.addressError || this.cityError || this.stateError || this.pincodeError ||
        this.principalAmountError || this.tenureMonthsError ||
        this.accountNumberError || this.ifscCodeError || this.productCodeError) {
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
      nominees: this.formData.nominees.length > 0 ? this.formData.nominees : null
    };

    console.log('Submitting FD application with payload:', requestPayload);
    console.log('Token present:', !!localStorage.getItem('access_token'));

    // Call API
    this.apiClient.applyForFD(requestPayload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (response) => {
        console.log('FD application submitted successfully:', response);
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
        console.error('Error submitting FD application:', error);
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
      nominees: this.formData.nominees.length > 0 ? this.formData.nominees : null
    }));

    const bundlePayload = {
      bundleName: this.bundleName(),
      bundleDescription: this.bundleDescription(),
      totalAmount: this.bundleTotalAmount(),
      estimatedReturn: this.bundleEstimatedReturn(),
      fdItems: fdItems
    };

    console.log('Submitting bundle application with payload:', bundlePayload);
    console.log('Token present:', !!localStorage.getItem('access_token'));

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
      nominees: this.formData.nominees
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
      } catch (e) {
        console.error('Error loading default details:', e);
      }
    }
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

  calculateBilling(): void {
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
      this.totalFees.set(0);
      this.netMaturity.set(0);
      return;
    }

    // Get rate from selected product with product-specific logic
    let interestRate = 7.5; // Default fallback
    const product = this.selectedProduct();

    if (product && product.rateLimit) {
      // Use product-specific rate calculation based on tenure
      const parsedMinRate = Number(product.rateLimit.min);
      const parsedMaxRate = Number(product.rateLimit.max);
      const minRate = Number.isFinite(parsedMinRate) ? parsedMinRate : 7.0;
      const maxRate = Number.isFinite(parsedMaxRate) ? parsedMaxRate : 7.5;

      // Calculate rate based on tenure (longer tenure = higher rate)
      if (product.termLimit) {
        const minTenure = Number(product.termLimit.min) || 6;
        const maxTenure = Number(product.termLimit.max) || 120;
        const tenureRatio = maxTenure > minTenure
          ? Math.max(0, Math.min(1, (tenure - minTenure) / (maxTenure - minTenure)))
          : 1;
        interestRate = minRate + (maxRate - minRate) * tenureRatio;
      } else {
        interestRate = maxRate;
      }

      // Apply product-specific adjustments
      if (product.productCode === 'FD_SENIOR') {
        // Senior Citizen FD: +0.5% extra
        interestRate += 0.5;
      } else if (product.productCode === 'FD_TAX_SAVER') {
        // Tax Saver FD: slightly lower rate due to tax benefits
        interestRate -= 0.25;
      } else if (product.productCode === 'FD_FLEXI') {
        // Flexible FD: lower rate due to flexibility
        interestRate -= 0.5;
      }
    }

    // Calculate interest based on interest type
    let interest: number;
    if (this.formData.interestType === 'COMPOUND') {
      // Compound interest: A = P(1 + r/n)^(nt)
      // Assuming quarterly compounding (n=4)
      const r = interestRate / 100;
      const n = 4;
      const t = tenure / 12;
      interest = principalINR * Math.pow(1 + r/n, n*t) - principalINR;
    } else {
      // Simple interest: I = P * r * t
      interest = (principalINR * interestRate * tenure) / (12 * 100);
    }

    const maturityINR = principalINR + interest;

    // Calculate fees based on product configuration
    let processingFeeINR = 0;
    let serviceFeeINR = 0;
    let documentationFeeINR = 0;

    if (product && product.charges && product.charges.length > 0) {
      product.charges.forEach((charge: any) => {
        if (charge.chargeType === 'PREMATURE_WITHDRAWAL') {
          // This is for premature withdrawal, not for application
          // Skip for now
        } else if (charge.chargeType === 'PROCESSING_FEE') {
          if (charge.chargeUnit === 'percentage') {
            processingFeeINR = principalINR * (Number(charge.chargeValue) / 100);
          } else {
            processingFeeINR = Number(charge.chargeValue) || 0;
          }
        } else if (charge.chargeType === 'SERVICE_FEE') {
          if (charge.chargeUnit === 'percentage') {
            serviceFeeINR = principalINR * (Number(charge.chargeValue) / 100);
          } else {
            serviceFeeINR = Number(charge.chargeValue) || 0;
          }
        } else if (charge.chargeType === 'DOCUMENTATION_FEE') {
          documentationFeeINR = Number(charge.chargeValue) || 0;
        }
      });
    }

    // Default processing fee if not specified in product
    if (processingFeeINR === 0) {
      processingFeeINR = Math.max(100, Math.min(500, principalINR * 0.005));
    }

    // Get GST rate from product (default 18%)
    const gstRate = product?.gstRate || 18.0;
    const totalFeesINR = processingFeeINR + serviceFeeINR + documentationFeeINR;
    const gstINR = totalFeesINR * (gstRate / 100);

    // Convert to selected currency
    const interestInSelectedCurrency = this.currencyService.convertFromINR(interest, this.formData.currency);
    const maturity = this.currencyService.convertFromINR(maturityINR, this.formData.currency);
    const processingFee = this.currencyService.convertFromINR(processingFeeINR, this.formData.currency);
    const serviceFee = this.currencyService.convertFromINR(serviceFeeINR, this.formData.currency);
    const documentationFee = this.currencyService.convertFromINR(documentationFeeINR, this.formData.currency);
    const gst = this.currencyService.convertFromINR(gstINR, this.formData.currency);
    const totalFees = this.currencyService.convertFromINR(totalFeesINR + gstINR, this.formData.currency);

    this.calculatedInterest.set(Math.round(interestInSelectedCurrency));
    this.calculatedMaturity.set(Math.round(maturity));
    this.processingFee.set(Math.round(processingFee));
    this.serviceFee.set(Math.round(serviceFee));
    this.documentationFee.set(Math.round(documentationFee));
    this.gstAmount.set(Math.round(gst));
    this.totalFees.set(Math.round(totalFees));
    this.netMaturity.set(Math.round(maturity - totalFees));
  }

  // Helper method for number formatting
  formatNumber(value: any): string {
    const number = Number(value);
    return (Number.isFinite(number) ? number : 0).toLocaleString('en-IN');
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
      nominees: [],
      accountNumber: '',
      ifscCode: '',
      currency: 'INR'
    };
    this.currentStep = 1;
    this.submitSuccess = false;
    this.errorMessage = '';
    this.selectedProduct.set(null);
  }
}
