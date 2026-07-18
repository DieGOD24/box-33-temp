/** Training goal options offered by the hero pre-registration form. */
export type LeadGoal = 'strength' | 'weight-loss' | 'conditioning' | 'compete' | 'wellness'

export const LEAD_GOALS: readonly LeadGoal[] = [
  'strength',
  'weight-loss',
  'conditioning',
  'compete',
  'wellness',
] as const

export interface Lead {
  id: string
  name: string
  phone: string
  goal: LeadGoal
  createdAt: string
}

export interface CreateLeadInput {
  name: string
  phone: string
  goal: LeadGoal
}
