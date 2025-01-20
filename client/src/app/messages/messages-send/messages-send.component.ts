import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Offer } from '../../_models/offer';
import { MessageService } from '../../_services/message.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './messages-send.component.html',
  styleUrls: ['./messages-send.component.css']
})
export class MessagesSendComponent {
  public dialogRef: MatDialogRef<MessagesSendComponent> = inject(MatDialogRef<MessagesSendComponent>);
  public data: { offer: Offer } = inject(MAT_DIALOG_DATA);
  messageService = inject(MessageService);

  messageContent: string = '';

  onSend(): void {
    this.messageService
    .sendMessage(this.data.offer.userEmail, this.messageContent, this.data.offer.id)
    .subscribe({
      next: (message) =>  this.dialogRef.close(),
      error: (err) => console.error('Błąd podczas wysyłania wiadomości:', err),
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
