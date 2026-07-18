import type { UpdateScheduleInput } from '@box33/types'
import { Type } from 'class-transformer'
import { ArrayMaxSize, IsArray, Matches, ValidateNested } from 'class-validator'

const TIME_PATTERN = /^\d{1,2}:\d{2}$/

export class OpenBoxDto {
  @Matches(TIME_PATTERN, { message: 'start must be a time like 10:30' })
  start: string

  @Matches(TIME_PATTERN, { message: 'end must be a time like 13:00' })
  end: string
}

export class UpdateScheduleDto implements UpdateScheduleInput {
  @IsArray()
  @ArrayMaxSize(12)
  @Matches(TIME_PATTERN, { each: true, message: 'morning entries must be times like 5:30' })
  morning: string[]

  @IsArray()
  @ArrayMaxSize(12)
  @Matches(TIME_PATTERN, { each: true, message: 'evening entries must be times like 3:30' })
  evening: string[]

  @ValidateNested()
  @Type(() => OpenBoxDto)
  openBox: OpenBoxDto
}
