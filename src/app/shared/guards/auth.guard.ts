import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { AuthService } from "@shared/services/auth.service";

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.waitForAuthReady();

  if (isAuthenticated) {
    return true;
  }

  return router.createUrlTree(["/auth"]);
};
