import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'
import type { CartLineInput, CheckoutCustomerInput, CheckoutInput } from '@box33/types'

export class CartLineDto implements CartLineInput {
  @IsUUID()
  productId: string

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number

  @IsOptional()
  @IsString()
  @MaxLength(8)
  size?: string | null
}

export class CheckoutCustomerDto implements CheckoutCustomerInput {
  @IsString()
  @Length(2, 80)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @Length(7, 20)
  phone: string
}

export class CheckoutDto implements CheckoutInput {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CartLineDto)
  items: CartLineDto[]

  @ValidateNested()
  @Type(() => CheckoutCustomerDto)
  customer: CheckoutCustomerDto
}
