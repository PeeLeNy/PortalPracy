import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { FormsModule } from '@angular/forms';
import { Message } from '../_models/message';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { MessagesThreadComponent } from "./messages-thread/messages-thread.component";

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [ButtonsModule, FormsModule, PaginationModule, MessagesThreadComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  messageService = inject(MessageService);
  container = "Inbox";
  pageNumber = 1;
  pageSize = 5;
  selectedMessage: Message | null = null;

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container);
    this.selectedMessage = null;
  }

  getRoute(message: Message) {
    if (this.container === "Outbox") return `/messages/${message.messageThreadId, message.recipientMail}`;
    else return `/messages/${message.messageThreadId, message.senderMail}`;
  }

  pageChanged(event: any) {
    if (this.pageNumber !== event.page) {
      this.pageNumber = event.page;
      this.loadMessages();
    }
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

  selectMessage(message: Message) {
    console.log(message)
    this.selectedMessage = message;
  }
  getMailForThread() {
    if (this.container === "Outbox") return this.selectedMessage?.recipientMail;
    else return this.selectedMessage?.senderMail;
  }
}