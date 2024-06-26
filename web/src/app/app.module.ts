import { NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { AuthModule } from './auth/auth.module';
import { BehaviorSubject } from 'rxjs';
import { EVENT_BUS, PRODUCT_NAME } from 'typlib';
// import { AUTH_DTO_STRING } from './auth/auth.component';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AuthModule,
    HttpClientModule,
  ],
  providers: [
    { provide: EVENT_BUS, useValue: new BehaviorSubject('') },
    { provide: PRODUCT_NAME, useValue: 'au' },
    // { provide: AUTH_DTO_STRING, useValue: '' },

  ],
  bootstrap: [AppComponent],
  schemas: [],
})

export class AppModule {}

