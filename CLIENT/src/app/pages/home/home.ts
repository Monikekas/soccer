
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Leagues } from '../../services/leagues';
import { Inscripcion } from '../../services/inscripciones';

interface League {
  id: number;
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
}

interface TeamByLeague {
  id: number;
  name: string;
  country: string;
  playersQuantity: number;
  enabled: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private leaguesService = inject(Leagues);
  private inscripcionService = inject(Inscripcion);
  private cdr = inject(ChangeDetectorRef);
  leagues: League[] = [];
  selectedLeague: League | null = null;
  teams: TeamByLeague[] = [];

  loadingLeagues = false;
  loadingTeams = false;
  errorLeagues = false;
  errorTeams = false;

  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.loadLeagues();
  }

  loadLeagues(): void {
  this.loadingLeagues = true;
  this.errorLeagues = false;

  this.leaguesService.getAll().subscribe({
    next: (response) => {
      console.log('Ligas recibidas:', response);

      this.leagues = response ?? [];
      this.loadingLeagues = false;

      if (this.leagues.length > 0) {
        this.selectLeague(this.leagues[0]);
      } else {
        this.selectedLeague = null;
        this.teams = [];
      }

      // Fuerza la actualización de la vista.
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error al consultar las ligas:', error);

      this.loadingLeagues = false;
      this.errorLeagues = true;
      this.leagues = [];
      this.selectedLeague = null;
      this.teams = [];

      this.cdr.detectChanges();
    }
  });
}

  selectLeague(league: League): void {
    this.selectedLeague = league;
    this.teams = [];
    this.loadTeamsByLeague(league.id);
  }

  
loadTeamsByLeague(leagueId: number): void {
  this.loadingTeams = true;
  this.errorTeams = false;
  this.teams = [];

  this.inscripcionService.getTeamsByLeague(leagueId).subscribe({
    next: (response) => {
      console.log('Equipos recibidos:', response);

      this.teams = response ?? [];
      this.loadingTeams = false;

      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error al consultar los equipos:', error);

      this.teams = [];
      this.loadingTeams = false;
      this.errorTeams = true;

      this.cdr.detectChanges();
    }
  });
}


  getTeamColor(index: number): string {
    const colors = [
      '#7c3aed',
      '#db2777',
      '#a855f7',
      '#e11d48',
      '#6d28d9',
      '#be185d'
    ];

    return colors[index % colors.length];
  }
}
