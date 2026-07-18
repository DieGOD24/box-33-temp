import { LEAD_GOALS } from '@box33/types'
import type { CreateLeadInput, LeadGoal } from '@box33/types'
import { IsIn, IsString, Length, Matches } from 'class-validator'

export class CreateLeadDto implements CreateLeadInput {
  @IsString()
  @Length(2, 80)
  name: string

  @Matches(/^[\d+\-\s().]{7,20}$/, { message: 'phone must be 7-20 digits or phone symbols' })
  phone: string

  @IsIn([...LEAD_GOALS])
  goal: LeadGoal
}
