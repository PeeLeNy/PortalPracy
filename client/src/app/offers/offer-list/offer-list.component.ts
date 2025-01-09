import { Component, inject, OnInit } from '@angular/core';
import { OfferCardComponent } from "../offer-card/offer-card.component";
import { MatDialog } from '@angular/material/dialog';
import { CreateJobOfferDialogComponent } from '../create-job-offer-dialog/create-job-offer-dialog.component';
import { OffersService } from '../../_services/offers.service';
import { Offer } from '../../_models/offer';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [OfferCardComponent],
  templateUrl: './offer-list.component.html',
  styleUrl: './offer-list.component.css'
})
export class OfferListComponent implements OnInit {
  private offerService = inject(OffersService);
  offers: Offer[] = [];
  private dialog = inject(MatDialog);;

  ngOnInit():void {
    this.loadMembers();
  }

  loadMembers() {
    this.offerService.getOffers().subscribe({
      next: offers => this.offers = offers
    });
  }
  addOffer() {
    const dialogRef = this.dialog.open(CreateJobOfferDialogComponent, {
      width: '800px', 
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.offerService.createOffer(result);
      }
    });
  }
  openOffer(offer: Offer) {
    const dialogRef = this.dialog.open(CreateJobOfferDialogComponent, {
      width: '800px',
      data: {
        offer: offer
      }
    });
  }

}
