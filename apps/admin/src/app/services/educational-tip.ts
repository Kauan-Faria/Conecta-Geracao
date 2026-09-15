import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  EducationalTip,
  EducationalTipPayload,
} from '../models/educational-tip';

@Injectable({
  providedIn: 'root',
})
export class EducationalTipService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiBaseUrl}/api/educational-tips`;

  getTips(): Observable<EducationalTip[]> {
    return this.http.get<EducationalTip[]>(this.apiUrl);
  }

  createTip(
    payload: EducationalTipPayload,
  ): Observable<EducationalTip> {
    return this.http.post<EducationalTip>(
      this.apiUrl,
      payload,
    );
  }

  updateTip(
    id: string,
    payload: EducationalTipPayload,
  ): Observable<EducationalTip> {
    return this.http.put<EducationalTip>(
      `${this.apiUrl}/${id}`,
      payload,
    );
  }

  deleteTip(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
    );
  }
}