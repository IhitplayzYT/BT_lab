import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../services/animation.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { HelpBotComponent } from '../help-bot/help-bot.component';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [TranslatePipe, CommonModule, NavbarComponent, FooterComponent, HelpBotComponent],
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent implements AfterViewInit {
  private animationService = inject(AnimationService);
  private elementRef = inject(ElementRef);
  private router = inject(Router);

  faqs = [
    {
      question: 'How do I open a Fixed Deposit account?',
      answer: 'To open a Fixed Deposit account, log in to your dashboard, click on "Apply FD", fill in the required details including principal amount, tenure, and interest type, and submit your application. Your FD will be created instantly.'
    },
    {
      question: 'What is the minimum deposit amount?',
      answer: 'The minimum deposit amount for a Fixed Deposit is ₹1,000. However, for better returns, we recommend a minimum deposit of ₹10,000.'
    },
    {
      question: 'What are the available tenure options?',
      answer: 'You can choose a tenure ranging from 6 months to 120 months (10 years). The interest rate varies based on the tenure you select.'
    },
    {
      question: 'How is interest calculated?',
      answer: 'Interest can be calculated using either Simple Interest or Compound Interest. Compound Interest is calculated monthly and offers higher returns. You can use our FD Calculator to estimate your returns.'
    },
    {
      question: 'Can I withdraw my FD before maturity?',
      answer: 'Yes, you can withdraw your FD before maturity. However, premature withdrawal may attract a penalty as per RBI guidelines. The penalty amount depends on the tenure and the amount withdrawn.'
    },
    {
      question: 'How do I check my FD balance?',
      answer: 'You can check your FD balance by logging into your dashboard and viewing your account details. The dashboard shows all your active FDs with their current status and maturity dates.'
    },
    {
      question: 'What happens at maturity?',
      answer: 'On maturity, the principal amount along with the accrued interest will be credited to your registered bank account. You will receive a notification before the maturity date.'
    },
    {
      question: 'Is my money safe with UNO Bank?',
      answer: 'Yes, your money is completely safe. UNO Bank is regulated by the Reserve Bank of India (RBI) and all deposits are insured up to ₹5 lakh by the Deposit Insurance and Credit Guarantee Corporation (DICGC).'
    }
  ];

  ngAfterViewInit(): void {
    const faqItems = this.elementRef.nativeElement.querySelectorAll('.faq-item');
    this.animationService.staggerReveal(Array.from(faqItems), 0.1);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
