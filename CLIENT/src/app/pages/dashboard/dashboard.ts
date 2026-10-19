
import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { finalize, switchMap } from 'rxjs';

import { LeagueForm } from '../../components/league-form/league-form';
import { TeamForm } from '../../components/team-form/team-form';

import { Leagues } from '../../services/leagues';
import { Teams } from '../../services/teams';
import { Inscripcion } from '../../services/inscripciones';

import type { TeamByLeague } from '../../services/inscripciones';

export interface League {
  id: number;
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private dialog = inject(MatDialog);
  private leaguesService = inject(Leagues);
  private teamsService = inject(Teams);
  private inscripcionService = inject(Inscripcion);
  private cdr = inject(ChangeDetectorRef);

  leagues: League[] = [];
  teams: TeamByLeague[] = [];

  selectedLeague: League | null = null;

  loadingLeagues = false;
  loadingTeams = false;
  removingTeamId: number | null = null;
  removingLeagueId: number | null = null;
  deletingTeamId: number | null = null;

  ngOnInit(): void {
    this.loadLeagues();
  }

  loadLeagues(): void {
    this.loadingLeagues = true;

    this.leaguesService.getAll()
      .pipe(
        finalize(() => {
          this.loadingLeagues = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: data => {
          this.leagues = data ?? [];

          if (this.selectedLeague) {
            const updatedLeague = this.leagues.find(
              league => league.id === this.selectedLeague!.id
            );

            if (updatedLeague) {
              this.selectedLeague = updatedLeague;
              this.loadTeamsByLeague(updatedLeague.id);
              return;
            }
          }

          if (this.leagues.length > 0) {
            this.selectLeague(this.leagues[0]);
          } else {
            this.selectedLeague = null;
            this.teams = [];
          }
        },
        error: error => {
          console.error('Error al consultar las ligas:', error);
        }
      });
  }

  loadTeamsByLeague(leagueId: number): void {
    this.loadingTeams = true;
    this.teams = [];

    this.inscripcionService
      .getTeamsByLeague(leagueId)
      .pipe(
        finalize(() => {
          this.loadingTeams = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: teams => {
          this.teams = teams ?? [];
        },
        error: error => {
          console.error(
            'Error al consultar los equipos de la liga:',
            error
          );
        }
      });
  }

  selectLeague(league: League): void {
    this.selectedLeague = league;
    this.loadTeamsByLeague(league.id);
  }

  addLeague(): void {
    this.dialog.open(LeagueForm, {
      width: '480px',
      maxWidth: '95vw'
    }).afterClosed().subscribe(result => {
      if (!result) return;

      this.leaguesService.create(result).subscribe({
        next: () => this.loadLeagues(),
        error: error => {
          console.error('Error al crear la liga:', error);
          console.error('Detalle:', error.error);
        }
      });
    });
  }

  editLeague(league: League): void {
    this.dialog.open(LeagueForm, {
      width: '480px',
      maxWidth: '95vw',
      data: { ...league }
    }).afterClosed().subscribe(result => {
      if (!result) return;

      this.leaguesService.update(league.id, result).subscribe({
        next: () => this.loadLeagues(),
        error: error => {
          console.error('Error al editar la liga:', error);
          console.error('Detalle:', error.error);
        }
      });
    });
  }

  addTeam(): void {
    if (!this.selectedLeague) {
      window.alert('Selecciona una liga primero.');
      return;
    }

    const leagueId = this.selectedLeague.id;

    this.dialog.open(TeamForm, {
      width: '480px',
      maxWidth: '95vw'
    }).afterClosed().subscribe(result => {
      if (!result) return;

      if (result.isNew) {
        this.teamsService.create({
          name: result.name,
          country: result.country,
          playersQuantity: result.playersQuantity,
          enabled: result.enabled
        }).subscribe({
          next: createdTeam => {
            this.associateTeamToLeague(leagueId, createdTeam.id);
          },
          error: error => {
            console.error('Error al crear el equipo:', error);
            console.error('Detalle:', error.error);
          }
        });

        return;
      }

      if (result.existingTeamId != null) {
        this.associateTeamToLeague(
          leagueId,
          result.existingTeamId
        );
      }
    });
  }

  editTeam(team: TeamByLeague): void {
    this.dialog.open(TeamForm, {
      width: '480px',
      maxWidth: '95vw',
      data: {
        id: team.id,
        name: team.name,
        country: team.country,
        playersQuantity: team.playersQuantity,
        enabled: team.enabled
      }
    }).afterClosed().subscribe(result => {
      if (!result || !result.isEdit) return;

      this.teamsService.update(result.id, {
        name: result.name,
        country: result.country,
        playersQuantity: result.playersQuantity,
        enabled: result.enabled
      }).subscribe({
        next: () => {
          if (this.selectedLeague) {
            this.loadTeamsByLeague(this.selectedLeague.id);
          }
        },
        error: error => {
          console.error('Error al actualizar el equipo:', error);
          console.error('Detalle:', error.error);

          window.alert(
            error.status === 409
              ? 'Ya existe un equipo con ese nombre.'
              : 'No fue posible actualizar el equipo.'
          );
        }
      });
    });
  }

  private associateTeamToLeague(
    leagueId: number,
    teamId: number
  ): void {
    this.inscripcionService.create(leagueId, teamId).subscribe({
      next: () => this.loadTeamsByLeague(leagueId),
      error: error => {
        console.error(
          'Error al asociar el equipo con la liga:',
          error
        );
        console.error('Detalle:', error.error);
        window.alert(
          'No fue posible asociar el equipo con la liga.'
        );
      }
    });
  }

  removeTeam(team: TeamByLeague): void {
    if (!this.selectedLeague) return;

    const leagueId = this.selectedLeague.id;

    if (!window.confirm(
      `¿Deseas remover a "${team.name}" de la liga "${this.selectedLeague.name}"?`
    )) {
      return;
    }

    this.removingTeamId = team.id;

    this.inscripcionService
      .delete(leagueId, team.id)
      .pipe(
        finalize(() => {
          this.removingTeamId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.teams = this.teams.filter(
            item => item.id !== team.id
          );
        },
        error: error => {
          console.error(
            'Error al remover el equipo de la liga:',
            error
          );
          window.alert(
            'No fue posible remover el equipo de la liga.'
          );
        }
      });
  }

  deleteTeam(team: TeamByLeague): void {
    if (!window.confirm(
      `¿Eliminar definitivamente el equipo "${team.name}" y todas sus inscripciones?`
    )) {
      return;
    }

    this.deletingTeamId = team.id;

    this.inscripcionService.deleteByTeam(team.id).pipe(
      switchMap(() => this.teamsService.delete(team.id)),
      finalize(() => {
        this.deletingTeamId = null;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.teams = this.teams.filter(
          item => item.id !== team.id
        );
        this.loadLeagues();
      },
      error: error => {
        console.error('Error al eliminar el equipo:', error);
        window.alert('No fue posible eliminar el equipo.');
      }
    });
  }

  deleteLeague(league: League): void {
    if (!window.confirm(
      `¿Eliminar definitivamente la liga "${league.name}" y todas sus inscripciones?`
    )) {
      return;
    }

    this.removingLeagueId = league.id;

    this.inscripcionService.deleteByLeague(league.id).pipe(
      switchMap(() => this.leaguesService.delete(league.id)),
      finalize(() => {
        this.removingLeagueId = null;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.leagues = this.leagues.filter(
          item => item.id !== league.id
        );

        if (this.selectedLeague?.id === league.id) {
          this.selectedLeague = null;
          this.teams = [];

          if (this.leagues.length > 0) {
            this.selectLeague(this.leagues[0]);
          }
        }
      },
      error: error => {
        console.error('Error al eliminar la liga:', error);
        window.alert('No fue posible eliminar la liga.');
      }
    });
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');

    window.location.href = '/';
  }
}
