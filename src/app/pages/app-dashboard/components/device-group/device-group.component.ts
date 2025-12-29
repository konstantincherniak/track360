import {
  ChangeDetectionStrategy,
  Component,
  input,
  inject,
} from "@angular/core";
import { SlicePipe } from "@angular/common";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatBadgeModule } from "@angular/material/badge";

import { DeviceGroup } from "@shared/models";
import { UserTabsService } from "@shared/services/user-tabs.service";
import { TabCardComponent } from "../tab-card/tab-card.component";

@Component({
  selector: "app-device-group",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatExpansionModule,
    MatIconModule,
    MatBadgeModule,
    TabCardComponent,
    SlicePipe,
  ],
  templateUrl: "./device-group.component.html",
  styleUrl: "./device-group.component.scss",
})
export class DeviceGroupComponent {
  protected readonly _userTabsService = inject(UserTabsService);

  public readonly group = input.required<DeviceGroup>();
}
