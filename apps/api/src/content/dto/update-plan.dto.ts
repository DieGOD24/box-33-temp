import type { UpdatePlanInput } from '@box33/types'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'

export class UpdatePlanDto implements UpdatePlanInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  tagline: string

  @IsInt()
  @Min(0)
  priceCents: number

  @IsIn(['class', 'month', 'quarter'])
  unit: 'class' | 'month' | 'quarter'

  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  features: string[]

  @IsBoolean()
  popular: boolean
}
