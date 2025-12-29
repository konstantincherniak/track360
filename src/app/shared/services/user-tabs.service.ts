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
  of,
  interval,
  map,
  tap,
  switchMap,
  startWith,
  catchError,
} from "rxjs";

import { SupabaseService } from "./supabase.service";
import { AuthService } from "./auth.service";
import { PresenceIdService } from "./presence-id.service";
import {
  UserTab,
  UserTabWithState,
  TabState,
  DeviceGroup,
} from "@shared/models";

@Injectable({ providedIn: "root" })
export class UserTabsService {
  private readonly _supabase = inject(SupabaseService);
  private readonly _authService = inject(AuthService);
  private readonly _presenceId = inject(PresenceIdService);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly POLLING_INTERVAL = 10000; // 10 seconds
  private readonly TTL_ACTIVE = 30 * 1000; // 30 seconds
  private readonly TTL_IDLE = 3 * 60 * 1000; // 3 minutes

  public readonly tabs = signal<UserTabWithState[]>([]);
  public readonly isLoading = signal(false);

  public readonly onlineCount = computed(
    () => this.tabs().filter((t) => t.state !== "stale").length,
  );

  public readonly deviceCount = computed(() => {
    const devices = new Set(this.tabs().map((t) => t.device_id));
    return devices.size;
  });

  public readonly tabsByDevice = computed<DeviceGroup[]>(() => {
    const grouped = new Map<string, UserTabWithState[]>();

    for (const tab of this.tabs()) {
      const list = grouped.get(tab.device_id) || [];
      list.push(tab);
      grouped.set(tab.device_id, list);
    }

    return Array.from(grouped.entries())
      .map(([deviceId, tabs]) => ({
        deviceId,
        tabs: tabs.sort(
          (a, b) =>
            new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime(),
        ),
        isCurrentDevice: deviceId === this._presenceId.deviceId(),
      }))
      .sort((a, b) => (a.isCurrentDevice ? -1 : b.isCurrentDevice ? 1 : 0));
  });

  public loadTabs(): Observable<UserTabWithState[]> {
    const userId = this._authService.currentUser()?.id;
    if (!userId) {
      return of([]);
    }

    this.isLoading.set(true);

    return from(
      this._supabase.from("user_tabs").select("*").eq("user_id", userId),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error("Failed to load tabs:", error);
          return [];
        }
        return (data || []).map((tab: UserTab) => this._computeState(tab));
      }),
      tap((tabs) => {
        this.tabs.set(tabs);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        console.error("Failed to load tabs:", error);
        this.isLoading.set(false);
        return of([]);
      }),
    );
  }

  public startPolling(): void {
    interval(this.POLLING_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => this.loadTabs()),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  public isCurrentTab(tab: UserTab): boolean {
    return (
      tab.device_id === this._presenceId.deviceId() &&
      tab.tab_id === this._presenceId.tabId()
    );
  }

  private _computeState(tab: UserTab): UserTabWithState {
    const diff = Date.now() - new Date(tab.last_seen).getTime();
    let state: TabState = "stale";

    if (diff < this.TTL_ACTIVE) {
      state = "active";
    } else if (diff < this.TTL_IDLE) {
      state = "idle";
    }

    return { ...tab, state };
  }
}
