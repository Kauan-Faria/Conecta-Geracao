import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  KnowledgeTopic
} from '../models/knowledge';

@Injectable({
  providedIn: 'root',
})
export class KnowledgeService {

  private http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8081/api/knowledge-topics';

  getTopics(): Observable<KnowledgeTopic[]> {

    return this.http.get<KnowledgeTopic[]>(
      this.apiUrl
    );

  }

  getTopicById(
    id: string
  ): Observable<KnowledgeTopic> {

    return this.http.get<KnowledgeTopic>(
      `${this.apiUrl}/${id}`
    );

  }

  deleteTopic(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );

  }
}