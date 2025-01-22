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
  selectedFile: File | null = null;

  onSend(): void {
    this.messageService
      .sendMessage(this.data.offer.userEmail, this.messageContent, this.data.offer.id)
      .then(() => {
        if (this.selectedFile) {
          this.messageService
          .saveFileForThread(this.selectedFile, this.data.offer.userEmail, this.data.offer.id).subscribe(() => {
            this.dialogRef.close();
          })
        }
      })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
