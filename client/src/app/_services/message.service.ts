import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Message } from '../_models/message';
import { PaginatedResult } from '../_models/pagination';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl
  private http = inject(HttpClient);
  paginatedResult = signal<PaginatedResult<Message[]> | null>(null);
  private accountService = inject(AccountService);

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = setPaginationHeaders(pageNumber, pageSize);

    params = params.append('Container', container);

    return this.http.get<Message[]>(this.baseUrl + 'messages', { observe: 'response', params, ...this.getHttpOptions() })
      .subscribe({
        next: response => setPaginatedResponse(response, this.paginatedResult)
      });
  }

  getMessageThread(userMail: string, threadId: number) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + userMail + '/' + threadId, this.getHttpOptions());
  }

  sendMessage(userMail: string, content: string, offerId: number) {
    return this.http.post<Message>(this.baseUrl + 'messages', {recipientEmail: userMail, content, offerId}, this.getHttpOptions())
  }
  getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.accountService.currentUser()?.token}`
      })
    };
  }
}
