import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  expandedIndex = signal<number | null>(null);

  faqs = [
    {
      question: 'What is the minimum deposit amount for an FD?',
      answer: 'The minimum deposit amount for opening a Fixed Deposit account with UNO Bank is ₹10,000. This applies across all our FD products.'
    },
    {
      question: 'What are the tenure options available?',
      answer: 'We offer flexible tenure options ranging from 6 months to 120 months (10 years). You can choose the tenure that best suits your financial goals.'
    },
    {
      question: 'How is the interest calculated on my FD?',
      answer: 'Interest is calculated based on the principal amount, tenure, and applicable interest rate. We offer both simple and compound interest options, with compound interest typically yielding higher returns.'
    },
    {
      question: 'Can I withdraw my FD before maturity?',
      answer: 'Premature withdrawal is possible but may attract a penalty. The penalty amount depends on the tenure and how early you withdraw. Please check our terms for specific details.'
    },
    {
      question: 'Is my investment insured?',
      answer: 'Yes, your FD investments with UNO Bank are insured up to ₹5,00,000 per depositor as per DICGC guidelines, providing you with additional security.'
    }
  ];

  toggle(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }
}
