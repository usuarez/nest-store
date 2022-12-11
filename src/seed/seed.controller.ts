import { Controller, Get } from '@nestjs/common';
//import { Auth } from 'src/auth/decorators/auth.decorator';
//import { validRolesEnum } from 'src/auth/enums/validRoles';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //@Auth(validRolesEnum.superUser)
  executeSeed() {
    return this.seedService.runSeed();
  }
}
