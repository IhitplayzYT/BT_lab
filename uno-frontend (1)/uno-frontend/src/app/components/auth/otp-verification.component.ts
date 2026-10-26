import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [TranslatePipe, CommonModule, FormsModule],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('800ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('fadeInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('800ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('bounce', [
      transition(':enter', [
        style({ transform: 'translateY(0)' }),
        animate('1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', style({ transform: 'translateY(-10px)' })),
        animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', style({ transform: 'translateY(0)' }))
      ])
    ]),
    trigger('pulse', [
      transition(':enter', [
        style({ transform: 'scale(1)', opacity: 0.5 }),
        animate('2000ms ease-in-out', style({ transform: 'scale(1.1)', opacity: 0.8 })),
        animate('2000ms ease-in-out', style({ transform: 'scale(1)', opacity: 0.5 }))
      ])
    ]),
    trigger('buttonPulse', [
      transition('* => hover', [
        animate('300ms ease-out', style({ transform: 'scale(1.02)' }))
      ]),
      transition('* => leave', [
        animate('300ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class OtpVerificationComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  private authService = inject(AuthService);

  otp = '';
  email = '';
  isLoading = false;
  error = '';
  
  // OTP timer
  timeRemaining = 0;
  otpTimer: any = null;
  otpExpired = false;

  ngOnInit(): void {
    // Get email from route params or query params
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    
    if (!this.email) {
      this.error = 'Email not provided. Please start signup again.';
      this.router.navigate(['/signup']);
      return;
    }

    // Start timer
    this.startOTPTimer();
  }

  ngOnDestroy(): void {
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
    }
  }

  startOTPTimer(): void {
    this.timeRemaining = 600; // 10 minutes in seconds
    this.otpExpired = false;
    
    if (this.otpTimer) {
      clearInterval(this.otpTimer);
    }
    
    this.otpTimer = setInterval(() => {
      this.ngZone.run(() => {
        this.timeRemaining--;
        
        if (this.timeRemaining <= 0) {
          this.otpExpired = true;
          clearInterval(this.otpTimer);
          this.error = 'OTP has expired. Please request a new one.';
        }
      });
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async verifyOTP(): Promise<void> {
    this.error = '';
    const otp = this.otp.trim();
    
    if (!/^\d{6}$/.test(otp)) {
      this.error = 'Please enter a valid 6-digit OTP';
      return;
    }

    if (this.otpExpired) {
      this.error = 'OTP has expired. Please request a new one.';
      return;
    }

    this.isLoading = true;

    try {
      // Call backend to verify OTP
      const response: any = await this.http.post('http://localhost:8090/api/auth/verify-otp', {
        email: this.email,
        otp
      }).toPromise();

      // Clear timer
      if (this.otpTimer) {
        clearInterval(this.otpTimer);
      }

      // Use AuthService to properly authenticate the user
      if (response?.accessToken) {
        this.authService.authenticateWithTokens(response.accessToken, response.refreshToken, response);
      }

      // Navigate to dashboard on success
      this.ngZone.run(() => {
        this.router.navigate(['/dashboard']);
      });
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Verification failed. Please try again.';
      if (error.status === 400 && error.error?.message?.toLowerCase().includes('invalid otp')) {
        errorMessage = 'The OTP you entered doesn’t match. Please check the code and try again.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 400) {
        errorMessage = 'Invalid OTP. Please try again.';
      } else if (error.status === 410) {
        errorMessage = 'OTP has expired. Please request a new one.';
        this.otpExpired = true;
      }
      
      this.error = errorMessage;
    } finally {
      this.isLoading = false;
    }
  }

  resendOTP(): void {
    this.ngZone.run(() => {
      this.otpExpired = false;
      this.error = '';
      this.otp = '';
      this.isLoading = true;
    });

    this.http.post('http://localhost:8090/api/auth/resend-otp', {
      email: this.email
    }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.startOTPTimer();
        });
      },
      error: (error: any) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.error = error.error?.message || 'Failed to resend OTP. Please try again.';
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/signup']);
  }
}
