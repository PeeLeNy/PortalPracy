import { AfterViewChecked, Component, ElementRef, inject, input, OnChanges, OnDestroy, OnInit, output, SimpleChanges, ViewChild } from '@angular/core';
import { Message } from '../../_models/message';
import { MessageService } from '../../_services/message.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-messages-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-thread.component.html',
  styleUrl: './messages-thread.component.css'
})
export class MessagesThreadComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
  @ViewChild('messageForm') messageForm?: NgForm;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
   messageService = inject(MessageService);
  private accountService = inject(AccountService);
  userMail = input.required<string>();
  messagesThreadId = input.required<number>();
  messagesThreadTitle = input.required<string>();
  mesaggeContent = '';
  threadKey = '';

  autoScroll = true;
  private previousMessageCount = 0;

  ngOnInit(): void {
    setTimeout(() => this.scrollToBottom(), 100);
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.messageService.stopHubConnection();
    if (changes['userMail'] || changes['messagesThreadId']) {
      this.loadMessages();
    }
    if (this.messagesThreadId !== null && this.accountService.currentUser()) {
      this.threadKey = this.generateThreadKey(this.userMail(), this.accountService.currentUser()?.email, this.messagesThreadId());
    }
  }

  sendMessage() {
    this.messageService.sendMessage(this.userMail(), this.mesaggeContent, this.messagesThreadId()).then(() => {
      this.messageForm?.reset();
      setTimeout(() => this.scrollToBottom(), 0);
    })
  }

  loadMessages() {
    const user = this.accountService.currentUser();
    if (!user) return;
    this.messageService.createHubConnection(user, this.userMail(), this.messagesThreadId())
  }
  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  scrollToBottom(): void {
    const container = this.chatContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  generateThreadKey(senderEmail: string, recipientEmail: string = "", threadId: number): string {
    const stringCompare = senderEmail.localeCompare(recipientEmail) < 0;
  
    const threadKey = stringCompare
      ? `${senderEmail}-${recipientEmail}-${threadId}`
      : `${recipientEmail}-${senderEmail}-${threadId}`;
  
    return threadKey;
  }
  fileDownload() {
    this.messageService.downloadFile(this.threadKey);
  }

  ngAfterViewChecked(): void {
    const currentCount = this.messageService.messageThread().length;
    if (currentCount !== this.previousMessageCount) {
      if (this.autoScroll) {
        this.scrollToBottom();
      }
      this.previousMessageCount = currentCount;
    }
  }

  onScroll(): void {
    const container = this.chatContainer.nativeElement;
    const threshold = 50; 
    const position = container.scrollHeight - container.scrollTop - container.clientHeight;
    this.autoScroll = position < threshold;
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
