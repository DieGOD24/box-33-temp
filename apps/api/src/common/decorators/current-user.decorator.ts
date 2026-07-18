import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AuthUser } from '@box33/types'

/**
 * Inject the authenticated user into a controller handler.
 * JwtStrategy.validate() assigns it to `request.user`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<{ user: AuthUser }>()
    return req.user
  }
)
