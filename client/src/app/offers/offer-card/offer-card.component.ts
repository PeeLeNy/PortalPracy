import { Component, input } from '@angular/core';
import { Member } from '../../_models/member';
import { Offer } from '../../_models/offer';

@Component({
  selector: 'app-offer-card',
  standalone: true,
  imports: [],
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.css'
})
export class OfferCardComponent {
  offer = input.required<Offer>();
}
