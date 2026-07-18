import { Body, Controller, Get, Ip, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiTags } from '@nestjs/swagger'
import type { AuthResponse, AuthUser } from '@box33/types'
import { Public } from '../common/decorators/public.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
  login(@Body() dto: LoginDto, @Ip() ip: string): Promise<AuthResponse> {
    return this.authService.login(dto, ip)
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user
  }
}
