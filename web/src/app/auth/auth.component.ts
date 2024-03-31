import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { SERVER_URL } from '../../../env';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  constructor (
    @Inject(HttpClient) private http: HttpClient
  ) {}

  test () {
    this.http.post(`${SERVER_URL}/test`, {data: 11}).subscribe(res => {
      console.log(res)
    })
  }
}
