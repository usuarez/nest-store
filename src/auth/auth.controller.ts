import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { GetUserToken } from './decorators/get-user-token.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { validRolesEnum } from './enums/validRoles';
import { UserRoleGuard } from './guards/user-role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('checkAuth')
  @Auth()
  checkAuthStatus(@GetUser() user: User, @GetUserToken() token: string) {
    return this.authService.checkJwt(user, token);
  }

  @Get('test')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    //@Req() request: Express.Request
    @GetUser() user: User,
    @RawHeaders() rawHeaders: string[],
  ) {
    return { ok: true, message: 'Private route', user, rawHeaders };
  }

  @Get('test2')
  @RoleProtected(validRolesEnum.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRouteb(@GetUser() user: User) {
    return { ok: true, message: 'Private route', user };
  }

  @Get('test3')
  @Auth()
  testingPrivateRoutec(@GetUser() user: User) {
    return { ok: true, message: 'Private route', user };
  }
}
