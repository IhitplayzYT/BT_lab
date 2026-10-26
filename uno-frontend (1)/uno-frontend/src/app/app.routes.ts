import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { SignupComponent } from './components/auth/signup.component';
import { AdminLoginComponent } from './components/auth/admin-login.component';
import { AdminSignupComponent } from './components/auth/admin-signup.component';
import { OfficerLoginComponent } from './components/auth/officer-login.component';
import { OfficerSignupComponent } from './components/auth/officer-signup.component';
import { OtpVerificationComponent } from './components/auth/otp-verification.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingComponent } from './components/landing/landing.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'verify-otp', component: OtpVerificationComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin-signup', component: AdminSignupComponent },
  { path: 'officer-login', component: OfficerLoginComponent },
  { path: 'officer-signup', component: OfficerSignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', loadComponent: () => import('./components/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent) },
  { path: 'officer', loadComponent: () => import('./components/officer-panel/officer-panel.component').then(m => m.OfficerPanelComponent) },
  { path: 'apply-fd', loadComponent: () => import('./components/apply-fd/apply-fd.component').then(m => m.ApplyFdComponent) },
  { path: 'calculator', loadComponent: () => import('./components/fd-calculator/fd-calculator.component').then(m => m.FdCalculatorComponent) },
  { path: 'terms', loadComponent: () => import('./components/terms/terms.component').then(m => m.TermsComponent) },
  { path: 'privacy', loadComponent: () => import('./components/privacy/privacy.component').then(m => m.PrivacyComponent) },
  { path: 'help-center', loadComponent: () => import('./components/help-center/help-center.component').then(m => m.HelpCenterComponent) },
  { path: 'contact', loadComponent: () => import('./components/contact-us/contact-us.component').then(m => m.ContactUsComponent) },
  { path: 'compare', loadComponent: () => import('./components/fd-compare/fd-compare.component').then(m => m.FdCompareComponent) },
  { path: '', component: LandingComponent },
  { path: '**', redirectTo: '/' }
];
