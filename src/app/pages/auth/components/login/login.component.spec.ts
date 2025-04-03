import { fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../shared/services';
import { DestroyRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;
  let destroyRefMock: jasmine.SpyObj<DestroyRef>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService',
      ['login', 'getCurrentUser']);
    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);
    snackBarMock = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    destroyRefMock = jasmine.createSpyObj<DestroyRef>('DestroyRef', ['onDestroy']);

    component = new LoginComponent(
      new FormBuilder(),
      authServiceMock,
      routerMock,
      snackBarMock,
      destroyRefMock
    );
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should have invalid initial state', () => {
      expect(component.loginForm.valid).toBeFalse();
    });

    it('should validate email format', () => {
      component.loginForm.patchValue({ email: 'invalid', password: 'validpass' });
      expect(component.loginForm.valid).toBeFalse();
      expect((component.loginForm.controls['email'].errors as any)?.email).toBeTruthy();
    });

    it('should validate password length', () => {
      component.loginForm.patchValue({ email: 'test@test.com', password: 'short' });
      expect(component.loginForm.valid).toBeFalse();
      expect((component.loginForm.controls['password'].errors as any)?.minlength).toBeTruthy();
    });
  });

  describe('onSubmit()', () => {
    it('should not submit invalid form', () => {
      component.loginForm.patchValue({ email: '', password: '' });
      component.onSubmit();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should handle successful login', fakeAsync(() => {
      authServiceMock.login.and.returnValue(of({} as any));
      authServiceMock.getCurrentUser.and.returnValue(of({} as any));

      component.loginForm.patchValue({
        email: 'test@test.com',
        password: 'validpassword'
      });
      component.onSubmit();
      tick();

      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'validpassword'
      });
      expect(routerMock.navigate).toHaveBeenCalledWith(['/documents']);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle login error with message', fakeAsync(() => {
      const error = { error: { message: 'Invalid credentials' } };
      authServiceMock.login.and.returnValue(throwError(() => error));

      component.loginForm.patchValue({
        email: 'test@test.com',
        password: 'wrongpass'
      });
      component.onSubmit();
      tick();

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Invalid credentials',
        'Close',
        { duration: 5000 }
      );
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle login error without message', fakeAsync(() => {
      authServiceMock.login.and.returnValue(throwError(() => ({})));

      component.loginForm.patchValue({
        email: 'test@test.com',
        password: 'validpassword'
      });
      component.onSubmit();
      tick();

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Login failed. Please try again.',
        'Close',
        { duration: 5000 }
      );
    }));
  });

  describe('navigateToRegister()', () => {
    it('should navigate to register page', () => {
      component.navigateToRegister();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/register']);
    });
  });
});
