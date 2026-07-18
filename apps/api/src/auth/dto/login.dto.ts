import { IsEmail, IsString, MinLength } from 'class-validator'
import type { LoginInput } from '@box33/types'

export class LoginDto implements LoginInput {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string
}
