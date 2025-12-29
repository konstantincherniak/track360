import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '@core/services/auth.service';
import { AuthForm } from '@core/models';

@Component({
  selector: 'app-auth',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly isSignUp = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly formGroup: FormGroup<AuthForm> = this._fb.group({
    email: this._fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this._fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
  });

  protected toggleMode(): void {
    this.isSignUp.update((v) => !v);
    this.errorMessage.set(null);
  }

  protected onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.formGroup.getRawValue();
    const action$ = this.isSignUp()
      ? this._authService.signUp(credentials)
      : this._authService.signIn(credentials);

    action$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: ({ data, error }) => {
        this.isLoading.set(false);
        if (error) {
          this.errorMessage.set(error.message);
          return;
        }
        if (data.user) {
          this._router.navigate(['/app']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'An error occurred');
      },
    });
  }
}
