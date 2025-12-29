import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  inject,
  computed,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '@shared/services/auth.service';
import { PresenceService } from '@shared/services/presence.service';
import { UserTabsService } from '@shared/services/user-tabs.service';
import { TabsSummaryComponent } from './components/tabs-summary/tabs-summary.component';
import { DeviceGroupComponent } from './components/device-group/device-group.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TabsSummaryComponent,
    DeviceGroupComponent,
  ],
  templateUrl: './app-dashboard.component.html',
  styleUrl: './app-dashboard.component.scss',
})
export class AppDashboardComponent implements OnInit, OnDestroy {
  private readonly _authService = inject(AuthService);
  private readonly _presenceService = inject(PresenceService);
  private readonly _userTabsService = inject(UserTabsService);

  protected readonly tabsByDevice = this._userTabsService.tabsByDevice;
  protected readonly onlineCount = this._userTabsService.onlineCount;
  protected readonly deviceCount = this._userTabsService.deviceCount;
  protected readonly isLoading = this._userTabsService.isLoading;
  protected readonly totalCount = computed(() => this._userTabsService.tabs().length);

  protected readonly userEmail = computed(() => this._authService.currentUser()?.email);

  public ngOnInit(): void {
    this._presenceService.startTracking();
    this._userTabsService.startPolling();
  }

  public ngOnDestroy(): void {
    this._presenceService.stopTracking();
  }

  protected signOut(): void {
    this._authService.signOut().subscribe();
  }
}
