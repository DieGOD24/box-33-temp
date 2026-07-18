import { randomUUID } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import type { AppConfig } from '../config/configuration'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
// SVG is intentionally excluded — it can carry scripts.
const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
}

@ApiTags('storage')
@Controller('admin/uploads')
export class StorageController {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_BYTES } }))
  async upload(@UploadedFile() file?: Express.Multer.File): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('No file provided (field name: "file")')
    const ext = ALLOWED[file.mimetype]
    if (!ext) {
      throw new BadRequestException('Unsupported image type — use JPEG, PNG, WebP or AVIF')
    }

    const filename = `${randomUUID()}${ext}`
    const dir = resolve(this.config.get('uploadsDir', { infer: true }))
    await writeFile(join(dir, filename), file.buffer)
    return { url: `/api/uploads/${filename}` }
  }
}
