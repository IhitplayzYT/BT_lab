import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../services/animation.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [TranslatePipe, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements AfterViewInit {
  private animationService = inject(AnimationService);
  private elementRef = inject(ElementRef);

  sections = [
    {
      title: '1. Acceptance of Terms',
      content: `
        By accessing and using UNO Bank's services, you agree to be bound by these Terms and Conditions. 
        If you do not agree with any part of these terms, you must not use our services. 
        These terms constitute a legally binding agreement between you and UNO Bank.
        We reserve the right to modify these terms at any time without prior notice. 
        Continued use of our services after any changes constitutes acceptance of the modified terms.
      `
    },
    {
      title: '2. Account Registration',
      content: `
        To use our services, you must register an account by providing accurate and complete information. 
        You are responsible for maintaining the confidentiality of your account credentials. 
        You agree to notify us immediately of any unauthorized use of your account. 
        You must be at least 18 years old to open an account with UNO Bank. 
        We reserve the right to suspend or terminate accounts that violate these terms.
      `
    },
    {
      title: '3. Fixed Deposit Terms',
      content: `
        Fixed Deposits are subject to minimum and maximum deposit limits as specified on our platform. 
        Interest rates are determined based on tenure, amount, and prevailing market conditions. 
        Premature withdrawal may attract penalty charges as per RBI guidelines. 
        Interest is credited as per the frequency selected at the time of FD opening. 
        TDS will be deducted as per Income Tax regulations if interest exceeds the threshold limit.
      `
    },
    {
      title: '4. Interest Rates and Returns',
      content: `
        Interest rates are subject to change without prior notice based on RBI policy changes. 
        Rates applicable at the time of FD booking will remain fixed for the entire tenure. 
        We reserve the right to offer special promotional rates from time to time. 
        Interest calculation follows the methodology prescribed by the Reserve Bank of India. 
        Maturity amount is guaranteed and will be credited to your registered bank account.
      `
    },
    {
      title: '5. Payment and Transactions',
      content: `
        All payments must be made through authorized banking channels. 
        We accept payments via NEFT, IMPS, UPI, and net banking. 
        Transaction processing times vary based on the payment method selected. 
        We are not responsible for delays caused by third-party payment processors. 
        All transactions are subject to verification and fraud detection protocols.
      `
    },
    {
      title: '6. Privacy and Data Protection',
      content: `
        We collect and process your personal data in accordance with our Privacy Policy. 
        Your data is protected using industry-standard encryption and security measures. 
        We do not sell or rent your personal information to third parties. 
        You have the right to access, correct, or delete your personal data. 
        We comply with all applicable data protection laws and regulations in India.
      `
    },
    {
      title: '7. Security Responsibilities',
      content: `
        You are responsible for maintaining the security of your account and devices. 
        Use strong passwords and enable two-factor authentication for enhanced security. 
        Do not share your login credentials with anyone under any circumstances. 
        Report any suspicious activity immediately to our customer support team. 
        We are not liable for losses resulting from your failure to secure your account.
      `
    },
    {
      title: '8. Limitation of Liability',
      content: `
        UNO Bank shall not be liable for any indirect, incidental, or consequential damages. 
        Our liability is limited to the amount of your deposit with us. 
        We are not responsible for losses caused by force majeure events. 
        Technical issues may temporarily affect service availability. 
        We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service.
      `
    },
    {
      title: '9. Termination of Services',
      content: `
        We reserve the right to terminate or suspend your account for violation of terms. 
        You may close your account at any time by following the closure procedure. 
        Upon closure, all FDs will be processed as per premature withdrawal norms. 
        Outstanding dues, if any, will be deducted from the final settlement amount. 
        We may discontinue services with 30 days prior notice to all customers.
      `
    },
    {
      title: '10. Dispute Resolution',
      content: `
        Disputes will be resolved through mutual discussion and negotiation. 
        If unresolved, disputes may be referred to the Banking Ombudsman. 
        Legal proceedings, if any, will be subject to the jurisdiction of Indian courts. 
        Arbitration may be considered for complex commercial disputes. 
        We are committed to fair and transparent dispute resolution practices.
      `
    },
    {
      title: '11. Governing Law',
      content: `
        These terms are governed by the laws of the Republic of India. 
        The Banking Regulation Act, RBI guidelines, and other applicable laws apply. 
        Any legal action must be initiated in the courts of Mumbai, India. 
        We comply with all regulatory requirements issued by the Reserve Bank of India. 
        These terms supersede all prior agreements between you and UNO Bank.
      `
    },
    {
      title: '12. Amendments and Modifications',
      content: `
        We may amend these terms at any time with reasonable notice. 
        Material changes will be communicated via email and website notifications. 
        Continued use after amendments constitutes acceptance of new terms. 
        You may terminate your account if you do not agree with the amendments. 
        We will maintain a history of previous terms for your reference.
      `
    }
  ];

  ngAfterViewInit(): void {
    const termSections = this.elementRef.nativeElement.querySelectorAll('.term-section');
    this.animationService.staggerReveal(Array.from(termSections), 0.1);
  }
}
