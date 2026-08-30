import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  KnowledgeTopic,
  KnowledgeTopicPayload,
} from '../models/knowledge';

@Injectable({
  providedIn: 'root',
})
export class KnowledgeService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiBaseUrl}/api/knowledge-topics`;

  getTopics(): Observable<KnowledgeTopic[]> {
    return this.http.get<KnowledgeTopic[]>(this.apiUrl);
  }

  getTopicById(id: string): Observable<KnowledgeTopic> {
    return this.http.get<KnowledgeTopic>(`${this.apiUrl}/${id}`);
  }

  createTopic(payload: KnowledgeTopicPayload): Observable<KnowledgeTopic> {
    return this.http.post<KnowledgeTopic>(this.apiUrl, payload);
  }

  deleteTopic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
