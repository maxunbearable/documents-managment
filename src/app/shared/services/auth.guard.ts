import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private tokenService: TokenService, private router: Router) {}

  canActivate(): boolean {
    if (!!this.tokenService.getAuthToken()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
