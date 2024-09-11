import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { DynamicComponent } from './components/dynamic/dynamic.component';
import { Login2Component } from './components/login2/login2.component';

@NgModule({
  declarations: [DynamicComponent, AuthComponent, Login2Component],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AuthComponent,
      },
    ]),
  ],
  exports: [AuthComponent],
  providers: [],
})
export class AuthModule {}
