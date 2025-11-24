import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property is requested, return that property
    if (data && user) {
      return user[data];
    }

    // Otherwise, return the whole user object
    return user;
  },
);
