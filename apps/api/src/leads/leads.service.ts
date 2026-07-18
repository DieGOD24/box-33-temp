import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type { CreateLeadInput, Lead as LeadRecord, Paginated } from '@box33/types'
import { Lead } from './entities/lead.entity'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

@Injectable()
export class LeadsService {
  constructor(@InjectRepository(Lead) private readonly leads: Repository<Lead>) {}

  async create(input: CreateLeadInput): Promise<LeadRecord> {
    const saved = await this.leads.save(this.leads.create(input))
    return this.serialize(saved)
  }

  async list(page = 1, limit = DEFAULT_LIMIT): Promise<Paginated<LeadRecord>> {
    const safePage = Math.max(1, Math.floor(page))
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)))
    const [items, total] = await this.leads.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    })
    return {
      items: items.map((l) => this.serialize(l)),
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    }
  }

  async clear(): Promise<void> {
    await this.leads.createQueryBuilder().delete().execute()
  }

  private serialize(lead: Lead): LeadRecord {
    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      goal: lead.goal as LeadRecord['goal'],
      createdAt: lead.createdAt.toISOString(),
    }
  }
}
