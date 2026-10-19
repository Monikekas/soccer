
import { Component, inject } from '@angular/core';
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

import type { League } from '../../pages/dashboard/dashboard';

@Component({
  selector: 'app-league-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './league-form.html',
  styleUrl: './league-form.scss'
})
export class LeagueForm {
  private fb = inject(FormBuilder);

  private dialogRef = inject(MatDialogRef<LeagueForm>);

  data = inject<League | null>(MAT_DIALOG_DATA, {
    optional: true
  });

  form = this.fb.nonNullable.group({
    name: [
      this.data?.name ?? '',
      Validators.required
    ],
    country: [
      this.data?.country ?? '',
      Validators.required
    ],
    startDate: [
      this.data?.startDate?.substring(0, 10) ?? '',
      Validators.required
    ],
    endDate: [
      this.data?.endDate?.substring(0, 10) ?? '',
      Validators.required
    ],
    enabled: [
      this.data?.enabled ?? true
    ]
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    if (values.endDate < values.startDate) {
      this.form.controls.endDate.setErrors({
        dateRange: true
      });
      return;
    }

    this.dialogRef.close(values);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
