
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeamByLeague {
  id: number;
  name: string;
  country: string;
  playersQuantity: number;
  enabled: boolean;
}


export interface DeleteInscripcionesResponse {
  message: string;
  eliminadas: number;
  equipo?: number;
  liga?: number;
}

@Injectable({
  providedIn: 'root'
})
export class Inscripcion {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:5188/api/Inscripcion';

  getTeamsByLeague(leagueId: number): Observable<TeamByLeague[]> {
    return this.http.get<TeamByLeague[]>(
      `${this.apiUrl}/${leagueId}`
    );
  }

  create(leagueId: number, teamId: number): Observable<unknown> {
    return this.http.post(this.apiUrl, {
      league: leagueId,
      team: teamId
    });
  }

  delete(leagueId: number, teamId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${leagueId}/${teamId}`
    );
  }

  deleteByTeam(teamId: number): Observable<DeleteInscripcionesResponse> {
    return this.http.delete<DeleteInscripcionesResponse>(
      `${this.apiUrl}/equipo/${teamId}`
    );
  }

  deleteByLeague(leagueId: number): Observable<DeleteInscripcionesResponse> {
    return this.http.delete<DeleteInscripcionesResponse>(
      `${this.apiUrl}/liga/${leagueId}`
    );
  }
}
