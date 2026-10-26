import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../services/animation.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [TranslatePipe, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements AfterViewInit {
  private animationService = inject(AnimationService);
  private elementRef = inject(ElementRef);

  sections = [
    {
      title: '1. Information We Collect',
      content: `
        We collect information you provide directly when you create an account, including your name, 
        email address, phone number, date of birth, and PAN card details. We also collect financial 
        information necessary for opening and managing Fixed Deposits, such as bank account details 
        and nomination information. Additionally, we collect device information, IP address, and 
        usage data to improve our services and enhance security.
      `
    },
    {
      title: '2. How We Use Your Information',
      content: `
        Your information is used to provide and maintain our banking services, process transactions, 
        verify your identity, and comply with regulatory requirements. We use your data to communicate 
        with you about your accounts, send important notifications, and provide customer support. 
        Your information may also be used for fraud prevention, security analysis, and to improve 
        our products and services through analytics and research.
      `
    },
    {
      title: '3. Data Security Measures',
      content: `
        We implement industry-standard security measures to protect your personal information. 
        All data is encrypted using 256-bit SSL encryption during transmission and at rest. 
        We use multi-factor authentication, regular security audits, and intrusion detection systems. 
        Our servers are hosted in secure data centers with 24/7 monitoring. We comply with RBI 
        guidelines on data security and maintain strict access controls.
      `
    },
    {
      title: '4. Information Sharing',
      content: `
        We do not sell or rent your personal information to third parties. We may share your information 
        with regulatory authorities, law enforcement agencies, or government bodies as required by law. 
        We may share data with our service providers who assist us in operating our business, subject 
        to strict confidentiality agreements. We may disclose information in connection with business 
        transfers or mergers, with your consent.
      `
    },
    {
      title: '5. Data Retention Policy',
      content: `
        We retain your personal information only as long as necessary to provide our services and 
        comply with legal obligations. Account information is retained for 7 years after account 
        closure as per regulatory requirements. Transaction records are maintained for 8 years. 
        You may request deletion of your data, subject to legal and regulatory constraints. 
        Automated deletion processes are in place for outdated information.
      `
    },
    {
      title: '6. Your Rights and Choices',
      content: `
        You have the right to access, correct, update, or delete your personal information. 
        You can opt-out of marketing communications while still receiving essential service notifications. 
        You may request a copy of your data or information about how we use it. 
        You can withdraw consent for data processing where legally permissible. 
        To exercise these rights, contact our privacy officer or use your account settings.
      `
    },
    {
      title: '7. Cookies and Tracking',
      content: `
        We use cookies and similar technologies to enhance your experience, remember your preferences, 
        and analyze usage patterns. Essential cookies are required for basic functionality. 
        Performance cookies help us understand how you use our services. 
        Marketing cookies may be used with your consent to show relevant advertisements. 
        You can manage cookie preferences through your browser settings at any time.
      `
    },
    {
      title: '8. Third-Party Links',
      content: `
        Our platform may contain links to third-party websites or services. 
        We are not responsible for the privacy practices or content of external sites. 
        We encourage you to review the privacy policies of any third-party sites you visit. 
        Our privacy policy applies only to information collected on our platform. 
        Third-party links are provided for convenience and do not imply endorsement.
      `
    },
    {
      title: '9. Children\'s Privacy',
      content: `
        Our services are not intended for individuals under the age of 18. 
        We do not knowingly collect personal information from children. 
        If we discover that we have collected information from a minor, 
        we will take immediate steps to delete such information. 
        Parents or guardians may contact us regarding data collection involving minors.
      `
    },
    {
      title: '10. International Data Transfers',
      content: `
        Your data is primarily stored and processed within India in compliance with data localization laws. 
        We may transfer data to international locations only with appropriate safeguards and your consent. 
        All international transfers comply with applicable data protection laws. 
        We use standard contractual clauses and other legal mechanisms for cross-border data transfers. 
        Your data rights remain protected regardless of where it is processed.
      `
    },
    {
      title: '11. Changes to Privacy Policy',
      content: `
        We may update this privacy policy from time to time to reflect changes in our practices 
        or applicable laws. Material changes will be communicated via email and prominent website notices. 
        We will maintain a history of previous versions for your reference. 
        Continued use of our services after changes constitutes acceptance of the updated policy. 
        We encourage you to review this policy periodically for any modifications.
      `
    },
    {
      title: '12. Grievance Redressal',
      content: `
        If you have concerns about our data practices, you may contact our Privacy Officer. 
        We will acknowledge your complaint within 48 hours and resolve it within 30 days. 
        For unresolved complaints, you may approach the Banking Ombudsman or relevant authorities. 
        We maintain detailed records of all privacy-related complaints and their resolution. 
        Your privacy concerns are taken seriously and handled with utmost priority.
      `
    }
  ];

  ngAfterViewInit(): void {
    const privacySections = this.elementRef.nativeElement.querySelectorAll('.privacy-section');
    this.animationService.staggerReveal(Array.from(privacySections), 0.1);
  }
}
