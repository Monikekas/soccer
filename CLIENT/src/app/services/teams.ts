
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Team {
  id: number;
  name: string;
  country: string;
  playersQuantity: number;
  enabled: boolean;
}

export interface CreateTeam {
  name: string;
  country: string;
  playersQuantity: number;
  enabled: boolean;
}

export interface TeamMatch {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class Teams {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5188/api/Teams';

  getAll(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  create(team: CreateTeam): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, team);
  }

  update(id: number, team: CreateTeam): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, team);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(name: string, excludeId?: number): Observable<TeamMatch[]> {
    let params = new HttpParams().set('name', name);

    if (excludeId != null) {
      params = params.set('excludeId', excludeId);
    }

    return this.http.get<TeamMatch[]>(
      `${this.apiUrl}/search`,
      { params }
    );
  }
}

