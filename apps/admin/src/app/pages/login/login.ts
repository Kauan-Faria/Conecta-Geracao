import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  AuthService
} from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {

  private authService =
    inject(AuthService);

  private router =
    inject(Router);

  username = '';

  password = '';

  loading = false;

  errorMessage = '';

  async login(): Promise<void> {

    this.errorMessage = '';

    if (
      !this.username ||
      !this.password
    ) {

      this.errorMessage =
        'Preencha usuário e senha.';

      return;

    }

    this.loading = true;

    try {

      await this.authService.login(
        this.username,
        this.password
      );

      await this.router.navigate(
        ['/home']
      );

    } catch (error) {

      console.error(error);

      this.errorMessage =
        'Não foi possível realizar o login. Verifique seus dados.';

    } finally {

      this.loading = false;

    }

  }

}