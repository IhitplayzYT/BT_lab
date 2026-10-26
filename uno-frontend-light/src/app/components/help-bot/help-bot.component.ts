import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpBotService, HelpBotStep, HelpBotOption } from '../../services/help-bot.service';

@Component({
  selector: 'app-help-bot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-bot.component.html',
  styleUrls: ['./help-bot.component.scss']
})
export class HelpBotComponent {
  private helpBotService = inject(HelpBotService);

  currentStep: HelpBotStep | null = null;
  history: HelpBotStep[] = [];
  solution: string | null = null;
  isComplete = false;

  ngOnInit(): void {
    this.reset();
  }

  reset(): void {
    this.currentStep = this.helpBotService.getRootStep();
    this.history = [this.currentStep];
    this.solution = null;
    this.isComplete = false;
  }

  selectOption(option: HelpBotOption): void {
    if (option.solution) {
      // This is a solution - show it
      this.solution = option.solution;
      this.isComplete = true;
    } else if (option.nextStep) {
      // Navigate to next step
      const nextStep = this.helpBotService.getStep(option.nextStep);
      if (nextStep) {
        this.currentStep = nextStep;
        this.history.push(nextStep);
        this.solution = null;
        this.isComplete = false;
      }
    }
  }

  goBack(): void {
    if (this.history.length > 1) {
      this.history.pop();
      this.currentStep = this.history[this.history.length - 1];
      this.solution = null;
      this.isComplete = false;
    }
  }

  startOver(): void {
    this.reset();
  }
}
