import { SetMetadata } from '@nestjs/common';
import { validRolesEnum } from '../enums/validRoles';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: validRolesEnum[]) =>
  SetMetadata(META_ROLES, args);
