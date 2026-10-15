import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-apply-fd',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-fd.component.html',
  styleUrls: ['./apply-fd.component.scss']
})
export class ApplyFdComponent implements AfterViewInit {
  private elementRef = inject(ElementRef);
  private validationService = inject(ValidationService);

  formData = {
    fullName: '',
    email: '',
    phone: '',
    panNumber: '',
    principalAmount: 10000,
    tenureMonths: 12,
    interestType: 'COMPOUND',
    productCode: '',
    nomineeName: '',
    nomineeRelation: '',
    accountNumber: '',
    ifscCode: ''
  };

  products = [
    { productCode: 'FD_STD', productName: 'Standard FD' },
    { productCode: 'FD_SNR', productName: 'Senior Citizen FD' },
    { productCode: 'FD_TAX', productName: 'Tax Saver FD' },
    { productCode: 'FD_FLEX', productName: 'Flexible FD' }
  ];

  isSubmitting = false;
  submitSuccess = false;
  errorMessage = '';

  currentStep = 1;
  totalSteps = 3;
  
  // Validation errors
  fullNameError = '';
  emailError = '';
  phoneError = '';
  panNumberError = '';
  principalAmountError = '';
  nomineeNameError = '';
  accountNumberError = '';
  ifscCodeError = '';

  ngAfterViewInit(): void {
    const formSections = this.elementRef.nativeElement.querySelectorAll('.form-section');
    // Simple CSS animation fallback
    formSections.forEach((section: Element, index: number) => {
      setTimeout(() => {
        (section as HTMLElement).style.opacity = '1';
        (section as HTMLElement).style.transform = 'translateY(0)';
      }, index * 200);
    });
  }

  validateFullName(): void {
    const result = this.validationService.validateAndCleanName(this.formData.fullName);
    if (!result.valid) {
      this.fullNameError = result.error || '';
    } else {
      this.formData.fullName = result.cleaned;
      this.fullNameError = '';
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
    } else if (this.formData.principalAmount < 1000) {
      this.principalAmountError = 'Minimum investment is ₹1,000';
    } else if (this.formData.principalAmount > 10000000) {
      this.principalAmountError = 'Maximum investment is ₹1 crore';
    } else {
      this.principalAmountError = '';
    }
  }

  validateNomineeName(): void {
    if (this.formData.nomineeName) {
      const result = this.validationService.validateAndCleanName(this.formData.nomineeName);
      if (!result.valid) {
        this.nomineeNameError = result.error || '';
      } else {
        this.formData.nomineeName = result.cleaned;
        this.nomineeNameError = '';
      }
    } else {
      this.nomineeNameError = '';
    }
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

  nextStep(): void {
    // Validate current step before proceeding
    if (this.currentStep === 1) {
      this.validateFullName();
      this.validateEmail();
      this.validatePhone();
      this.validatePanNumber();
      if (this.fullNameError || this.emailError || this.phoneError || this.panNumberError) {
        return;
      }
    }
    
    if (this.currentStep === 2) {
      this.validatePrincipalAmount();
      if (this.principalAmountError) {
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
    // Validate all fields before submission
    this.validateFullName();
    this.validateEmail();
    this.validatePhone();
    this.validatePanNumber();
    this.validatePrincipalAmount();
    this.validateNomineeName();
    this.validateAccountNumber();
    this.validateIfscCode();
    
    if (this.fullNameError || this.emailError || this.phoneError || this.panNumberError || 
        this.principalAmountError || this.nomineeNameError || this.accountNumberError || this.ifscCodeError) {
      this.errorMessage = 'Please fix the errors above';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
    }, 2000);
  }

  resetForm(): void {
    this.formData = {
      fullName: '',
      email: '',
      phone: '',
      panNumber: '',
      principalAmount: 10000,
      tenureMonths: 12,
      interestType: 'COMPOUND',
      productCode: '',
      nomineeName: '',
      nomineeRelation: '',
      accountNumber: '',
      ifscCode: ''
    };
    this.currentStep = 1;
    this.submitSuccess = false;
  }
}
