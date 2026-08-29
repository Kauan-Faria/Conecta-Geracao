
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-conteudos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './conteudos.html',
  styleUrl: './conteudos.css'
})
export class ConteudosComponent {

  busca = '';
  mensagem = '';

  loading = false;
  erro = '';

  podeCriarConteudo = true;

  conteudos = [
    {
      id: '1',
      title: 'Como usar o PIX',
      summary: 'Aprenda como realizar pagamentos e transferências utilizando o PIX.',
      keywords: ['PIX', 'Banco', 'Pagamento'],
      isActive: true
    },
    {
      id: '2',
      title: 'Como criar uma senha segura',
      summary: 'Veja dicas para criar senhas fortes e proteger suas contas.',
      keywords: ['Senha', 'Segurança', 'Internet'],
      isActive: true
    },
    {
      id: '3',
      title: 'Como identificar golpes online',
      summary: 'Aprenda a reconhecer mensagens, links e sites suspeitos.',
      keywords: ['Golpes', 'Internet', 'Segurança'],
      isActive: true
    },
    {
      id: '4',
      title: 'Como fazer uma videochamada',
      summary: 'Aprenda os passos básicos para realizar uma videochamada.',
      keywords: ['Celular', 'Videochamada', 'Tecnologia'],
      isActive: true
    }
  ];

  get conteudosFiltrados() {
    const termo = this.busca
      .toLowerCase()
      .trim();

    if (!termo) {
      return this.conteudos;
    }

    return this.conteudos.filter(conteudo =>
      conteudo.title.toLowerCase().includes(termo) ||
      conteudo.summary.toLowerCase().includes(termo) ||
      conteudo.keywords.some(keyword =>
        keyword.toLowerCase().includes(termo)
      )
    );
  }

  excluir(id: string) {
    this.conteudos = this.conteudos.filter(
      conteudo => conteudo.id !== id
    );

    this.mensagem = 'Conteúdo excluído com sucesso!';

    setTimeout(() => {
      this.mensagem = '';
    }, 3000);
  }
}
