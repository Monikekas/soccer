
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  username = '';
  password = '';
  hidePassword = true;
  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loading || !this.username.trim() || !this.password) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.auth.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);

        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('username', response.username);
        sessionStorage.setItem('role', response.role);

        this.router.navigate(['/dashboard']).then((navigated) => {
          console.log('¿Navegación realizada?', navigated);
          console.log('URL actual:', this.router.url);
        }).catch((error) => {
          console.error('Error de navegación:', error);
        });
      },
      error: (error) => {
        if (error.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        } else {
          this.errorMessage =
            'No fue posible conectar con el servidor. Intenta nuevamente.';
          console.error('Error de inicio de sesión:', error);
        }

        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
