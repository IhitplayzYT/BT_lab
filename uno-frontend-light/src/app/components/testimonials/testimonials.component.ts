import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent {
  testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Business Owner',
      content: 'UNO Bank has transformed how I manage my investments. The competitive rates and seamless interface make it my go-to for fixed deposits.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'Software Engineer',
      content: 'I love the transparency and ease of use. The FD calculator helped me plan my investments perfectly. Highly recommended!',
      rating: 5
    },
    {
      name: 'Amit Kumar',
      role: 'Retired Teacher',
      content: 'As a senior citizen, I appreciate the special rates and excellent customer service. UNO Bank truly cares about its customers.',
      rating: 5
    }
  ];

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
