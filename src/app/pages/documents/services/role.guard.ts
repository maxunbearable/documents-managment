import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../../shared/services';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];

    return this.authService.currentUser$.pipe(
      map(user => {
        if (!requiredRoles || requiredRoles.length === 0) {
          return true;
        }

        const userRole = user?.role;


        if (userRole && requiredRoles.includes(userRole)) {
          return true;
        }

        this.router.navigate(['/documents']);
        return false;
      })
    )
  }
}
