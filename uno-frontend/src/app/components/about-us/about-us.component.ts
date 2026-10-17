import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements AfterViewInit {
  private animationService = inject(AnimationService);
  private elementRef = inject(ElementRef);

  values = [
    {
      icon: '🌱',
      title: 'Environmental Stewardship',
      description: 'At UNO Bank, we believe that financial growth and environmental responsibility go hand in hand. We are committed to reducing our carbon footprint through paperless operations, green investments, and sustainable banking practices. Every FD you open contributes to our green initiatives, including tree plantation programs and renewable energy projects.'
    },
    {
      icon: '🤝',
      title: 'Customer-First Philosophy',
      description: 'Our customers are at the heart of everything we do. We prioritize your financial well-being by offering transparent products, no hidden fees, and personalized support. Our dedicated relationship managers are available 24/7 to assist you with your investment decisions, ensuring you always make informed choices that align with your financial goals.'
    },
    {
      icon: '🏛️',
      title: 'RBI Compliance & Trust',
      description: 'UNO Bank operates under the strict regulatory framework of the Reserve Bank of India. We adhere to all banking regulations, maintain statutory liquidity ratios, and undergo regular audits to ensure the highest standards of financial integrity. Your deposits are insured up to ₹5 lakh under the DICGC scheme, providing you with complete peace of mind.'
    },
    {
      icon: '💎',
      title: 'Unwavering Transparency',
      description: 'We believe in complete transparency in all our dealings. From interest rates to fees, from terms to conditions - everything is clearly communicated upfront. No hidden charges, no surprise deductions, no fine print traps. Our detailed statements and real-time dashboard give you complete visibility into your investments at all times.'
    },
    {
      icon: '🚀',
      title: 'Innovation-Driven Banking',
      description: 'We combine traditional banking values with cutting-edge technology. Our AI-powered investment advisors, instant FD opening process, and seamless digital experience represent the future of banking. We continuously innovate to make your banking experience faster, smarter, and more convenient while maintaining the security and trust you expect from a bank.'
    },
    {
      icon: '🌍',
      title: 'Social Responsibility',
      description: 'Beyond profits, we measure our success by the positive impact we create in society. Through our CSR initiatives, we support education for underprivileged children, healthcare programs in rural areas, and financial literacy campaigns. When you bank with UNO, you become part of a larger movement that is working to build a better, more equitable society.'
    }
  ];

  stats = [
    { value: '₹5000Cr+', label: 'Deposits Managed' },
    { value: '1M+', label: 'Happy Customers' },
    { value: '15+', label: 'Years of Trust' },
    { value: '99.9%', label: 'Uptime Guarantee' }
  ];

  ngAfterViewInit(): void {
    const sections = this.elementRef.nativeElement.querySelectorAll('.about-section');
    this.animationService.staggerReveal(Array.from(sections), 0.15);
    
    const statCards = this.elementRef.nativeElement.querySelectorAll('.stat-card');
    this.animationService.staggerReveal(Array.from(statCards), 0.1);
  }
}
