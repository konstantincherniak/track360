export type TabState = 'active' | 'idle' | 'stale';

export interface UserTab {
  user_id: string;
  device_id: string;
  tab_id: string;
  user_agent: string;
  is_active: boolean;
  last_seen: string;
  created_at: string;
}

export interface UserTabWithState extends UserTab {
  state: TabState;
}

export interface DeviceGroup {
  deviceId: string;
  tabs: UserTabWithState[];
  isCurrentDevice: boolean;
}
