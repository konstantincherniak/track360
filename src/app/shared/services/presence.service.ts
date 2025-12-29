import {
  Injectable,
  inject,
  signal,
  computed,
  DestroyRef,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  Observable,
  from,
  fromEvent,
  merge,
  map,
  catchError,
  EMPTY,
} from "rxjs";

import { SupabaseService } from "./supabase.service";
import { AuthService } from "./auth.service";
import { PresenceIdService } from "./presence-id.service";

@Injectable({ providedIn: "root" })
export class PresenceService {
  private readonly _supabase = inject(SupabaseService);
  private readonly _authService = inject(AuthService);
  private readonly _presenceId = inject(PresenceIdService);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _isVisible = signal(document.visibilityState === "visible");
  private readonly _isFocused = signal(document.hasFocus());

  public readonly isActive = computed(
    () => this._isVisible() && this._isFocused(),
  );
  public readonly userAgent = navigator.userAgent;

  private _heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private readonly HEARTBEAT_INTERVAL = 15000; // 15 seconds

  public startTracking(): void {
    this._setupVisibilityListeners();
    this._startHeartbeat();
  }

  public stopTracking(): void {
    this._stopHeartbeat();
  }

  public upsertTabPresence(): Observable<void> {
    const userId = this._authService.currentUser()?.id;
    if (!userId) {
      return EMPTY;
    }

    return from(
      this._supabase.from("user_tabs").upsert({
        user_id: userId,
        device_id: this._presenceId.deviceId(),
        tab_id: this._presenceId.tabId(),
        user_agent: this.userAgent,
        is_active: this.isActive(),
        last_seen: new Date().toISOString(),
      }),
    ).pipe(
      map(() => undefined),
      catchError((error) => {
        console.error("Failed to upsert tab presence:", error);
        return EMPTY;
      }),
    );
  }

  private _setupVisibilityListeners(): void {
    fromEvent(document, "visibilitychange")
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._isVisible.set(document.visibilityState === "visible");
        // Update presence immediately on visibility change
        this.upsertTabPresence().subscribe();
      });

    merge(
      fromEvent(window, "focus").pipe(map(() => true)),
      fromEvent(window, "blur").pipe(map(() => false)),
    )
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((focused) => {
        this._isFocused.set(focused);
        // Update presence immediately on focus change
        this.upsertTabPresence().subscribe();
      });
  }

  private _startHeartbeat(): void {
    // Initial upsert
    this.upsertTabPresence().subscribe();

    // Periodic heartbeat
    this._heartbeatInterval = setInterval(() => {
      this.upsertTabPresence().subscribe();
    }, this.HEARTBEAT_INTERVAL);
  }

  private _stopHeartbeat(): void {
    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
      this._heartbeatInterval = null;
    }
  }
}
