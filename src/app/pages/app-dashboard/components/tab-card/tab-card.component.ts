import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { UserTabWithState } from '@core/models';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-tab-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatChipsModule, MatIconModule, RelativeTimePipe, TitleCasePipe],
  templateUrl: './tab-card.component.html',
  styleUrl: './tab-card.component.scss',
})
export class TabCardComponent {
  public readonly tab = input.required<UserTabWithState>();
  public readonly isCurrentTab = input(false);

  protected readonly stateClass = computed(() => `state-${this.tab().state}`);

  protected readonly browserName = computed(() => {
    const ua = this.tab().user_agent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser';
  });
}
