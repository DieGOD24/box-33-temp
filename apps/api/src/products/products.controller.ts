import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { ProductCategory, ProductGender } from '@box33/types'
import { Public } from '../common/decorators/public.decorator'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@ApiTags('products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── Public catalog ──────────────────────────────────────────────────────────

  @Public()
  @Get('products')
  list(
    @Query('gender') gender?: ProductGender,
    @Query('category') category?: ProductCategory,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.productsService.list({
      gender,
      category,
      q,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    })
  }

  // Declared before :slug so 'featured' never matches as a slug.
  @Public()
  @Get('products/featured')
  featured() {
    return this.productsService.featured()
  }

  @Public()
  @Get('products/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug)
  }

  // ── Admin ───────────────────────────────────────────────────────────────────

  @Get('admin/products')
  adminList(@Query('q') q?: string) {
    return this.productsService.adminList(q)
  }

  @Post('admin/products')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @Patch('admin/products/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto)
  }

  @Delete('admin/products/:id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.remove(id)
  }

  @Patch('admin/products/:id/toggle-stock')
  toggleStock(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.toggleStock(id)
  }
}
