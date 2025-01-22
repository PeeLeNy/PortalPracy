import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Message } from '../_models/message';
import { PaginatedResult } from '../_models/pagination';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';
import { AccountService } from './account.service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubsUrl;
  private http = inject(HttpClient);
  private hubConnection?: HubConnection;
  paginatedResult = signal<PaginatedResult<Message[]> | null>(null);
  private accountService = inject(AccountService);
  messageThread = signal<Message[]>([]);

  createHubConnection(user: User, otherUserMail: string, threadId: number) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}message?user=${otherUserMail}&threadId=${threadId}`, {
          accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();
    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('ReceiveMessageThread', messages => {
      this.messageThread.set(messages);
    });
    this.hubConnection.on('NewMessage', message => {
      this.messageThread.update(messages => [... messages, message]);
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));
    }
  }

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

  async sendMessage(userMail: string, content: string, offerId: number) {
    return this.hubConnection?.invoke('SendMessage',{recipientEmail: userMail, content, offerId});
  }

  // file methods
  saveFileForThread(file: File, userEmail: string, threadId: number) {
    const formData = new FormData();
    
    // Dodaj plik do FormData
    formData.append('file', file);
    
    // Dodaj dodatkowe parametry do FormData
    formData.append('userEmail', userEmail);
    formData.append('threadId', threadId.toString());
  
    // Wyślij żądanie POST do API
    return this.http.post(this.baseUrl + 'messages/upload-file', formData, {
      observe: 'response', ...this.getHttpOptions()
    });
  }

  downloadFile(threadId: string): void {
    const options = {
      ...this.getHttpOptions(),
      observe: 'response' as const,
      responseType: 'blob' as 'json'
    };
    this.http.get(`${this.baseUrl}messages/get-file/${threadId}`, options).subscribe({
      next: (response) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = 'plik.pdf';
        
        if (contentDisposition) {
          const utf8FilenameRegex = /filename\*=(?:[^\']*'')?([^;]+)/i;
          const fallbackFilenameRegex = /filename="?([^"]+)"?/i;
          const utf8Match = contentDisposition.match(utf8FilenameRegex);
          if (utf8Match && utf8Match[1]) {
            try {
              fileName = decodeURIComponent(utf8Match[1]);
            } catch {
              fileName = utf8Match[1];
            }
          } 
          else {
            const fallbackMatch = contentDisposition.match(fallbackFilenameRegex);
            if (fallbackMatch && fallbackMatch[1]) {
              fileName = fallbackMatch[1];
            }
          }
        }

        const blob = response.body as Blob;

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Błąd pobierania pliku:', err);
        alert('Nie udało się pobrać pliku.');
      }
    });
  }

  getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.accountService.currentUser()?.token}`
      })
    };
  }
}
