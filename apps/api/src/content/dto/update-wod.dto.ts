import type { UpdateWodInput } from '@box33/types'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class UpdateWodDto implements UpdateWodInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text: string
}
