import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresInSeconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly tokenKey = 'admin_token';
  private readonly usernameKey = 'admin_username';
  private readonly roleKey = 'admin_role';

  private readonly loginUrl = `${environment.apiBaseUrl}/api/auth/login`;

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(this.loginUrl, { username, password }),
      );

      if (!response?.token) {
        throw new Error('Resposta de login inválida');
      }

      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.usernameKey, response.username);
      localStorage.setItem(this.roleKey, response.role);

      return response;
    } catch (error) {
      throw new Error(this.mapLoginError(error));
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.roleKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private mapLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Não foi possível conectar ao admin-api. Verifique se a API está em localhost:8081.';
      }
      if (error.status === 401 || error.status === 403) {
        return 'Usuário ou senha inválidos.';
      }
      const apiMessage =
        typeof error.error === 'object' &&
        error.error &&
        'message' in error.error
          ? String((error.error as { message?: string }).message)
          : null;
      return apiMessage || 'Falha ao autenticar no painel administrativo.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Falha ao autenticar no painel administrativo.';
  }
}
