import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {

  titulo = 'Dashboard';

  usuarios = 128;

  conteudos = 24;

  perguntasIA = 86;

}