import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
export declare class IsProfessorOfCourseGuard implements CanActivate {
    private readonly prisma;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
