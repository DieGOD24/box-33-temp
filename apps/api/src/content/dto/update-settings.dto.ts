import type { UpdateSettingsInput } from '@box33/types'
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator'

export class UpdateSettingsDto implements UpdateSettingsInput {
  @Matches(/^\d{10,15}$/, { message: 'whatsappNumber must be 10-15 digits' })
  whatsappNumber: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  instagramHandle: string
}
