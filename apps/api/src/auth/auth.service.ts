import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { Repository } from 'typeorm'
import * as argon2 from 'argon2'
import type { AuthResponse, AuthUser } from '@box33/types'
import { User } from './entities/user.entity'
import type { LoginDto } from './dto/login.dto'

const MAX_ATTEMPTS = 5
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000

interface LockoutEntry {
  count: number
  firstAt: number
}

@Injectable()
export class AuthService {
  /** In-memory brute-force lockout — fine for a single-instance API. */
  private readonly attempts = new Map<string, LockoutEntry>()

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService
  ) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id })
  }

  async login(dto: LoginDto, ip: string): Promise<AuthResponse> {
    const key = `${dto.email.toLowerCase()}|${ip}`
    this.assertNotLockedOut(key)

    const user = await this.users.findOne({ where: { email: dto.email.toLowerCase() } })
    const valid = user ? await argon2.verify(user.passwordHash, dto.password) : false
    if (!user || !valid) {
      this.recordFailure(key)
      // Same message for unknown email and wrong password — no user enumeration.
      throw new UnauthorizedException('Invalid credentials')
    }

    this.attempts.delete(key)
    const authUser = this.toAuthUser(user)
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    return { accessToken, user: authUser }
  }

  async findAuthUser(id: string): Promise<AuthUser | null> {
    const user = await this.users.findOne({ where: { id } })
    return user ? this.toAuthUser(user) : null
  }

  private toAuthUser(user: User): AuthUser {
    return { id: user.id, email: user.email, name: user.name, role: 'owner' }
  }

  private assertNotLockedOut(key: string): void {
    const entry = this.attempts.get(key)
    if (!entry) return
    if (Date.now() - entry.firstAt > LOCKOUT_WINDOW_MS) {
      this.attempts.delete(key)
      return
    }
    if (entry.count >= MAX_ATTEMPTS) {
      throw new UnauthorizedException('Too many failed attempts — try again later')
    }
  }

  private recordFailure(key: string): void {
    const now = Date.now()
    const entry = this.attempts.get(key)
    if (!entry || now - entry.firstAt > LOCKOUT_WINDOW_MS) {
      this.attempts.set(key, { count: 1, firstAt: now })
      return
    }
    entry.count += 1
  }
}
