import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  async login(): Promise<void> {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Preencha usuário e senha.';
      return;
    }

    this.loading = true;

    try {
      await this.authService.login(
        this.username.trim(),
        this.password,
      );
      await this.router.navigate(['/home']);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.errorMessage =
          'Não foi possível realizar o login. Verifique seus dados e se o admin-api está no ar.';
      } else if (error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage =
          'Não foi possível realizar o login. Verifique seus dados.';
      }
    } finally {
      this.loading = false;
    }
  }
}
