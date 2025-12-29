import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private readonly _client: SupabaseClient;

  constructor() {
    this._client = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  get client(): SupabaseClient {
    return this._client;
  }

  get auth() {
    return this._client.auth;
  }

  from(table: string) {
    return this._client.from(table);
  }
}
