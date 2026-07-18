/** Site-wide settings the owner edits from the dashboard ("Ajustes"). */
export interface SiteSettings {
  /** WhatsApp number in international digits, e.g. "573113018283". */
  whatsappNumber: string
  /** Instagram handle without the @, e.g. "box33cf". */
  instagramHandle: string
  updatedAt: string
}

/** The chalkboard — today's workout ("La pizarra"). */
export interface Wod {
  title: string
  text: string
  updatedAt: string
}

/** Weekly challenge ("Reto de la semana"). */
export interface Challenge {
  title: string
  description: string
  /** The target, e.g. "Sub 5:00". */
  goal: string
  /** The prize, e.g. "Shoutout + camiseta BOX33". */
  prize: string
  updatedAt: string
}

export interface PodiumEntry {
  /** 1 = gold, 2 = silver, 3 = bronze. */
  place: 1 | 2 | 3
  name: string
  achievement: string
  photoUrl: string | null
}

export interface PodiumMention {
  name: string
  achievement: string
}

/** Monthly podium ("Podio del mes"). */
export interface Podium {
  /** Month label, e.g. "Marzo". Empty string → current month. */
  month: string
  entries: PodiumEntry[]
  mentions: PodiumMention[]
  updatedAt: string
}

/** Weekday class schedule ("Horarios"). */
export interface Schedule {
  /** AM class start times, e.g. ["5:30", "6:30"]. */
  morning: string[]
  /** PM class start times, e.g. ["3:30", "4:30"]. */
  evening: string[]
  /** Open box window, e.g. { start: "10:30", end: "13:00" }. */
  openBox: { start: string; end: string }
  updatedAt: string
}

export type PlanKey = 'single' | 'monthly' | 'three-week' | 'quarterly'

/** Membership plan card ("Elige tu plan"). */
export interface Plan {
  key: PlanKey
  name: string
  tagline: string
  /** Price in currency minor units (COP cents). */
  priceCents: number
  currency: string
  /** Billing unit label key: per class / per month / per quarter. */
  unit: 'class' | 'month' | 'quarter'
  features: string[]
  popular: boolean
  sortOrder: number
  updatedAt: string
}

/** Aggregate payload the public site renders from. */
export interface SiteContent {
  settings: SiteSettings
  wod: Wod
  challenge: Challenge
  podium: Podium
  schedule: Schedule
  plans: Plan[]
}

export interface UpdateSettingsInput {
  whatsappNumber: string
  instagramHandle: string
}

export interface UpdateWodInput {
  title: string
  text: string
}

export interface UpdateChallengeInput {
  title: string
  description: string
  goal: string
  prize: string
}

export interface UpdatePodiumInput {
  month: string
  entries: Array<Omit<PodiumEntry, 'photoUrl'> & { photoUrl?: string | null }>
  mentions: PodiumMention[]
}

export interface UpdateScheduleInput {
  morning: string[]
  evening: string[]
  openBox: { start: string; end: string }
}

export interface UpdatePlanInput {
  name: string
  tagline: string
  priceCents: number
  unit: 'class' | 'month' | 'quarter'
  features: string[]
  popular: boolean
}
