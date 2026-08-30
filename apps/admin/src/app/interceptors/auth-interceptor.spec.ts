import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            getToken: () => 'test-token',
          },
        },
      ],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should attach bearer token', () => {
    const req = new HttpRequest('GET', 'http://localhost:8081/api/knowledge-topics');
    interceptor(req, (outgoing) => {
      expect(outgoing.headers.get('Authorization')).toBe('Bearer test-token');
      return of(new HttpResponse({ status: 200 }));
    }).subscribe();
  });
});
