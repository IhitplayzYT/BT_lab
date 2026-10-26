import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  startInvesting(): void {
    this.router.navigate([this.auth.isLoggedIn() ? '/apply-fd' : '/signup']);
  }

  openCalculator(): void {
    this.router.navigate(['/calculator']);
  }
}
