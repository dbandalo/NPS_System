import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRole = route.data['role'] as string;
    
    if (this.authService.hasRole(requiredRole)) {
      return true;
    }
    
    // Redirect based on actual role
    const user = this.authService.getCurrentUser();
    if (user?.role === 'Admin') {
      return this.router.createUrlTree(['/dashboard']);
    } else if (user?.role === 'Votante') {
      return this.router.createUrlTree(['/voting']);
    }
    
    return this.router.createUrlTree(['/login']);
  }
}
