import { FormControl } from '@angular/forms';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthForm {
  email: FormControl<string>;
  password: FormControl<string>;
}
