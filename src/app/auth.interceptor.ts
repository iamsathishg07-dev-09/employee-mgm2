import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { isTokenExpired } from './helper/jwt.helper';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (!isBrowser) {
    // Skip auth logic during SSR
    return next(req);
  }

  const token = localStorage.getItem("jwtToken");
  const role = localStorage.getItem("role");
  const isPublic = req.url.includes('/login') || req.url.includes('/register');

  if (token && !isPublic) {
    if (isTokenExpired(token)) {
      localStorage.clear();
      sessionStorage.clear();
      alert("session expired login again to continue");
      router.navigate(['/login']);
      return next(req);
    }

    // Role-based access control
    if (req.url.includes('/admin') && role !== 'Admin') {
      alert("Access denied: Admins only");
      return EMPTY;
    }

    if (req.url.includes('/manager') && role !== 'manager') {
      alert("Access denied: Managers only");
      return EMPTY;
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  
  return next(req);
};
