import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type {
  Challenge as ChallengeDto,
  Plan as PlanDto,
  Podium as PodiumDto,
  Schedule as ScheduleDto,
  SiteContent,
  SiteSettings as SiteSettingsDto,
  UpdateChallengeInput,
  UpdatePodiumInput,
  UpdateScheduleInput,
  UpdateSettingsInput,
  UpdateWodInput,
  UpdatePlanInput,
  Wod as WodDto,
} from '@box33/types'
import { RevalidateService } from '../common/revalidate.service'
import { Challenge } from './entities/challenge.entity'
import { Plan } from './entities/plan.entity'
import { Podium } from './entities/podium.entity'
import { Schedule } from './entities/schedule.entity'
import { SiteSettings } from './entities/site-settings.entity'
import { Wod } from './entities/wod.entity'

const toIso = (value: Date | string): string => new Date(value).toISOString()

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(SiteSettings) private readonly settingsRepo: Repository<SiteSettings>,
    @InjectRepository(Wod) private readonly wodRepo: Repository<Wod>,
    @InjectRepository(Challenge) private readonly challengeRepo: Repository<Challenge>,
    @InjectRepository(Podium) private readonly podiumRepo: Repository<Podium>,
    @InjectRepository(Schedule) private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Plan) private readonly planRepo: Repository<Plan>,
    private readonly revalidateService: RevalidateService
  ) {}

  // ── singletons ────────────────────────────────────────────────────────────

  private async getOrCreateSettings(): Promise<SiteSettings> {
    const existing = (await this.settingsRepo.find({ take: 1 }))[0]
    if (existing) return existing
    return this.settingsRepo.save(
      this.settingsRepo.create({ whatsappNumber: '', instagramHandle: '' })
    )
  }

  private async getOrCreateWod(): Promise<Wod> {
    const existing = (await this.wodRepo.find({ take: 1 }))[0]
    if (existing) return existing
    return this.wodRepo.save(this.wodRepo.create({ title: '', text: '' }))
  }

  private async getOrCreateChallenge(): Promise<Challenge> {
    const existing = (await this.challengeRepo.find({ take: 1 }))[0]
    if (existing) return existing
    return this.challengeRepo.save(
      this.challengeRepo.create({ title: '', description: '', goal: '', prize: '' })
    )
  }

  private async getOrCreatePodium(): Promise<Podium> {
    const existing = (await this.podiumRepo.find({ take: 1 }))[0]
    if (existing) return existing
    return this.podiumRepo.save(this.podiumRepo.create({ month: '', entries: [], mentions: [] }))
  }

  private async getOrCreateSchedule(): Promise<Schedule> {
    const existing = (await this.scheduleRepo.find({ take: 1 }))[0]
    if (existing) return existing
    return this.scheduleRepo.save(
      this.scheduleRepo.create({ morning: [], evening: [], openBoxStart: '', openBoxEnd: '' })
    )
  }

  // ── serializers ───────────────────────────────────────────────────────────

  private toSettingsDto(entity: SiteSettings): SiteSettingsDto {
    return {
      whatsappNumber: entity.whatsappNumber,
      instagramHandle: entity.instagramHandle,
      updatedAt: toIso(entity.updatedAt),
    }
  }

  private toWodDto(entity: Wod): WodDto {
    return { title: entity.title, text: entity.text, updatedAt: toIso(entity.updatedAt) }
  }

  private toChallengeDto(entity: Challenge): ChallengeDto {
    return {
      title: entity.title,
      description: entity.description,
      goal: entity.goal,
      prize: entity.prize,
      updatedAt: toIso(entity.updatedAt),
    }
  }

  private toPodiumDto(entity: Podium): PodiumDto {
    return {
      month: entity.month,
      entries: entity.entries,
      mentions: entity.mentions,
      updatedAt: toIso(entity.updatedAt),
    }
  }

  private toScheduleDto(entity: Schedule): ScheduleDto {
    return {
      morning: entity.morning,
      evening: entity.evening,
      openBox: { start: entity.openBoxStart, end: entity.openBoxEnd },
      updatedAt: toIso(entity.updatedAt),
    }
  }

  private toPlanDto(entity: Plan): PlanDto {
    return {
      key: entity.key,
      name: entity.name,
      tagline: entity.tagline,
      priceCents: entity.priceCents,
      currency: entity.currency,
      unit: entity.unit,
      features: entity.features,
      popular: entity.popular,
      sortOrder: entity.sortOrder,
      updatedAt: toIso(entity.updatedAt),
    }
  }

  // ── reads ─────────────────────────────────────────────────────────────────

  async getSiteContent(): Promise<SiteContent> {
    const [settings, wod, challenge, podium, schedule, plans] = await Promise.all([
      this.getOrCreateSettings(),
      this.getOrCreateWod(),
      this.getOrCreateChallenge(),
      this.getOrCreatePodium(),
      this.getOrCreateSchedule(),
      this.planRepo.find({ order: { sortOrder: 'ASC' } }),
    ])
    return {
      settings: this.toSettingsDto(settings),
      wod: this.toWodDto(wod),
      challenge: this.toChallengeDto(challenge),
      podium: this.toPodiumDto(podium),
      schedule: this.toScheduleDto(schedule),
      plans: plans.map((plan) => this.toPlanDto(plan)),
    }
  }

  async listPlans(): Promise<PlanDto[]> {
    const plans = await this.planRepo.find({ order: { sortOrder: 'ASC' } })
    return plans.map((plan) => this.toPlanDto(plan))
  }

  // ── updates ───────────────────────────────────────────────────────────────

  async updateSettings(input: UpdateSettingsInput): Promise<SiteSettingsDto> {
    const entity = await this.getOrCreateSettings()
    entity.whatsappNumber = input.whatsappNumber
    entity.instagramHandle = input.instagramHandle.replace(/^@/, '')
    const saved = await this.settingsRepo.save(entity)
    void this.revalidateService.revalidate(['content'])
    return this.toSettingsDto(saved)
  }

  async updateWod(input: UpdateWodInput): Promise<WodDto> {
    const entity = await this.getOrCreateWod()
    entity.title = input.title
    entity.text = input.text
    const saved = await this.wodRepo.save(entity)
    void this.revalidateService.revalidate(['content'])
    return this.toWodDto(saved)
  }

  async updateChallenge(input: UpdateChallengeInput): Promise<ChallengeDto> {
    const entity = await this.getOrCreateChallenge()
    entity.title = input.title
    entity.description = input.description
    entity.goal = input.goal
    entity.prize = input.prize
    const saved = await this.challengeRepo.save(entity)
    void this.revalidateService.revalidate(['content'])
    return this.toChallengeDto(saved)
  }

  async updatePodium(input: UpdatePodiumInput): Promise<PodiumDto> {
    const entity = await this.getOrCreatePodium()
    entity.month = input.month
    entity.entries = input.entries.map((entry) => ({
      place: entry.place,
      name: entry.name,
      achievement: entry.achievement,
      photoUrl: entry.photoUrl ?? null,
    }))
    entity.mentions = input.mentions.map((mention) => ({
      name: mention.name,
      achievement: mention.achievement,
    }))
    const saved = await this.podiumRepo.save(entity)
    void this.revalidateService.revalidate(['content'])
    return this.toPodiumDto(saved)
  }

  async updateSchedule(input: UpdateScheduleInput): Promise<ScheduleDto> {
    const entity = await this.getOrCreateSchedule()
    entity.morning = [...input.morning]
    entity.evening = [...input.evening]
    entity.openBoxStart = input.openBox.start
    entity.openBoxEnd = input.openBox.end
    const saved = await this.scheduleRepo.save(entity)
    void this.revalidateService.revalidate(['content'])
    return this.toScheduleDto(saved)
  }

  async updatePlan(key: string, input: UpdatePlanInput): Promise<PlanDto> {
    const entity = await this.planRepo.findOne({ where: { key: key as Plan['key'] } })
    if (!entity) throw new NotFoundException(`Plan "${key}" not found`)
    entity.name = input.name
    entity.tagline = input.tagline
    entity.priceCents = input.priceCents
    entity.unit = input.unit
    entity.features = [...input.features]
    entity.popular = input.popular
    const saved = await this.planRepo.save(entity)
    void this.revalidateService.revalidate(['content'])
    return this.toPlanDto(saved)
  }
}
