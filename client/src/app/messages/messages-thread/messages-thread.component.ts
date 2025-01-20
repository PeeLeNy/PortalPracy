import { Component, ElementRef, inject, input, OnChanges, OnInit, output, SimpleChanges, ViewChild } from '@angular/core';
import { Message } from '../../_models/message';
import { MessageService } from '../../_services/message.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-messages-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-thread.component.html',
  styleUrl: './messages-thread.component.css'
})
export class MessagesThreadComponent implements OnInit, OnChanges {
  @ViewChild('messageForm') messageForm?: NgForm;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  private messageService = inject(MessageService);
  userMail = input.required<string>();
  messagesThreadId = input.required<number>();
  messages: Message[] = [];
  threadTitle = "Brak tytułu";
  mesaggeContent = '';

  ngOnInit(): void {
    this.loadMessages();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userMail'] || changes['messagesThreadId']) {
      this.loadMessages();
    }
  }

  sendMessage() {
    this.messageService.sendMessage(this.userMail(), this.mesaggeContent, this.getThreadId()).subscribe({
      next: message => {
        this.messageForm?.reset();
        this.messages.push(message);
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }
  getThreadId (): number {
    return this.messages[0].messageThreadId;
  }

  loadMessages() {
    this.messageService.getMessageThread(this.userMail(), this.messagesThreadId()).subscribe({
      next: (messages) => {
        this.messages = messages;

        if (messages.length > 0) {
          this.threadTitle = messages[0].messageThread || "Brak tytułu";
        } else {
          this.threadTitle = "Brak tytułu";
        }
      },
      error: (err) => {
        console.error('Błąd podczas ładowania wiadomości', err);
        this.threadTitle = "Brak tytułu";
      }
    });
  }

  scrollToBottom(): void {
    const container = this.chatContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  calculateTimeAgo(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sekund temu`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 2) {
      return `${diffInMinutes} minutę temu`;
    }
    if (diffInMinutes < 5) {
      return `${diffInMinutes} minuty temu`;
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minut temu`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 2) {
      return `${diffInHours} godzinę temu`;
    }
    if (diffInHours < 4) {
      return `${diffInHours} godziny temu`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} godzin temu`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 2) {
      return `${diffInDays} dzień temu`;
    }
    if (diffInDays < 30) {
      return `${diffInDays} dni temu`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 2) {
      return `${diffInMonths} miesiąc temu`;
    }
    if (diffInMonths < 12) {
      return `${diffInMonths} miesięcy temu`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} lat temu`;
  }
}
