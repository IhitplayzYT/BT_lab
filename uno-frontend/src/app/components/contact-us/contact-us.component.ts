import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  private router = inject(Router);

  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  submitForm(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      this.submitError = 'Please fill in all required fields';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      };
    }, 1500);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
