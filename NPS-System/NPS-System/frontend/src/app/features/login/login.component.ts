import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-card card">
        <div class="login-header">
          <h2>Iniciar Sesion</h2>
          <p>Sistema Net Promoter Score</p>
        </div>
        
        <div class="alert alert-danger" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username"
              [class.is-invalid]="isFieldInvalid('username')"
              placeholder="Ingrese su usuario">
            <div class="error-message" *ngIf="isFieldInvalid('username')">
              El usuario es requerido (minimo 3 caracteres)
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Contrasena</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              [class.is-invalid]="isFieldInvalid('password')"
              placeholder="Ingrese su contrasena">
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              La contrasena es requerida (minimo 6 caracteres)
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-full"
            [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Iniciando sesion...' : 'Iniciar Sesion' }}
          </button>
        </form>
        
        <div class="login-footer">
          <p>La sesion expira automaticamente despues de 5 minutos de inactividad</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 2rem;
    }
    
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
      
      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }
      
      p {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }
    }
    
    .btn-full {
      width: 100%;
      margin-top: 1rem;
    }
    
    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
      
      p {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
    
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
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
      this.router.navigate(['/voting']);
    }
  }
}
