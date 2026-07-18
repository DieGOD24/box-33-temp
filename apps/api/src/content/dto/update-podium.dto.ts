import type { UpdatePodiumInput } from '@box33/types'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'

export class PodiumEntryDto {
  @IsInt()
  @Min(1)
  @Max(3)
  place: 1 | 2 | 3

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  achievement: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string | null
}

export class PodiumMentionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  achievement: string
}

export class UpdatePodiumDto implements UpdatePodiumInput {
  @IsString()
  @MaxLength(40)
  month: string

  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => PodiumEntryDto)
  entries: PodiumEntryDto[]

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PodiumMentionDto)
  mentions: PodiumMentionDto[]
}
