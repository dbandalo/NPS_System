import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-wrapper">
      <div class="login-card card">
        <div class="login-card__logo" aria-hidden="true">&#128202;</div>
        <h1 class="login-card__title">NPS Survey</h1>
        <p class="login-card__subtitle">Ingresa tus credenciales para continuar</p>

        <div class="alert-error" *ngIf="errorMessage" role="alert">
          &#9888; {{ errorMessage }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-group">
            <label class="form-label" for="username">Usuario</label>
            <input
              id="username"
              type="text"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('username')"
              formControlName="username"
              placeholder="Ingresa tu usuario"
              autocomplete="username"
            />
            <div class="form-error" *ngIf="isFieldInvalid('username')">
              <span *ngIf="loginForm.get('username')?.errors?.['required']">El usuario es requerido.</span>
              <span *ngIf="loginForm.get('username')?.errors?.['minlength']">Mínimo 3 caracteres.</span>
              <span *ngIf="loginForm.get('username')?.errors?.['maxlength']">Máximo 100 caracteres.</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <div class="password-wrapper">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('password')"
                formControlName="password"
                placeholder="Ingresa tu contraseña"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="password-toggle"
                (click)="showPassword = !showPassword"
                [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
            <div class="form-error" *ngIf="isFieldInvalid('password')">
              <span *ngIf="loginForm.get('password')?.errors?.['required']">La contraseña es requerida.</span>
              <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Mínimo 6 caracteres.</span>
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Iniciar sesión</span>
            <span *ngIf="isLoading">Cargando...</span>
          </button>
        </form>

        <div class="login-footer">
          <p>Sesión: 5 min de inactividad o según expiración del servidor</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background: #f0f2f5;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 2rem 2.25rem;
    }

    .login-card__logo {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .login-card__title {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .login-card__subtitle {
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.35rem;
      color: var(--text-primary);
    }

    .form-control {
      width: 100%;
      padding: 0.65rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 1rem;
    }

    .form-control.is-invalid {
      border-color: #dc2626;
    }

    .form-error {
      font-size: 0.8rem;
      color: #dc2626;
      margin-top: 0.25rem;
    }

    .password-wrapper {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .password-wrapper .form-control {
      flex: 1;
    }

    .password-toggle {
      flex-shrink: 0;
      padding: 0.5rem 0.75rem;
      background: #f3f4f6;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .alert-error {
      background: #fef2f2;
      color: #b91c1c;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .btn-submit {
      width: 100%;
      margin-top: 1rem;
      padding: 0.85rem 1rem;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-submit:hover:not(:disabled) {
      background: #4338ca;
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
    }

    .login-footer p {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.redirectBasedOnRole();
        } else {
          this.errorMessage = response.message || 'Error al iniciar sesion';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error de conexion con el servidor';
        this.isLoading = false;
      }
    });
  }

  private redirectBasedOnRole(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'Admin') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/survey']);
    }
  }
}
