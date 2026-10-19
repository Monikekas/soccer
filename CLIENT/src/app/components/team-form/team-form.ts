
import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  switchMap,
  tap
} from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Teams } from '../../services/teams';
import type { Team, TeamMatch } from '../../services/teams';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatAutocompleteModule
  ],
  templateUrl: './team-form.html',
  styleUrl: './team-form.scss'
})
export class TeamForm implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TeamForm>);
  private teamsService = inject(Teams);
  private destroyRef = inject(DestroyRef);

  data = inject<Team | null>(MAT_DIALOG_DATA, { optional: true });

  filteredTeams: TeamMatch[] = [];
  selectedTeam: Team | null = null;

  loadingTeams = false;
  teamsError = '';
  searchCompleted = false;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    country: ['', Validators.required],
    playersQuantity: [11, [Validators.required, Validators.min(1)]],
    enabled: [true]
  });

  ngOnInit(): void {
    // Modo edición: cargar los datos del equipo seleccionado.
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        country: this.data.country,
        playersQuantity: this.data.playersQuantity,
        enabled: this.data.enabled
      }, { emitEvent: false });

      this.searchCompleted = true;
    }

    // En ambos modos, buscar coincidencias al cambiar el nombre.
    this.form.controls.name.valueChanges
      .pipe(
        tap(() => {
          this.selectedTeam = null;
          this.teamsError = '';
          this.searchCompleted = false;

          // Al crear, los datos corresponden a un nuevo equipo.
          // Al editar, conservar los demás campos.
          if (!this.data) {
            this.form.patchValue({
              country: '',
              playersQuantity: 11,
              enabled: true
            }, { emitEvent: false });
          }

          this.updateExistingTeamControls();
        }),

        debounceTime(200),
        distinctUntilChanged(),

        switchMap(value => {
          const name = value.trim();

          if (name.length < 2) {
            this.loadingTeams = false;
            this.filteredTeams = [];
            this.searchCompleted = false;

            return of([] as TeamMatch[]);
          }

          this.loadingTeams = true;
          this.teamsError = '';
          this.filteredTeams = [];

          // En edición excluimos el ID actual para no marcar
          // el propio equipo como duplicado.
          return this.teamsService.search(
            name,
            this.data?.id
          ).pipe(
            catchError(error => {
              console.error('Error al buscar equipos:', error);

              this.teamsError =
                'No fue posible buscar equipos. Intenta nuevamente.';

              return of([] as TeamMatch[]);
            }),
            finalize(() => {
              this.loadingTeams = false;
            })
          );
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(matches => {
        this.filteredTeams = matches;

        this.searchCompleted =
          this.form.controls.name.value.trim().length >= 2;

        this.validateTeamName();
      });

    // Actualizar la validez inicial del formulario.
    this.form.updateValueAndValidity();
  }

  onTeamSelected(event: MatAutocompleteSelectedEvent): void {
    // En edición, la sugerencia sirve para detectar el duplicado;
    // no debemos cargar los datos de otro equipo sobre el actual.
    if (this.data) {
      this.validateTeamName();
      return;
    }

    const name = String(event.option.value);

    const match = this.filteredTeams.find(
      team => team.name.toLowerCase() === name.toLowerCase()
    );

    if (!match) return;

    this.loadingTeams = true;
    this.teamsError = '';

    this.teamsService.getById(match.id)
      .pipe(
        finalize(() => {
          this.loadingTeams = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: team => {
          this.selectedTeam = team;

          this.form.patchValue({
            name: team.name,
            country: team.country,
            playersQuantity: team.playersQuantity,
            enabled: team.enabled
          }, { emitEvent: false });

          this.filteredTeams = [{
            id: team.id,
            name: team.name
          }];

          this.searchCompleted = true;
          this.form.controls.name.setErrors(null);

          this.updateExistingTeamControls();
        },
        error: error => {
          console.error('Error al consultar el equipo:', error);

          this.selectedTeam = null;
          this.teamsError =
            'No fue posible cargar los datos del equipo.';

          this.updateExistingTeamControls();
        }
      });
  }

  private updateExistingTeamControls(): void {
    const country = this.form.controls.country;
    const playersQuantity = this.form.controls.playersQuantity;
    const enabled = this.form.controls.enabled;

    // Al editar, todos los campos son modificables.
    if (this.data) {
      country.enable({ emitEvent: false });
      playersQuantity.enable({ emitEvent: false });
      enabled.enable({ emitEvent: false });
      return;
    }

    // Al agregar, bloquear los datos si se seleccionó un equipo existente.
    if (this.isExistingTeamSelected) {
      country.disable({ emitEvent: false });
      playersQuantity.disable({ emitEvent: false });
      enabled.disable({ emitEvent: false });
    } else {
      country.enable({ emitEvent: false });
      playersQuantity.enable({ emitEvent: false });
      enabled.enable({ emitEvent: false });
    }
  }

  private validateTeamName(): void {
    const control = this.form.controls.name;
    const name = control.value.trim();

    if (!name) {
      control.setErrors({ required: true });
      return;
    }

    // En edición, comprobar si otro equipo tiene ese nombre.
    if (this.data && this.duplicateTeam) {
      control.setErrors({ duplicate: true });
      return;
    }

    // En creación, no permitir guardar un duplicado sin seleccionarlo.
    if (
      !this.data &&
      this.exactTeam &&
      !this.isExistingTeamSelected
    ) {
      control.setErrors({ duplicate: true });
      return;
    }

    control.setErrors(null);
  }

  // Coincidencia exacta entre el texto escrito y las sugerencias.
  get exactTeam(): TeamMatch | undefined {
    const name = this.form.controls.name.value.trim().toLowerCase();

    if (!name) return undefined;

    return this.filteredTeams.find(
      team => team.name.trim().toLowerCase() === name
    );
  }

  // En edición, buscar un equipo distinto con el mismo nombre.
  get duplicateTeam(): TeamMatch | undefined {
    const name = this.form.controls.name.value.trim().toLowerCase();

    if (!name) return undefined;

    return this.filteredTeams.find(
      team =>
        team.name.trim().toLowerCase() === name &&
        team.id !== this.data?.id
    );
  }

  get isExistingTeamSelected(): boolean {
    return !!this.selectedTeam &&
      this.selectedTeam.name.trim().toLowerCase() ===
      this.form.controls.name.value.trim().toLowerCase();
  }

  get statusMessage(): string {
    if (this.isExistingTeamSelected) {
      return `Se utilizará el equipo existente "${this.selectedTeam!.name}". No se creará un duplicado.`;
    }

    if (this.exactTeam) {
      return 'Este nombre ya existe. Selecciona el equipo de la lista para utilizarlo.';
    }

    return 'No encontramos este equipo. Se podrá crear uno nuevo.';
  }

  save(): void {
    if (this.loadingTeams || this.teamsError) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (
      this.form.controls.name.value.trim().length >= 2 &&
      !this.searchCompleted
    ) {
      return;
    }

    // Modo edición.
    if (this.data) {
      if (this.duplicateTeam) {
        this.form.controls.name.setErrors({ duplicate: true });
        return;
      }

      const values = this.form.getRawValue();

      this.dialogRef.close({
        isEdit: true,
        id: this.data.id,
        name: values.name.trim(),
        country: values.country.trim(),
        playersQuantity: values.playersQuantity,
        enabled: values.enabled
      });

      return;
    }

    // Modo creación.
    if (this.exactTeam && !this.isExistingTeamSelected) {
      this.form.controls.name.setErrors({ duplicate: true });
      return;
    }

    const values = this.form.getRawValue();

    this.dialogRef.close({
      name: values.name.trim(),
      country: values.country.trim(),
      playersQuantity: values.playersQuantity,
      enabled: values.enabled,
      existingTeamId: this.isExistingTeamSelected
        ? this.selectedTeam!.id
        : null,
      isNew: !this.isExistingTeamSelected
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
