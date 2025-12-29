import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tabs-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './tabs-summary.component.html',
  styleUrl: './tabs-summary.component.scss',
})
export class TabsSummaryComponent {
  public readonly onlineCount = input.required<number>();
  public readonly totalCount = input.required<number>();
  public readonly deviceCount = input.required<number>();
}
