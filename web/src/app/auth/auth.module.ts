import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { Login2Component } from './components/login2/login2.component';
import { DynamicComponent } from './components/dynamic/dynamic.component'

@NgModule({
  declarations: [
    DynamicComponent,
    AuthComponent,
    Login2Component
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
          path: '',
          component: AuthComponent
      }
  ]),
  ],
  exports: [
    AuthComponent
  ],
  providers: []
})
export class AuthModule { }
