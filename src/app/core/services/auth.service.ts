import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, tap, catchError, map, EMPTY, firstValueFrom, filter, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { User, AuthResponse } from '@supabase/supabase-js';

import { SupabaseService } from './supabase.service';
import { AuthCredentials } from '@core/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _supabase = inject(SupabaseService);
  private readonly _router = inject(Router);

  public readonly currentUser = signal<User | null>(null);
  public readonly isAuthenticated = computed(() => !!this.currentUser());
  public readonly isLoading = signal(true);

  public waitForAuthReady(): Promise<boolean> {
    return firstValueFrom(
      toObservable(this.isLoading).pipe(
        filter((loading) => !loading),
        take(1),
        map(() => this.isAuthenticated())
      )
    );
  }

  public signUp(credentials: AuthCredentials): Observable<AuthResponse> {
    return from(this._supabase.auth.signUp(credentials)).pipe(
      tap(({ data }) => {
        if (data.user) {
          this.currentUser.set(data.user);
        }
      }),
      catchError((error) => {
        console.error('Sign up error:', error);
        throw error;
      })
    );
  }

  public signIn(credentials: AuthCredentials): Observable<AuthResponse> {
    return from(this._supabase.auth.signInWithPassword(credentials)).pipe(
      tap(({ data }) => {
        if (data.user) {
          this.currentUser.set(data.user);
        }
      }),
      catchError((error) => {
        console.error('Sign in error:', error);
        throw error;
      })
    );
  }

  public signOut(): Observable<void> {
    return from(this._supabase.auth.signOut()).pipe(
      tap(() => {
        this.currentUser.set(null);
        this._router.navigate(['/auth']);
      }),
      map(() => undefined),
      catchError((error) => {
        console.error('Sign out error:', error);
        return EMPTY;
      })
    );
  }

  public initAuthListener(): void {
    // Check initial session
    this._supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.set(session?.user ?? null);
      this.isLoading.set(false);
    });

    // Listen for auth changes
    this._supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
      this.isLoading.set(false);
    });
  }
}
