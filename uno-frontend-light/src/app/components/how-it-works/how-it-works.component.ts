import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [TranslatePipe, CommonModule, IconComponent],
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent {
  steps = [
    {
      number: '01',
      icon: 'user-plus',
      title: 'Create Account',
      description: 'Sign up in minutes with our secure registration process. Verify your identity and you\'re ready to go.'
    },
    {
      number: '02',
      icon: 'layers',
      title: 'Choose Your FD',
      description: 'Select from our range of FD products with competitive rates and flexible tenures that suit your goals.'
    },
    {
      number: '03',
      icon: 'trending-up',
      title: 'Deposit & Grow',
      description: 'Make your deposit and watch your wealth grow with guaranteed returns and compound interest.'
    }
  ];
}
