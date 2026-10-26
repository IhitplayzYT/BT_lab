import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { HeroComponent } from '../hero/hero.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { FeaturesComponent } from '../features/features.component';
import { HowItWorksComponent } from '../how-it-works/how-it-works.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { SecurityComponent } from '../security/security.component';
import { FaqComponent } from '../faq/faq.component';
import { FooterComponent } from '../footer/footer.component';
import { StarBackgroundComponent } from '../star-background/star-background.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    AboutUsComponent,
    FeaturesComponent,
    HowItWorksComponent,
    TestimonialsComponent,
    SecurityComponent,
    FaqComponent,
    FooterComponent,
    StarBackgroundComponent
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {}
