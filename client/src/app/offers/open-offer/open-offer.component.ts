import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Offer } from '../../_models/offer';

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
  
  onCancel(): void {
    this.dialogRef.close();
  }

}
