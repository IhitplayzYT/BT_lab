import { Component, inject, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent implements AfterViewInit {
  private animationService = inject(AnimationService);
  private elementRef = inject(ElementRef);

  steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up in minutes with our secure registration process. Verify your identity and you\'re ready to go.'
    },
    {
      number: '02',
      title: 'Choose Your FD',
      description: 'Select from our range of FD products with competitive rates and flexible tenures that suit your goals.'
    },
    {
      number: '03',
      title: 'Deposit & Grow',
      description: 'Make your deposit and watch your wealth grow with guaranteed returns and compound interest.'
    }
  ];

  ngAfterViewInit(): void {
    const steps = this.elementRef.nativeElement.querySelectorAll('.step-card');
    this.animationService.staggerReveal(Array.from(steps), 0.2);
  }
}
