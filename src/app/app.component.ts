import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { AuthService } from "@shared/services/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly _authService = inject(AuthService);

  public ngOnInit(): void {
    this._authService.initAuthListener();
  }
}
