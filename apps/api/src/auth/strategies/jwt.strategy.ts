import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { AuthUser } from '@box33/types'
import type { AppConfig } from '../../config/configuration'
import { AuthService } from '../auth.service'

interface JwtPayload {
  sub: string
  email: string
  name: string
  role: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<AppConfig, true>,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt', { infer: true }).secret,
    })
  }

  /** Re-checks the DB so a deleted user's token stops working immediately. */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.authService.findAuthUser(payload.sub)
    if (!user) throw new UnauthorizedException()
    return user
  }
}
