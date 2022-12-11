import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUserToken = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const token = req.headers.authorization.split(' ')[1];

    if (!token) throw new InternalServerErrorException('User not authorized');

    return token;
  },
);
