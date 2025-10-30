import { IsAlphanumeric, IsEmail, IsString, MinLength } from 'class-validator';

export class SignupRequest {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsString() name!: string;
  @IsAlphanumeric() code!: string
  @IsString() username!: string;
  @IsString() role!: string;
}
export class LoginRequest {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
}
export class TokenResponse {
  access!: string;
  refresh!: string;
}
