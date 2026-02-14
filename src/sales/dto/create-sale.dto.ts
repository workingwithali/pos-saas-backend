import { PaymentMethod } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsString, Min, ValidateNested } from "class-validator";

class SaleItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsNumber()
  @Min(0)
  discountPercent: number = 0;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
