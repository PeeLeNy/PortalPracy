import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OfferListComponent } from './offers/offer-list/offer-list.component';
import { OfferDetailComponent } from './offers/offer-detail/offer-detail.component';
import { MessagesComponent } from './messages/messages.component';
import { authGuard } from './_guards/auth.guard';
import { TestErrorsComponent } from './errors/test-errors/test-errors.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            {path: 'offers', component: OfferListComponent},
            {path: 'offers/:id', component: OfferDetailComponent},
            {path: 'messages', component: MessagesComponent}
        ]
    },
    {path: 'errors', component: TestErrorsComponent},
    {path: '**', component: HomeComponent, pathMatch: 'full'},
];
