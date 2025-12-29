import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PresenceIdService {
  private readonly DEVICE_ID_KEY = 'device_id';
  private readonly TAB_ID_KEY = 'tab_id';

  public readonly deviceId = signal(this._getOrCreateDeviceId());
  public readonly tabId = signal(this._getOrCreateTabId());

  private _getOrCreateDeviceId(): string {
    let id = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(this.DEVICE_ID_KEY, id);
    }
    return id;
  }

  private _getOrCreateTabId(): string {
    let id = sessionStorage.getItem(this.TAB_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(this.TAB_ID_KEY, id);
    }
    return id;
  }
}
