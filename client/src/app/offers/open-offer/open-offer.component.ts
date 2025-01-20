import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Offer } from '../../_models/offer';
import { MessagesSendComponent } from '../../messages/messages-send/messages-send.component';

@Component({
  selector: 'app-open-offer',
  standalone: true,
  imports: [],
  templateUrl: './open-offer.component.html',
  styleUrl: './open-offer.component.css'
})
export class OpenOfferComponent {
  public dialogRef: MatDialogRef<OpenOfferComponent> = inject(MatDialogRef<OpenOfferComponent>)
  public data: { offer: Offer } = inject(MAT_DIALOG_DATA);
  private dialog = inject(MatDialog);
  
  onCancel(): void {
    this.dialogRef.close();
  }
  onApply(): void {
    // Zamykamy bieżący dialog
    this.dialogRef.close();

    // Otwieramy nowy dialog z danymi
    this.dialog.open(MessagesSendComponent, {
      width: '600px',
      data: { offer: this.data.offer }
    });
  }

}
