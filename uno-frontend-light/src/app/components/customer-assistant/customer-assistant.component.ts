import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiClientService } from '../../services/api-client.service';

interface ChatMessage { role: 'user' | 'assistant'; text: string; }

@Component({
  selector: 'app-customer-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-assistant.component.html',
  styleUrl: './customer-assistant.component.scss',
})
export class CustomerAssistantComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiClient = inject(ApiClientService);
  private readonly endpoint = 'http://127.0.0.1:8091';

  readonly available = signal(false);
  readonly checking = signal(true);
  readonly sending = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  draft = '';

  ngOnInit(): void {
    this.checkAvailability();
  }

  checkAvailability(): void {
    this.checking.set(true);
    if (!this.auth.hasRole('CUSTOMER')) {
      this.checking.set(false);
      return;
    }
    this.http.get(`${this.endpoint}/health`).pipe(timeout(5000)).subscribe({
      next: () => { this.available.set(true); this.checking.set(false); },
      error: () => { this.available.set(false); this.checking.set(false); },
    });
  }

  send(): void {
    const message = this.draft.trim();
    if (!message || this.sending() || !this.available() || !this.auth.hasRole('CUSTOMER')) return;
    const token = this.apiClient.getToken();
    if (!token) {
      this.messages.update(items => [...items, { role: 'assistant', text: 'Your sign-in session has expired. Please sign in again to continue.' }]);
      return;
    }
    const history = this.messages().slice(-12).map(item => ({ role: item.role, content: item.text }));
    this.messages.update(items => [...items, { role: 'user', text: message }]);
    this.draft = '';
    this.sending.set(true);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.post<{ reply: string }>(`${this.endpoint}/api/assistant/chat`, { message, history }, { headers }).pipe(timeout(40000)).subscribe({
      next: result => {
        this.messages.update(items => [...items, { role: 'assistant', text: result.reply }]);
        this.sending.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const text = error.status === 401
          ? 'Your sign-in session has expired. Please sign in again to continue.'
          : error.status === 403
            ? 'This assistant is available to customer accounts. Please use customer support if you need help.'
            : error.status === 503
              ? 'The assistant service is temporarily unavailable. Please try again shortly.'
              : 'I couldn’t get a response just now. Please try again in a moment.';
        this.messages.update(items => [...items, {
          role: 'assistant',
          text,
        }]);
        this.sending.set(false);
      },
    });
  }
}
