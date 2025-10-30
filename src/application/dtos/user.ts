//use class validator in the future for validation
import { Role } from '../../domain/entities/user.entity';
export class RegisterDTO {
  username: string
  name:string
  email: string
  password: string
  role?: Role
}

export class LoginDTO {
  email: string
  password: string
}

export class UpdateUserDTO {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: string;
}