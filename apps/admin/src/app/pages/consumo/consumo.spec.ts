import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { routes } from '../../app.routes';
import { authGuard } from '../../guards/auth.guard';
import {
  Consumption,
  ConsumptionAlert,
  ConsumptionReportLine,
  PERIODO_DEMONSTRACAO_FIM,
  PERIODO_DEMONSTRACAO_INICIO,
} from '../../models/consumption';
import { HomeComponent } from '../home/home';
import { ConsumoComponent } from './consumo';

const API = 'http://localhost:8081/api/consumption';

const relatorio: ConsumptionReportLine[] = [
  { userId: 1, name: 'Ana Clara', tokenTotal: 3500, hasAlert: false },
  { userId: 2, name: 'Bruno Alves', tokenTotal: 10000, hasAlert: false },
  { userId: 3, name: 'Clara Sem Leituras', tokenTotal: 0, hasAlert: false },
];

function consulta(parcial: Partial<Consumption> & Pick<Consumption, 'userId'>): Consumption {
  return {
    periodStart: PERIODO_DEMONSTRACAO_INICIO,
    periodEnd: PERIODO_DEMONSTRACAO_FIM,
    tokenTotal: 0,
    formattedText: '',
    alerts: [],
    report: relatorio,
    ...parcial,
  };
}

function alertaBruno(): ConsumptionAlert {
  return {
    id: 10,
    userId: 2,
    periodStart: PERIODO_DEMONSTRACAO_INICIO,
    periodEnd: PERIODO_DEMONSTRACAO_FIM,
    tokenTotal: 10000,
    message: 'Bruno Alves consumiu 10000 tokens no período. Consumo alto.',
    createdAt: '2026-09-26T12:00:00',
  };
}

describe('ConsumoComponent', () => {
  let fixture: ComponentFixture<ConsumoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ConsumoComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsumoComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function pedido(userId: number) {
    return httpMock.expectOne(
      (req) =>
        req.method === 'GET' &&
        req.url === API &&
        req.params.get('userId') === String(userId) &&
        req.params.get('periodStart') === PERIODO_DEMONSTRACAO_INICIO &&
        req.params.get('periodEnd') === PERIODO_DEMONSTRACAO_FIM,
    );
  }

  function abrirNoBruno(foco: Consumption = consulta({
    userId: 2,
    tokenTotal: 10000,
    formattedText: 'Bruno Alves consumiu 10000 tokens no período. Consumo alto.',
  })): void {
    fixture.detectChanges();
    pedido(1).flush(consulta({
      userId: 1,
      tokenTotal: 3500,
      formattedText: 'Ana Clara consumiu 3500 tokens no período. Consumo normal.',
    }));
    pedido(2).flush(foco);
    fixture.detectChanges();
  }

  it('mostra os quatro blocos depois de focar Bruno Alves', () => {
    abrirNoBruno(consulta({
      userId: 2,
      tokenTotal: 10000,
      formattedText: 'Bruno Alves consumiu 10000 tokens no período. Consumo alto.',
      alerts: [],
    }));

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Indicador');
    expect(texto).toContain('10000');
    expect(texto).toContain('Bruno Alves consumiu 10000 tokens no período. Consumo alto.');
    expect(texto).toContain('Alertas');
    expect(texto).toContain('Nenhum alerta neste período.');
    expect(texto).toContain('Relatório por usuário');
    expect(texto).toContain('Ana Clara');
    expect(texto).toContain('Clara Sem Leituras');
    expect(fixture.componentInstance.userId).toBe(2);
  });

  it('mostra a lista vazia sem esconder o indicador', () => {
    fixture.detectChanges();
    pedido(1).flush(consulta({
      userId: 1,
      tokenTotal: 3500,
      formattedText: 'Ana Clara consumiu 3500 tokens no período. Consumo normal.',
      alerts: [],
      report: [],
    }));
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('3500');
    expect(texto).toContain('Nenhum alerta neste período.');
    expect(texto).toContain('Nenhum usuário no relatório.');
  });

  it('dispara o alerta, recarrega e mostra uma única linha', () => {
    const comAlerta = consulta({
      userId: 2,
      tokenTotal: 10000,
      formattedText: 'Bruno Alves consumiu 10000 tokens no período. Consumo alto.',
      alerts: [alertaBruno()],
      report: relatorio.map((linha) =>
        linha.userId === 2 ? { ...linha, hasAlert: true } : linha,
      ),
    });
    abrirNoBruno();

    const botao = fixture.nativeElement.querySelector('.primary-button') as HTMLButtonElement;
    botao.click();
    botao.click();

    const posts = httpMock.match(
      (req) => req.method === 'POST' && req.url === `${API}/alerts`,
    );
    expect(posts.length).toBe(1);
    expect(posts[0].request.body).toEqual({
      userId: 2,
      periodStart: PERIODO_DEMONSTRACAO_INICIO,
      periodEnd: PERIODO_DEMONSTRACAO_FIM,
    });
    expect(fixture.componentInstance.disparando).toBe(true);

    posts[0].flush({ alertId: 10, recorded: true });
    pedido(2).flush(comAlerta);
    fixture.detectChanges();

    const alertas = fixture.nativeElement.querySelectorAll('.alert-list li');
    expect(alertas.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Alerta registrado. A lista foi atualizada.');

    (fixture.nativeElement.querySelector('.primary-button') as HTMLButtonElement).click();
    httpMock.expectOne((req) => req.method === 'POST').flush({ alertId: 10, recorded: true });
    pedido(2).flush(comAlerta);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.alert-list li').length).toBe(1);
  });

  it('não acrescenta alerta quando o consumo fica abaixo do limite', () => {
    abrirNoBruno();
    const ana = fixture.nativeElement.querySelector('.user-button') as HTMLButtonElement;
    ana.click();
    pedido(1).flush(consulta({
      userId: 1,
      tokenTotal: 3500,
      formattedText: 'Ana Clara consumiu 3500 tokens no período. Consumo normal.',
      alerts: [],
    }));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.primary-button') as HTMLButtonElement).click();
    const post = httpMock.expectOne((req) => req.method === 'POST');
    expect(post.request.body.userId).toBe(1);
    post.flush({ alertId: null, recorded: false });
    pedido(1).flush(consulta({
      userId: 1,
      tokenTotal: 3500,
      formattedText: 'Ana Clara consumiu 3500 tokens no período. Consumo normal.',
      alerts: [],
    }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Consumo abaixo do limite. Nenhum alerta novo.');
    expect(fixture.nativeElement.textContent).toContain('Nenhum alerta neste período.');
    expect(fixture.nativeElement.querySelector('.alert-list')).toBeNull();
  });

  it('mostra o erro da API e encerra o carregamento sem apagar o token', () => {
    localStorage.setItem('admin_token', 'jwt-operador');
    fixture.detectChanges();
    pedido(1).flush(
      {
        code: 'ORACLE_UNAVAILABLE',
        message: 'Oracle de consumo indisponível. Os demais dados do painel continuam no Postgres.',
      },
      { status: 503, statusText: 'Service Unavailable' },
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.carregando).toBe(false);
    expect(fixture.componentInstance.dados).toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      'Oracle de consumo indisponível. Os demais dados do painel continuam no Postgres.',
    );
    expect(fixture.nativeElement.textContent).not.toContain('Carregando consumo');
    expect(localStorage.getItem('admin_token')).toBe('jwt-operador');
  });

  it('mantém os blocos quando só o disparo falha', () => {
    abrirNoBruno();
    (fixture.nativeElement.querySelector('.primary-button') as HTMLButtonElement).click();
    httpMock.expectOne((req) => req.method === 'POST').flush(
      {
        code: 'ORACLE_UNAVAILABLE',
        message: 'Oracle de consumo indisponível. Os demais dados do painel continuam no Postgres.',
      },
      { status: 503, statusText: 'Service Unavailable' },
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.dados?.tokenTotal).toBe(10000);
    expect(fixture.nativeElement.textContent).toContain('10000');
    expect(fixture.componentInstance.erroDisparo).toContain('Oracle de consumo indisponível');
    expect(fixture.componentInstance.disparando).toBe(false);
  });

  it('carrega de novo quando a API volta a responder', () => {
    fixture.detectChanges();
    pedido(1).flush(
      { code: 'ORACLE_UNAVAILABLE', message: 'Oracle de consumo indisponível.' },
      { status: 503, statusText: 'Service Unavailable' },
    );
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.secondary-button') as HTMLButtonElement).click();
    pedido(1).flush(consulta({
      userId: 1,
      tokenTotal: 3500,
      formattedText: 'Ana Clara consumiu 3500 tokens no período. Consumo normal.',
    }));
    fixture.detectChanges();

    expect(fixture.componentInstance.erro).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Texto formatado');
    expect(fixture.nativeElement.textContent).toContain('3500');
  });

  it('pede o id quando o usuário inicial não existe e consulta o id informado', () => {
    fixture.detectChanges();
    pedido(1).flush(
      { code: 'NOT_FOUND', message: 'Usuário de consumo inexistente.' },
      { status: 404, statusText: 'Not Found' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#id-manual')).not.toBeNull();

    fixture.componentInstance.idManual = 0;
    fixture.componentInstance.tentarComId();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Informe um id de usuário maior que zero.');

    fixture.componentInstance.idManual = 2;
    fixture.componentInstance.tentarComId();
    pedido(2).flush(consulta({
      userId: 2,
      tokenTotal: 10000,
      formattedText: 'Bruno Alves consumiu 10000 tokens no período. Consumo alto.',
    }));
    fixture.detectChanges();

    expect(fixture.componentInstance.userId).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('10000');
  });

  it('mostra a mensagem de sessão no 401 e não remove o token', () => {
    localStorage.setItem('admin_token', 'jwt-operador');
    fixture.detectChanges();
    pedido(1).flush(
      { code: 'UNAUTHORIZED', message: 'Autenticação necessária.' },
      { status: 401, statusText: 'Unauthorized' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Sessão expirada ou inválida. Faça login novamente.',
    );
    expect(localStorage.getItem('admin_token')).toBe('jwt-operador');
  });
});

describe('rota de consumo', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('exige o authGuard', () => {
    const rota = routes.find((item) => item.path === 'admin/consumo');
    expect(rota?.canActivate).toContain(authGuard);
  });

  it('não abre a rota sem JWT', () => {
    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(resultado).toBeInstanceOf(UrlTree);
    expect(String(resultado)).toBe('/login');
  });
});

describe('HomeComponent e o consumo', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('admin_token', 'jwt-operador');
    localStorage.setItem('admin_username', 'operador');

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('aponta para a área de consumo e não chama a API de consumo', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a[href="/admin/consumo"]');
    expect(links.length).toBe(2);

    expect(
      httpMock.match((req) => req.url.includes('/api/consumption')).length,
    ).toBe(0);

    httpMock.expectOne((req) => req.url.includes('/api/knowledge-topics')).flush([]);
    httpMock.expectOne((req) => req.url.includes('/api/educational-tips')).flush([]);
    httpMock.expectOne((req) => req.url.includes('/api/campaigns')).flush([]);
    httpMock.expectOne((req) => req.url.includes('/api/dashboard/stats')).flush({
      registeredUsers: 3,
      aiQuestions: 4,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.conteudos).toBe(0);
    expect(fixture.componentInstance.apiOk).toBe(true);
  });
});
