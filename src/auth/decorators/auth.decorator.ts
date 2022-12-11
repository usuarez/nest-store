import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { validRolesEnum } from '../enums/validRoles';
import { UserRoleGuard } from '../guards/user-role.guard';
import { RoleProtected } from './role-protected.decorator';

export function Auth(...roles: validRolesEnum[]) {
  return applyDecorators(
    RoleProtected(validRolesEnum.superUser, validRolesEnum.admin),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
