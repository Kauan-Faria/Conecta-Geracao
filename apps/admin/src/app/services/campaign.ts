import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Campaign,
  CampaignPayload,
} from '../models/campaign';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiBaseUrl}/api/campaigns`;

  getCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl);
  }

  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(
      `${this.apiUrl}/${id}`,
    );
  }

  createCampaign(
    payload: CampaignPayload,
  ): Observable<Campaign> {
    return this.http.post<Campaign>(
      this.apiUrl,
      payload,
    );
  }
}