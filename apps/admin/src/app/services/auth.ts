import { Injectable } from '@angular/core';

interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresInSeconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly tokenKey = 'admin_token';
  private readonly usernameKey = 'admin_username';

  async login(
    username: string,
    password: string
  ): Promise<LoginResponse> {

    // Login mockado para a primeira entrega
    if (username !== 'admin' || password !== 'admin123') {
      throw new Error('Usuário ou senha inválidos');
    }

    const response: LoginResponse = {
      token: 'token-mock-admin',
      username: 'admin',
      role: 'ADMIN',
      expiresInSeconds: 3600,
    };

    localStorage.setItem(
      this.tokenKey,
      response.token
    );

    localStorage.setItem(
      this.usernameKey,
      response.username
    );

    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
  }

  getCurrentUser(): string | null {
    return localStorage.getItem(
      this.usernameKey
    );
  }

  async getToken(): Promise<string | null> {
    return localStorage.getItem(
      this.tokenKey
    );
  }
}