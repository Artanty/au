import { HttpClientModule } from '@angular/common/http';
import { Inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { BusEvent, EVENT_BUS, HOST_NAME } from 'typlib';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { TestApiModule } from './test-api/test-api.module';

export const defaultEventBusData: BusEvent = {
  from: 'AU',
  to: 'AU',
  event: 'authStrategy',
  payload: {
    authStrategy: 'backend',
    checkBackendUrl: `${process.env['AU_BACK_URL']}/getUpdates`,
    signUpByDataUrl: `${process.env['AU_BACK_URL']}/auth-token/signup`,
    signInByDataUrl: `${process.env['AU_BACK_URL']}/auth-token/login`,
    signInByTokenUrl: "",
    status: 'init',
  },
};

export const standAloneEventBusData: BusEvent = {
  from: 'AU',
  to: 'AU',
  event: 'authStrategy',
  payload: {
    authStrategy: 'backend',
    checkBackendUrl: 'http://localhost:3600/check',
    signInByDataUrl: 'http://localhost:3600/login',
    signInByTokenUrl: 'http://localhost:3600/loginByToken',
    status: 'init',
  },
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AuthModule,
    HttpClientModule,
    // TestApiModule,
  ],
  providers: [
    { provide: EVENT_BUS, useValue: new BehaviorSubject('') },
    { provide: HOST_NAME, useValue: 'AU' },
    {
      provide: 'components',
      useValue: {},
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [],
})
export class AppModule {
  constructor(
    @Inject(EVENT_BUS) private readonly eventBus$: BehaviorSubject<BusEvent>
  ) {
    this.eventBus$.next(standAloneEventBusData);
  }
}
