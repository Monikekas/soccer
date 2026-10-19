import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { League } from '../pages/dashboard/dashboard';

export interface CreateLeague {
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Leagues {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5188/api/Leagues';

  getAll(): Observable<League[]> {
    return this.http.get<League[]>(this.apiUrl);
  }

  create(league: CreateLeague): Observable<League> {
    return this.http.post<League>(this.apiUrl, league);
  }

  update(id: number, league: CreateLeague): Observable<League> {
    return this.http.put<League>(`${this.apiUrl}/${id}`, league);
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
