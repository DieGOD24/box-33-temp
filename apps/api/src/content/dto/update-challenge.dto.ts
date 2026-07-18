import type { UpdateChallengeInput } from '@box33/types'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class UpdateChallengeDto implements UpdateChallengeInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  goal: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  prize: string
}
