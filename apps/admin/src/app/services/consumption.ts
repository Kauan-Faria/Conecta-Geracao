import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Consumption,
  PERIODO_DEMONSTRACAO_FIM,
  PERIODO_DEMONSTRACAO_INICIO,
  RegisterAlertResponse,
} from '../models/consumption';

/**
 * Consulta e disparo de alerta no admin-api.
 * O browser não fala com o Oracle; o JWT segue no interceptor.
 */
@Injectable({
  providedIn: 'root',
})
export class ConsumptionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/api/consumption`;

  consult(userId: number): Observable<Consumption> {
    const params = new HttpParams()
      .set('userId', String(userId))
      .set('periodStart', PERIODO_DEMONSTRACAO_INICIO)
      .set('periodEnd', PERIODO_DEMONSTRACAO_FIM);

    return this.http.get<Consumption>(this.apiUrl, { params });
  }

  registerAlert(userId: number): Observable<RegisterAlertResponse> {
    return this.http.post<RegisterAlertResponse>(`${this.apiUrl}/alerts`, {
      userId,
      periodStart: PERIODO_DEMONSTRACAO_INICIO,
      periodEnd: PERIODO_DEMONSTRACAO_FIM,
    });
  }
}
