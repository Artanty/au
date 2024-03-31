import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SERVER_URL } from '../../../env';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {

    return this.http.post<any>(`${SERVER_URL}/login`, { username, password })
      .pipe(
        tap(response => {
          this.token = response.token;
          if (typeof this.token === 'string') {
            localStorage.setItem('authToken', this.token);
          }
        })
      );
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  isAuthenticated(): boolean {
    // Implement your own logic to determine if the user is authenticated
    // For example, check if the token exists and is not expired
    return this.getToken() !== null;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }
}
