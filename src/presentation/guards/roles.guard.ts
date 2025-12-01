import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AllowedRole } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AllowedRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Debug logging
    console.log('🔍 RolesGuard Debug:');
    console.log('Required roles:', requiredRoles);
    console.log('User object:', user);
    console.log('User role:', user?.role);
    console.log('User role type:', typeof user?.role);
    
    if (!user || !user.role) {
      throw new ForbiddenException('Missing user role');
    }

    // Compare roles as strings to handle both enum and string values
    const userRole = String(user.role);
    const requiredRolesStr = requiredRoles.map(r => String(r));
    const allowed = requiredRolesStr.includes(userRole);
    
    console.log('User role (string):', userRole);
    console.log('Required roles (strings):', requiredRolesStr);
    console.log('Is allowed?:', allowed);
    
    if (!allowed) {
      throw new ForbiddenException(`Insufficient role. Required: [${requiredRolesStr.join(', ')}], Got: ${userRole}`);
    }
    return true;
  }
}
