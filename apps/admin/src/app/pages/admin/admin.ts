import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent {

  sistema = {
    nome: 'ConectaGeração',
    versao: '1.0.0',
    status: 'Operacional'
  };

}