import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { environment } from '../../environments/environment';
import { Offer } from '../_models/offer';

@Injectable({
  providedIn: 'root'
})
export class OffersService {
 private http = inject(HttpClient);
  private accountService = inject(AccountService);
  baseUrl = environment.apiUrl;

  getOffers () {
    return this.http.get<Offer[]>(this.baseUrl + 'offers', this.getHttpOptions());
  }

  getOffer(id: number) {
    return this.http.get<Offer>(this.baseUrl + 'offers/' + id, this.getHttpOptions());
  }

  createOffer(model: any) {
    return this.http.post<Offer>(this.baseUrl + 'offers/create', model, this.getHttpOptions()).subscribe((response) => {
      window.location.reload(); 
      console.log('Oferta pracy została dodana:', response);
      alert('Oferta została dodana pomyślnie!');

    },
      (error) => {
        console.error('Błąd podczas dodawania oferty pracy:', error);
        alert('Wystąpił błąd podczas dodawania oferty pracy.');
      }
    );
  }

  getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.accountService.currentUser()?.token}`
      })
    };
  }
}
