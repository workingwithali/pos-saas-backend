import { PaymentMethod } from "@prisma/client";
import { IsArray, IsEnum, IsNumber } from "class-validator";

export class CreateSaleDto {
  @IsArray()
  items: {
    productId: string;
    quantity: number;
  }[];

  @IsNumber()
  discountPercent: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
